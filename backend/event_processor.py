import logging
import queue
import threading
import time
from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict, List

from backend.config import get_use_case
from backend.db import (
    find_recent_event,
    increment_video_failed,
    increment_video_processed,
    insert_chunk_summary,
    insert_event,
    maybe_mark_video_complete,
)

logger = logging.getLogger(__name__)

CRITICAL_KEYWORDS = {
    "medical",
    "emergency",
    "assault",
    "weapon",
    "fire",
    "smoke",
    "collision",
    "crash",
    "hit",
    "injury",
    "gun",
    "knife",
}
HUMAN_KEYWORDS = {
    "child",
    "kid",
    "infant",
    "toddler",
    "person",
    "pedestrian",
    "human",
    "man",
    "woman",
    "people",
    "student",
    "elderly",
    "injured",
    "unconscious",
}
ELEVATED_KEYWORDS = {
    "unsafe",
    "fight",
    "intrusion",
    "trespass",
    "theft",
    "vandalism",
}


def _infer_severity(event_type: str | None, description: str | None) -> str:
    text = f"{event_type or ''} {description or ''}".lower()
    if any(keyword in text for keyword in HUMAN_KEYWORDS):
        return "high"
    if any(keyword in text for keyword in CRITICAL_KEYWORDS):
        return "high"
    if any(keyword in text for keyword in ELEVATED_KEYWORDS):
        return "medium"
    return "low"


@dataclass
class ChunkTask:
    video_id: str
    chunk_path: str
    chunk_filename: str
    chunk_index: int
    timestamp_start: float
    timestamp_end: float
    use_case: str
    total_chunks: int


class AlertBroker:
    def __init__(self, max_queue_size: int = 100):
        self._subscribers: List[queue.Queue] = []
        self._lock = threading.Lock()
        self._max_queue_size = max_queue_size

    def subscribe(self) -> queue.Queue:
        q: queue.Queue = queue.Queue(maxsize=self._max_queue_size)
        with self._lock:
            self._subscribers.append(q)
        return q

    def unsubscribe(self, q: queue.Queue):
        with self._lock:
            if q in self._subscribers:
                self._subscribers.remove(q)

    def publish(self, event: Dict[str, Any]):
        with self._lock:
            for q in list(self._subscribers):
                try:
                    q.put_nowait(event)
                except queue.Full:
                    # Drop if subscriber is too slow
                    continue


class EventProcessor:
    def __init__(self, analyzer, alert_broker: AlertBroker):
        self.analyzer = analyzer
        self.alert_broker = alert_broker
        self.queue: queue.Queue[ChunkTask] = queue.Queue(maxsize=500)
        self.stop_event = threading.Event()
        self.thread: threading.Thread | None = None

    def start(self):
        if self.thread and self.thread.is_alive():
            return
        self.stop_event.clear()
        self.thread = threading.Thread(target=self._worker, daemon=True)
        self.thread.start()

    def stop(self):
        self.stop_event.set()

    def clear_queue(self):
        while True:
            try:
                self.queue.get_nowait()
                self.queue.task_done()
            except queue.Empty:
                break

    def enqueue(self, task: ChunkTask):
        self.queue.put(task)

    def _worker(self):
        while not self.stop_event.is_set():
            try:
                task: ChunkTask = self.queue.get(timeout=1)
            except queue.Empty:
                continue

            try:
                logger.info(
                    "Analyzing chunk %s for video %s",
                    task.chunk_filename,
                    task.video_id,
                )
                use_case = get_use_case(task.use_case)
                analysis = self.analyzer.analyze_chunk(task.chunk_path, use_case)
                if isinstance(analysis, dict):
                    events = analysis.get("events", [])
                    summary = analysis.get("summary", "")
                    analysis_failed = analysis.get("analysis_failed")
                else:
                    # Backward-compatible: analyzer used to return just a list of events.
                    events = analysis if isinstance(analysis, list) else []
                    summary = ""
                    analysis_failed = None

                if analysis_failed:
                    increment_video_failed(task.video_id)

                for event in events:
                    event_type = event.get("event_type")
                    if find_recent_event(
                        task.video_id,
                        event_type,
                        float(task.timestamp_start),
                    ):
                        continue
                    description = event.get("description", "")
                    event_doc = {
                        "video_id": task.video_id,
                        "chunk_filename": task.chunk_filename,
                        "chunk_index": task.chunk_index,
                        "timestamp_start": task.timestamp_start,
                        "timestamp_end": task.timestamp_end,
                        "event_type": event_type,
                        "event_description": description,
                        "confidence": event.get("confidence", 0.0),
                        "explanation": event.get("explanation", ""),
                        "status": "pending_review",
                        "severity": _infer_severity(event_type, description),
                        "reviewer_notes": None,
                        "detected_at": datetime.utcnow(),
                        "reviewed_at": None,
                    }
                    inserted_id = insert_event(event_doc)
                    event_doc["id"] = str(inserted_id)
                    self.alert_broker.publish(event_doc)

                if summary:
                    summary_doc = {
                        "video_id": task.video_id,
                        "chunk_filename": task.chunk_filename,
                        "chunk_index": task.chunk_index,
                        "timestamp_start": task.timestamp_start,
                        "timestamp_end": task.timestamp_end,
                        "summary": summary,
                        "detected_at": datetime.utcnow(),
                    }
                    insert_chunk_summary(summary_doc)
            except Exception:
                # swallow errors to keep worker alive
                logger.exception("Error processing chunk %s", task.chunk_filename)
                time.sleep(0.25)
            finally:
                processed = increment_video_processed(task.video_id)
                if processed is not None:
                    maybe_mark_video_complete(task.video_id, processed, task.total_chunks)
                self.queue.task_done()
