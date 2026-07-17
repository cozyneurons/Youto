"""Unit tests for youtube_service helpers (no network calls required)."""
from app.utils.helpers import format_duration, extract_video_id, build_thumbnail_url
from app.utils.validators import is_valid_youtube_url


def test_format_duration_zero():
    assert format_duration(0) == "0:00"


def test_format_duration_minutes():
    assert format_duration(65) == "1:05"


def test_format_duration_hours():
    assert format_duration(3661) == "1:01:01"


def test_extract_video_id_standard():
    assert extract_video_id("https://www.youtube.com/watch?v=dQw4w9WgXcQ") == "dQw4w9WgXcQ"


def test_extract_video_id_short():
    assert extract_video_id("https://youtu.be/dQw4w9WgXcQ") == "dQw4w9WgXcQ"


def test_build_thumbnail_url():
    url = build_thumbnail_url("abc123")
    assert "abc123" in url
    assert "hqdefault" in url


def test_valid_youtube_playlist_url():
    assert is_valid_youtube_url("https://www.youtube.com/playlist?list=PLxxxxxx")


def test_invalid_url():
    assert not is_valid_youtube_url("https://vimeo.com/12345")
