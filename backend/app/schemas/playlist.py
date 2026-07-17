from pydantic import BaseModel


class PlaylistExtractRequest(BaseModel):
    youtube_url: str
