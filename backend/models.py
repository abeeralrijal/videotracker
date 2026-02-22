from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class StartMonitoringRequest(BaseModel):
    video_id: str
    use_case: Optional[str] = None
    chunk_duration_seconds: Optional[int] = Field(default=None, ge=2, le=60)


class ReviewRequest(BaseModel):
    status: str
    severity: Optional[str] = None
    reviewer_notes: Optional[str] = None


class SearchRequest(BaseModel):
    query: str
    limit: int = Field(default=10, ge=1, le=100)
    status: Optional[str] = None
    event_type: Optional[str] = None
    video_id: Optional[str] = None
    mode: Optional[str] = Field(default="monitor", description="monitor or ask")


class UploadResponse(BaseModel):
    video_id: str
    filename: str
    use_case: str
    status: str


class EventOut(BaseModel):
    id: str
    video_id: str
    chunk_filename: str
    chunk_index: int
    timestamp_start: float
    timestamp_end: float
    event_type: str
    event_description: Optional[str] = None
    confidence: float
    explanation: str
    status: str
    severity: Optional[str]
    reviewer_notes: Optional[str]
    detected_at: datetime
    reviewed_at: Optional[datetime]


class UseCaseOut(BaseModel):
    key: str
    name: str
    events: List[str]
    context: str
