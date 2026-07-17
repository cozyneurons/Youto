def format_duration(seconds: int) -> str:
    """Convert total seconds to a human-readable string (H:MM:SS or M:SS)."""
    if not seconds:
        return "0:00"
    hours, remainder = divmod(int(seconds), 3600)
    minutes, secs = divmod(remainder, 60)
    if hours:
        return f"{hours}:{minutes:02d}:{secs:02d}"
    return f"{minutes}:{secs:02d}"


def extract_video_id(url: str) -> str:
    """Parse a YouTube video ID from any standard URL format."""
    import re
    m = re.search(r"(?:v=|youtu\.be/|embed/)([a-zA-Z0-9_-]{11})", url)
    return m.group(1) if m else ""


def build_thumbnail_url(video_id: str, quality: str = "hqdefault") -> str:
    return f"https://img.youtube.com/vi/{video_id}/{quality}.jpg"


def chunk_list(lst: list, size: int) -> list:
    """Split a list into chunks of `size`."""
    return [lst[i : i + size] for i in range(0, len(lst), size)]
