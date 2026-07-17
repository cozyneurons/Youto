"""
YouTube playlist/video extraction using yt-dlp.
No API key required — works with any public YouTube playlist URL.
"""
from __future__ import annotations

import re
from typing import Any, Dict, List

import yt_dlp

from app.utils.logger import logger


def extract_playlist_info(url: str) -> Dict[str, Any]:
    """
    Extract all video metadata and playlist details from a YouTube playlist URL.
    Returns a dict with 'title', 'description', and 'videos' (sorted by playlist order).
    """
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": "in_playlist",  # metadata only, no download
        "ignoreerrors": True,
        "skip_download": True,
    }

    videos: List[Dict[str, Any]] = []
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)
        if not info:
            raise ValueError("yt-dlp returned no info for the given URL")

        entries = info.get("entries")
        if entries is None:
            if info.get("id"):
                entries = [info]
            else:
                entries = []
        for idx, entry in enumerate(entries):
            if not entry:
                continue

            video_id = entry.get("id", "")
            title = entry.get("title") or f"Video {idx + 1}"
            duration = entry.get("duration") or 0
            thumbnail = (
                entry.get("thumbnail")
                or (f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg" if video_id else "")
            )

            videos.append(
                {
                    "order_index": idx,
                    "video_id": video_id,
                    "title": title,
                    "description": entry.get("description") or "",
                    "video_url": f"https://www.youtube.com/watch?v={video_id}",
                    "duration": int(duration),
                    "thumbnail_url": thumbnail,
                }
            )

    return {
        "title": info.get("title") or "YouTube Course",
        "description": info.get("description") or "",
        "videos": videos,
    }


def extract_video_metadata(url: str) -> Dict[str, Any]:
    """Return full metadata dict for a single YouTube video."""
    ydl_opts = {"quiet": True, "no_warnings": True, "skip_download": True}
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        return ydl.extract_info(url, download=False) or {}


def get_captions(video_id: str) -> str:
    """
    Attempt to fetch auto-generated English captions for a video using youtube-transcript-api.
    If English isn't natively available, it fetches the first available transcript and translates it.
    If that fails due to YouTube consent/bot walls, it falls back to parsing JSON3 via yt-dlp.
    Returns the raw text, or an empty string if unavailable.
    """
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
        transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
        
        try:
            transcript = transcript_list.find_transcript(['en', 'en-US', 'en-GB'])
        except Exception:
            first_available = next(iter(transcript_list))
            transcript = first_available.translate('en')

        data = transcript.fetch()
        return " ".join([t['text'] for t in data]).replace("\n", " ")
    except Exception as exc:
        logger.warning("youtube-transcript-api failed for %s: %s. Attempting yt-dlp fallback...", video_id, exc)
        try:
            import yt_dlp
            import httpx
            ydl_opts = {
                'quiet': True, 
                'no_warnings': True,
                'skip_download': True, 
                'writeautomaticsub': True,
                'writesubtitles': True,
                'subtitleslangs': ['en', 'en-US', 'en-GB'], 
                'subtitlesformat': 'json3'
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
                
                # Check manual subtitles first, then automatic
                subs = info.get('subtitles', {}).get('en', [])
                if not subs:
                    subs = info.get('automatic_captions', {}).get('en', [])
                
                url = next((s['url'] for s in subs if s['ext'] == 'json3'), None)
                if url:
                    resp = httpx.get(url, timeout=15.0)
                    data = resp.json()
                    events = data.get('events', [])
                    text = ' '.join([''.join([seg.get('utf8', '') for seg in ev.get('segs', [])]) for ev in events])
                    return text.replace('\n', ' ').strip()
        except Exception as yt_exc:
            logger.error("yt-dlp fallback failed for %s: %s", video_id, yt_exc)
            
        return ""


def get_thumbnail(video_id: str) -> str:
    """Return the high-quality thumbnail URL for a YouTube video."""
    return f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"


def extract_video_id_from_url(url: str) -> str:
    """Parse a YouTube video ID from various URL formats."""
    patterns = [
        r"(?:v=|youtu\.be/|embed/)([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        m = re.search(pattern, url)
        if m:
            return m.group(1)
    return ""
