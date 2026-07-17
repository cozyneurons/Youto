from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    course_id: Optional[int]
    message: str
    type: str
    is_read: bool
    created_at: datetime
