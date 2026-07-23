from pydantic import BaseModel, ConfigDict
from typing import List, Optional

class CourseShareResponse(BaseModel):
    id: int
    token: str
    course_id: int
    owner_id: int
    friend_id: Optional[int]

    model_config = ConfigDict(from_attributes=True)

class FriendProgress(BaseModel):
    user_id: int
    name: str
    avatar_url: Optional[str]
    active_index: int
