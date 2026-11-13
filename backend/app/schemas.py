from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class VideoType(str, Enum):
    youtube_long = "youtube_long"
    youtube_short = "youtube_short"
    instagram_reel = "instagram_reel"
    tiktok = "tiktok"


class AspectRatio(str, Enum):
    landscape = "16:9"
    portrait = "9:16"
    square = "1:1"


class ProjectStatus(str, Enum):
    draft = "draft"
    in_progress = "in_progress"
    completed = "completed"
    failed = "failed"


class ProjectCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    video_type: VideoType
    aspect_ratio: AspectRatio

    @field_validator("title")
    @classmethod
    def strip_title(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("title must not be blank")
        return v


class ProjectUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)
    video_type: VideoType | None = None
    aspect_ratio: AspectRatio | None = None
    status: ProjectStatus | None = None


class ProjectOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    title: str
    description: str | None
    video_type: VideoType
    aspect_ratio: AspectRatio
    status: ProjectStatus
    created_at: datetime
    updated_at: datetime
