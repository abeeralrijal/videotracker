import os
from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from pymongo import ASCENDING, MongoClient, TEXT, ReturnDocument

_client: MongoClient | None = None
_db = None


def init_db(uri: str, db_name: str):
    global _client, _db
    if _client is None:
        _client = MongoClient(uri)
        _db = _client[db_name]

        _db.videos.create_index([("upload_time", ASCENDING)])
        _db.events.create_index(
            [("event_type", TEXT), ("explanation", TEXT), ("event_description", TEXT)]
        )
        _db.events.create_index([("video_id", ASCENDING), ("chunk_index", ASCENDING)])
        _db.chunk_summaries.create_index([("summary", TEXT)])
        _db.chunk_summaries.create_index(
            [("video_id", ASCENDING), ("chunk_index", ASCENDING)]
        )

    return _db


def get_db():
    if _db is None:
        raise RuntimeError("Database not initialized")
    return _db


def _now():
    return datetime.utcnow()


def create_video(
    filename: str,
    filepath: str,
    use_case: str,
    original_name: str,
) -> ObjectId:
    db = get_db()
    doc = {
        "filename": filename,
        "filepath": filepath,
        "original_name": original_name,
        "use_case": use_case,
        "status": "uploaded",
        "upload_time": _now(),
        "chunk_count": 0,
        "chunks_processed": 0,
        "chunks_failed": 0,
    }
    result = db.videos.insert_one(doc)
    return result.inserted_id


def update_video(video_id: ObjectId, fields: Dict[str, Any]) -> None:
    db = get_db()
    db.videos.update_one({"_id": video_id}, {"$set": fields})


def increment_video_processed(video_id: str) -> Optional[int]:
    db = get_db()
    result = db.videos.find_one_and_update(
        {"_id": ObjectId(video_id)},
        {"$inc": {"chunks_processed": 1}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        return None
    return int(result.get("chunks_processed", 0))


def increment_video_failed(video_id: str) -> Optional[int]:
    db = get_db()
    result = db.videos.find_one_and_update(
        {"_id": ObjectId(video_id)},
        {"$inc": {"chunks_failed": 1}},
        return_document=ReturnDocument.AFTER,
    )
    if not result:
        return None
    return int(result.get("chunks_failed", 0))


def maybe_mark_video_complete(video_id: str, processed: int, total: int) -> None:
    if total <= 0:
        return
    if processed >= total:
        db = get_db()
        db.videos.update_one(
            {"_id": ObjectId(video_id)},
            {"$set": {"status": "complete"}},
        )


def get_video(video_id: ObjectId) -> Optional[Dict[str, Any]]:
    db = get_db()
    return db.videos.find_one({"_id": video_id})


def list_events(filters: Dict[str, Any], limit: int = 100) -> List[Dict[str, Any]]:
    db = get_db()
    cursor = db.events.find(filters).sort("detected_at", -1).limit(limit)
    return list(cursor)


def insert_event(event: Dict[str, Any]) -> ObjectId:
    db = get_db()
    result = db.events.insert_one(event)
    return result.inserted_id


def update_event(event_id: ObjectId, fields: Dict[str, Any]) -> None:
    db = get_db()
    db.events.update_one({"_id": event_id}, {"$set": fields})


def get_event(event_id: ObjectId) -> Optional[Dict[str, Any]]:
    db = get_db()
    return db.events.find_one({"_id": event_id})


def search_events(query: str, filters: Dict[str, Any], limit: int = 10):
    db = get_db()
    base_filter: Dict[str, Any] = {"$text": {"$search": query}}
    if filters:
        base_filter.update(filters)
    cursor = db.events.find(base_filter).sort("detected_at", -1).limit(limit)
    return list(cursor)


def find_recent_event(
    video_id: str,
    event_type: str,
    timestamp_start: float,
    window_seconds: float = 8.0,
) -> Optional[Dict[str, Any]]:
    db = get_db()
    if not video_id or not event_type:
        return None
    return db.events.find_one(
        {
            "video_id": video_id,
            "event_type": event_type,
            "timestamp_start": {
                "$gte": max(0.0, timestamp_start - window_seconds),
                "$lte": timestamp_start + window_seconds,
            },
        }
    )


def insert_chunk_summary(summary: Dict[str, Any]) -> ObjectId:
    db = get_db()
    result = db.chunk_summaries.insert_one(summary)
    return result.inserted_id


def list_chunk_summaries(filters: Dict[str, Any], limit: int = 50) -> List[Dict[str, Any]]:
    db = get_db()
    cursor = db.chunk_summaries.find(filters).sort("detected_at", -1).limit(limit)
    return list(cursor)


def search_chunk_summaries(query: str, filters: Dict[str, Any], limit: int = 10):
    db = get_db()
    base_filter: Dict[str, Any] = {"$text": {"$search": query}}
    if filters:
        base_filter.update(filters)
    cursor = db.chunk_summaries.find(base_filter).sort("detected_at", -1).limit(limit)
    return list(cursor)


def to_object_id(value: str) -> ObjectId:
    return ObjectId(value)
