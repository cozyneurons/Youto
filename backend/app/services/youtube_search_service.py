"""
YouTube Data API v3 playlist search.
Returns the top playlists for a given topic and level.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional

import httpx

from app.config import settings
from app.utils.logger import logger

YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search"
YT_PLAYLIST_URL = "https://www.googleapis.com/youtube/v3/playlists"


def search_playlists(topic: str, level: str, max_results: int = 5) -> List[Dict[str, Any]]:
    """
    Search YouTube for playlists matching topic + level.
    Returns a condensed list with title, description, channelTitle, playlistUrl, thumbnail.
    Returns an empty list and logs a warning if API key is missing or request fails.
    """
    api_key = settings.YOUTUBE_API_KEY
    if not api_key or api_key == "your-youtube-data-api-key-here":
        logger.warning("YOUTUBE_API_KEY not configured — skipping YouTube search")
        return []

    query = f"{topic} {level} full course playlist"
    try:
        resp = httpx.get(
            YT_SEARCH_URL,
            params={
                "part": "snippet",
                "type": "playlist",
                "q": query,
                "maxResults": max_results,
                "order": "relevance",
                "key": api_key,
            },
            timeout=10,
        )
        resp.raise_for_status()
        items = resp.json().get("items", [])
    except Exception as exc:
        logger.error("YouTube search failed: %s", exc)
        return []

    results: List[Dict[str, Any]] = []
    for item in items:
        playlist_id = item.get("id", {}).get("playlistId")
        snippet = item.get("snippet", {})
        if not playlist_id:
            continue
        results.append({
            "playlist_id": playlist_id,
            "title": snippet.get("title", ""),
            "description": snippet.get("description", "")[:300],
            "channel": snippet.get("channelTitle", ""),
            "thumbnail": (snippet.get("thumbnails", {}).get("high") or
                          snippet.get("thumbnails", {}).get("default") or {}).get("url", ""),
            "playlist_url": f"https://www.youtube.com/playlist?list={playlist_id}",
        })

    return results
