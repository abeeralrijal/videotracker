import asyncio
import json
import os
import re
import threading
from datetime import datetime
from uuid import uuid4
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from sse_starlette.sse import EventSourceResponse

from backend.config import DEFAULT_USE_CASE, USE_CASES, get_use_case
from backend.db import (
    create_video,
    get_db,
    get_video,
    get_event,
    init_db,
    list_events,
    list_chunk_summaries,
    search_chunk_summaries,
    search_events,
    to_object_id,
    update_event,
    update_video,
)
from backend.event_processor import AlertBroker, ChunkTask, EventProcessor
from backend.models import (
    EventOut,
    ReviewRequest,
    SearchRequest,
    StartMonitoringRequest,
    UploadResponse,
    UseCaseOut,
)
from backend.video_analyzer import GeminiVisionAnalyzer
from backend.video_chunker import get_video_duration_seconds, split_video_to_chunks

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(dotenv_path=BASE_DIR / ".env")
DATA_DIR = BASE_DIR / "data"
UPLOAD_DIR = DATA_DIR / "uploads"
CHUNKS_DIR = DATA_DIR / "chunks"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
CHUNKS_DIR.mkdir(parents=True, exist_ok=True)

MONGODB_URI = os.getenv("MONGODB_URI", "")
MONGODB_DB = os.getenv("MONGODB_DB", "sentinelai")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
DEFAULT_CHUNK_DURATION = int(os.getenv("CHUNK_DURATION_SECONDS", "6"))

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set")

init_db(MONGODB_URI, MONGODB_DB)

app = FastAPI(title="SentinelAI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

alert_broker = AlertBroker()
analyzer = GeminiVisionAnalyzer(api_key=GEMINI_API_KEY, model_name=GEMINI_MODEL)
processor = EventProcessor(analyzer=analyzer, alert_broker=alert_broker)
processor.start()

active_jobs: Dict[str, threading.Thread] = {}
active_jobs_lock = threading.Lock()


def serialize_event(doc: Dict[str, Any]) -> Dict[str, Any]:
    result = dict(doc)
    if "_id" in result:
        result["id"] = str(result.pop("_id"))
    if "detected_at" in result and result["detected_at"]:
        result["detected_at"] = result["detected_at"].isoformat()
    if "reviewed_at" in result and result["reviewed_at"]:
        result["reviewed_at"] = result["reviewed_at"].isoformat()
    return result


def serialize_events(docs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [serialize_event(doc) for doc in docs]


def _format_timestamp(seconds: float | int | None) -> str:
    if seconds is None:
        return "0:00"
    total = int(seconds)
    minutes = total // 60
    secs = total % 60
    return f"{minutes}:{secs:02d}"


def _title_case(value: str) -> str:
    return " ".join(word.capitalize() for word in value.replace("_", " ").split())


def _build_search_answer(query: str, results: List[Dict[str, Any]]) -> str:
    if not query:
        return "Showing most recent detected events."
    if not results:
        return "No matching events detected yet. Try again after processing finishes or refine your query."
    top = results[:3]
    snippets = []
    for event in top:
        event_type = event.get("event_type") or "event"
        timestamp = _format_timestamp(event.get("timestamp_start"))
        snippets.append(f"{event_type} @ {timestamp}")
    return f"Found {len(results)} matching events for \"{query}\". Top matches: {', '.join(snippets)}."


def _build_summary_answer(
    query: str,
    results: List[Dict[str, Any]],
    target_seconds: Optional[int] = None,
) -> str:
    if not query:
        return "Ask a question about the footage to get a response."
    if not results:
        if target_seconds is not None:
            target_label = _format_timestamp(target_seconds)
            return f"No processed footage found near {target_label}. Try another timestamp or wait for processing."
        return "No matching moments found yet. Try rephrasing or wait for processing."
    top = results[:3]
    snippets = []
    for item in top:
        timestamp = _format_timestamp(item.get("timestamp_start"))
        summary = (item.get("summary") or "").strip()
        if summary:
            snippets.append(f"{timestamp} — {summary}")
    if not snippets:
        return "Relevant moments were found, but no summaries are available yet."
    if target_seconds is not None:
        target_label = _format_timestamp(target_seconds)
        return f"Most relevant moments near {target_label}: " + " | ".join(snippets)
    return "Most relevant moments: " + " | ".join(snippets)


def _build_time_event_answer(target_seconds: int, events: List[Dict[str, Any]]) -> str:
    target_label = _format_timestamp(target_seconds)
    if not events:
        return f"No incidents detected near {target_label}."
    top = events[:3]
    snippets = []
    for event in top:
        event_type = event.get("event_type") or "event"
        timestamp = _format_timestamp(event.get("timestamp_start"))
        desc = event.get("event_description") or ""
        snippet = f"{timestamp} — {event_type}"
        if desc:
            snippet = f"{snippet}: {desc}"
        snippets.append(snippet)
    return f"Most relevant incidents near {target_label}: " + " | ".join(snippets)


def _extract_timestamp_seconds(query: str) -> Optional[int]:
    patterns = [
        r"(?:^|\\D)(?P<m>\\d{1,2})\\s*[:]\\s*(?P<s>\\d{1,2})(?:\\D|$)",
        r"(?:^|\\D)(?P<m>\\d{1,2})\\s*m(?:in)?\\s*(?P<s>\\d{1,2})\\s*s(?:ec)?(?:\\D|$)",
        r"(?:^|\\D)(?P<s>\\d{1,4})\\s*s(?:ec)?(?:\\D|$)",
    ]
    for pattern in patterns:
        match = re.search(pattern, query, flags=re.IGNORECASE)
        if not match:
            continue
        if "m" in match.groupdict() and match.group("m") is not None:
            minutes = int(match.group("m"))
            seconds = int(match.group("s") or 0)
            return minutes * 60 + seconds
        seconds = int(match.group("s") or 0)
        return seconds
    return None


def _summary_to_event_like(doc: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": str(doc.get("_id", "")),
        "video_id": doc.get("video_id"),
        "chunk_filename": doc.get("chunk_filename"),
        "chunk_index": doc.get("chunk_index"),
        "timestamp_start": doc.get("timestamp_start"),
        "timestamp_end": doc.get("timestamp_end"),
        "event_type": "Context",
        "event_description": doc.get("summary", ""),
        "confidence": doc.get("confidence", 0.0),
        "status": "context",
        "severity": None,
        "reviewer_notes": None,
    }


def _parse_datetime(value: str) -> datetime:
    try:
        return datetime.fromisoformat(value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid datetime: {value}") from exc


def _process_video_job(video_id: str, use_case: str, chunk_duration: int) -> None:
    video = get_video(to_object_id(video_id))
    if not video:
        return

    update_video(to_object_id(video_id), {"status": "processing"})

    chunks_output_dir = CHUNKS_DIR / video_id
    try:
        chunk_paths = split_video_to_chunks(
            video_path=video["filepath"],
            output_dir=str(chunks_output_dir),
            chunk_duration_seconds=chunk_duration,
        )
    except Exception:
        update_video(to_object_id(video_id), {"status": "failed"})
        return

    update_video(
        to_object_id(video_id),
        {"chunk_count": len(chunk_paths), "chunks_processed": 0, "status": "queued"},
    )

    total_chunks = len(chunk_paths)
    for idx, chunk_path in enumerate(chunk_paths):
        chunk_filename = Path(chunk_path).name
        timestamp_start = idx * chunk_duration
        timestamp_end = timestamp_start + chunk_duration

        task = ChunkTask(
            video_id=video_id,
            chunk_path=chunk_path,
            chunk_filename=chunk_filename,
            chunk_index=idx,
            timestamp_start=timestamp_start,
            timestamp_end=timestamp_end,
            use_case=use_case,
            total_chunks=total_chunks,
        )
        processor.enqueue(task)

    update_video(to_object_id(video_id), {"status": "processing_events"})


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/use-cases", response_model=List[UseCaseOut])
async def list_use_cases():
    results = []
    for key, cfg in USE_CASES.items():
        results.append(
            {
                "key": key,
                "name": cfg["name"],
                "events": cfg["events"],
                "context": cfg["context"],
            }
        )
    return results


@app.post("/api/upload", response_model=UploadResponse)
async def upload_video(
    file: UploadFile = File(...),
    use_case: str = Form(DEFAULT_USE_CASE),
):
    if use_case not in USE_CASES:
        raise HTTPException(status_code=400, detail="Invalid use case")

    unique_prefix = uuid4().hex
    filename = f"{unique_prefix}_{file.filename}"
    filepath = UPLOAD_DIR / filename

    with open(filepath, "wb") as f:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            f.write(chunk)

    video_id = create_video(
        filename=filename,
        filepath=str(filepath),
        use_case=use_case,
        original_name=file.filename,
    )

    duration = get_video_duration_seconds(str(filepath))
    update_video(video_id, {"duration_seconds": duration})

    return UploadResponse(
        video_id=str(video_id),
        filename=filename,
        use_case=use_case,
        status="uploaded",
    )


@app.post("/api/start-monitoring")
async def start_monitoring(request: StartMonitoringRequest):
    try:
        get_use_case(request.use_case or DEFAULT_USE_CASE)
    except KeyError:
        raise HTTPException(status_code=400, detail="Invalid use case")

    video = get_video(to_object_id(request.video_id))
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")

    use_case = request.use_case or video.get("use_case", DEFAULT_USE_CASE)
    chunk_duration = request.chunk_duration_seconds or DEFAULT_CHUNK_DURATION

    with active_jobs_lock:
        if request.video_id in active_jobs:
            raise HTTPException(status_code=409, detail="Monitoring already started")

        t = threading.Thread(
            target=_process_video_job,
            args=(request.video_id, use_case, chunk_duration),
            daemon=True,
        )
        active_jobs[request.video_id] = t
        t.start()

    return {"status": "started", "video_id": request.video_id}


@app.post("/api/stop-monitoring")
async def stop_monitoring(video_id: Optional[str] = None):
    processor.clear_queue()
    if video_id:
        update_video(to_object_id(video_id), {"status": "stopped"})
        with active_jobs_lock:
            active_jobs.pop(video_id, None)
    return {"status": "stopped"}


@app.get("/api/status")
async def status():
    return {
        "queue_size": processor.queue.qsize(),
        "active_jobs": list(active_jobs.keys()),
    }


@app.get("/api/analytics")
async def analytics(
    from_date: Optional[str] = None,
    to_date: Optional[str] = None,
    video_id: Optional[str] = None,
):
    filters: Dict[str, Any] = {}
    if video_id:
        filters["video_id"] = video_id
    if from_date or to_date:
        time_filter: Dict[str, Any] = {}
        if from_date:
            time_filter["$gte"] = _parse_datetime(from_date)
        if to_date:
            time_filter["$lte"] = _parse_datetime(to_date)
        filters["detected_at"] = time_filter

    db = get_db()
    total = db.events.count_documents(filters)
    confirmed = db.events.count_documents({**filters, "status": "confirmed"})
    dismissed = db.events.count_documents({**filters, "status": "dismissed"})

    avg_conf = 0.0
    if total > 0:
        agg = list(
            db.events.aggregate(
                [
                    {"$match": filters},
                    {"$group": {"_id": None, "avg": {"$avg": "$confidence"}}},
                ]
            )
        )
        if agg:
            avg_conf = float(agg[0].get("avg") or 0.0)

    denom = confirmed + dismissed
    ai_accuracy = (confirmed / denom) if denom > 0 else 0.0

    event_stats = []
    pipeline = [
        {"$match": filters},
        {
            "$group": {
                "_id": "$event_type",
                "count": {"$sum": 1},
                "confirmed": {
                    "$sum": {
                        "$cond": [{"$eq": ["$status", "confirmed"]}, 1, 0]
                    }
                },
                "dismissed": {
                    "$sum": {
                        "$cond": [{"$eq": ["$status", "dismissed"]}, 1, 0]
                    }
                },
            }
        },
    ]
    for row in db.events.aggregate(pipeline):
        row_confirmed = int(row.get("confirmed") or 0)
        row_dismissed = int(row.get("dismissed") or 0)
        row_denom = row_confirmed + row_dismissed
        accuracy = int(round((row_confirmed / row_denom) * 100)) if row_denom > 0 else 0
        event_type = row.get("_id") or "unknown"
        event_stats.append(
            {
                "eventType": _title_case(str(event_type)),
                "count": int(row.get("count") or 0),
                "confirmed": row_confirmed,
                "accuracy": accuracy,
            }
        )

    event_stats.sort(key=lambda item: item["count"], reverse=True)

    return {
        "summary": {
            "totalEvents": int(total),
            "confirmed": int(confirmed),
            "dismissed": int(dismissed),
            "aiAccuracy": int(round(ai_accuracy * 100)),
            "avgConfidence": int(round(avg_conf * 100)),
        },
        "eventStats": event_stats,
    }


@app.get("/api/videos/{video_id}")
async def get_video_info(video_id: str):
    video = get_video(to_object_id(video_id))
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    return {
        "id": str(video["_id"]),
        "filename": video.get("filename"),
        "original_name": video.get("original_name"),
        "use_case": video.get("use_case"),
        "status": video.get("status"),
        "chunk_count": video.get("chunk_count", 0),
        "chunks_processed": video.get("chunks_processed", 0),
        "duration_seconds": video.get("duration_seconds", 0),
        "source_url": f"/api/videos/{video_id}/source",
    }


@app.get("/api/videos/{video_id}/processing")
async def get_processing(video_id: str):
    video = get_video(to_object_id(video_id))
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    total = int(video.get("chunk_count", 0) or 0)
    done = int(video.get("chunks_processed", 0) or 0)
    failed = int(video.get("chunks_failed", 0) or 0)
    progress = int((done / total) * 100) if total > 0 else 0
    return {
        "progress": progress,
        "chunksAnalyzed": done,
        "totalChunks": total,
        "failedChunks": failed,
    }


@app.get("/api/videos/{video_id}/source")
async def get_video_source(video_id: str):
    video = get_video(to_object_id(video_id))
    if not video:
        raise HTTPException(status_code=404, detail="Video not found")
    path = Path(video.get("filepath", ""))
    if not path.exists():
        raise HTTPException(status_code=404, detail="Source file not found")
    return FileResponse(path=str(path), media_type="video/mp4")


@app.get("/api/events", response_model=List[EventOut])
async def get_events(
    status: Optional[str] = None,
    event_type: Optional[str] = None,
    video_id: Optional[str] = None,
    limit: int = 50,
):
    filters: Dict[str, Any] = {}
    if status:
        filters["status"] = status
    if event_type:
        filters["event_type"] = event_type
    if video_id:
        filters["video_id"] = video_id

    events = list_events(filters, limit=limit)
    return serialize_events(events)


@app.get("/api/events/stream")
async def stream_events():
    subscriber = alert_broker.subscribe()

    async def event_generator():
        try:
            while True:
                data = await asyncio.to_thread(subscriber.get)
                yield {
                    "event": "alert",
                    "data": json.dumps(serialize_event(data)),
                }
        finally:
            alert_broker.unsubscribe(subscriber)

    return EventSourceResponse(event_generator())


@app.post("/api/events/{event_id}/review")
async def review_event(event_id: str, review: ReviewRequest):
    fields: Dict[str, Any] = {
        "status": review.status,
        "severity": review.severity,
        "reviewer_notes": review.reviewer_notes,
        "reviewed_at": datetime.utcnow(),
    }
    update_event(to_object_id(event_id), fields)
    updated = get_event(to_object_id(event_id))
    if not updated:
        raise HTTPException(status_code=404, detail="Event not found")
    return serialize_event(updated)


@app.post("/api/search")
async def search(request: SearchRequest):
    filters: Dict[str, Any] = {}
    if request.status:
        filters["status"] = request.status
    if request.event_type:
        filters["event_type"] = request.event_type
    if request.video_id:
        filters["video_id"] = request.video_id

    query = (request.query or "").strip()
    results: List[Dict[str, Any]] = []
    mode = (request.mode or "monitor").lower()
    target_seconds = _extract_timestamp_seconds(query) if query else None

    summary_hits: List[Dict[str, Any]] = []
    event_hits: List[Dict[str, Any]] = []
    time_event_hits: List[Dict[str, Any]] = []

    if query:
        tokens = [t for t in re.split(r"\\W+", query) if t]
        regex = "|".join(re.escape(token) for token in tokens) if tokens else None

        if target_seconds is not None and request.video_id:
            window = 15
            time_filter: Dict[str, Any] = {
                "timestamp_start": {
                    "$gte": max(0, target_seconds - window),
                    "$lte": target_seconds + window,
                }
            }
            summary_hits = list_chunk_summaries(
                {**filters, **time_filter},
                limit=request.limit,
            )
            summary_hits.sort(
                key=lambda item: abs((item.get("timestamp_start") or 0) - target_seconds)
            )
            time_event_hits = list_events(
                {**filters, **time_filter},
                limit=request.limit,
            )
        else:
            try:
                summary_hits = search_chunk_summaries(
                    query, filters, limit=request.limit
                )
            except Exception:
                summary_hits = []

            if not summary_hits and regex:
                regex_filter = {"summary": {"$regex": regex, "$options": "i"}}
                summary_hits = list_chunk_summaries(
                    {**filters, **regex_filter},
                    limit=request.limit,
                )

        try:
            event_hits = search_events(query, filters, limit=request.limit)
        except Exception:
            event_hits = []
        if not event_hits:
            if regex:
                regex_filter = {
                    "$or": [
                        {"event_type": {"$regex": regex, "$options": "i"}},
                        {"event_description": {"$regex": regex, "$options": "i"}},
                        {"explanation": {"$regex": regex, "$options": "i"}},
                    ]
                }
                event_hits = list_events(
                    {**filters, **regex_filter},
                    limit=request.limit,
                )

        if not summary_hits and request.video_id:
            summary_hits = list_chunk_summaries(filters, limit=request.limit)
    else:
        event_hits = list_events(filters, limit=request.limit)

    # Merge in time-based events (if any) without duplicates
    if time_event_hits:
        seen_ids = {str(item.get("_id")) for item in event_hits if item.get("_id")}
        for item in time_event_hits:
            item_id = str(item.get("_id")) if item.get("_id") else None
            if item_id and item_id in seen_ids:
                continue
            event_hits.append(item)

    summary_results = [_summary_to_event_like(doc) for doc in summary_hits]
    serialized_events = serialize_events(event_hits)
    serialized_summaries = serialize_events(summary_results)

    if mode == "ask":
        results = serialized_summaries + serialized_events
    else:
        results = serialized_events + serialized_summaries

    if len(results) > request.limit:
        results = results[: request.limit]

    if summary_hits:
        answer = _build_summary_answer(query, summary_hits, target_seconds)
    elif target_seconds is not None and time_event_hits:
        answer = _build_time_event_answer(target_seconds, time_event_hits)
    else:
        answer = _build_search_answer(query, event_hits)

    return {
        "answer": answer,
        "results": results,
    }


@app.get("/api/video/{video_id}/{chunk_filename}")
async def get_chunk(video_id: str, chunk_filename: str):
    path = CHUNKS_DIR / video_id / chunk_filename
    if not path.exists():
        raise HTTPException(status_code=404, detail="Chunk not found")
    return FileResponse(path=str(path), media_type="video/mp4")


@app.exception_handler(RuntimeError)
async def runtime_error_handler(_, exc: RuntimeError):
    return JSONResponse(status_code=500, content={"detail": str(exc)})
