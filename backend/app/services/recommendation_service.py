"""
AI Recommendation Service.
Bundles Reddit sentiment + YouTube playlist data and sends it to
the Gemini API (via google-generativeai SDK) to return a structured
playlist recommendation with justification.
"""
from __future__ import annotations

import json
import re
from typing import Any, Dict, List, Optional

import google.generativeai as genai

from app.config import settings
from app.services.reddit_service import get_reddit_sentiment
from app.services.youtube_search_service import search_playlists
from app.utils.logger import logger


def _configure_gemini() -> Optional[genai.GenerativeModel]:
    api_key = settings.GEMINI_API_KEY
    if not api_key or api_key.strip().startswith("your-"):
        logger.warning("GEMINI_API_KEY not configured")
        return None
    genai.configure(api_key=api_key)
    return genai.GenerativeModel("gemini-3.1-flash-lite")


def _build_prompt(topic: str, level: str, reddit_posts: List[Dict], yt_playlists: List[Dict]) -> str:
    if reddit_posts:
        reddit_section_text = f"""
## Community Sentiment (live scraped top community posts about {topic} courses/playlists):
Each post includes: title, upvote score, comment count, community, and the post body text.
{json.dumps(reddit_posts, indent=2)}
"""
        reddit_instructions = """
1. Cross-reference the community sentiment WITH the YouTube playlists. 
   Look for channel names mentioned in community posts — that's the strongest signal.
2. Pay close attention to "post_body" fields — they often contain direct mentions of specific channels/playlists.
3. A high upvote score on a community post recommending a specific channel is a very strong quality signal.
4. Prefer YouTube playlists from channels that have been explicitly praised by the developer community.
"""
    else:
        reddit_section_text = """
## Community Sentiment:
No relevant community data could be retrieved (data may be unavailable, missing, or filtered).
"""
        reddit_instructions = """
1. Since no live community data is available, do NOT fabricate or synthesize community signals.
2. You must return an empty array `[]` for the `reddit_signals` field.
3. Base your recommendation purely on the YouTube playlist metadata and your internal knowledge of learning path quality.
"""

    return f"""You are a learning path expert. A user wants to learn "{topic}" at a "{level}" level.

I have gathered playlist metadata from YouTube. 
Your job is to analyze this data and recommend the single BEST YouTube playlist for this learner.
{reddit_section_text}
## YouTube Playlists Found:
{json.dumps(yt_playlists, indent=2) if yt_playlists else "No YouTube data available."}

## Instructions:
{reddit_instructions}
- Factor in the learner's level ("{level}") — beginner needs fundamentals, advanced needs depth.

## Output Format:
Respond ONLY with a valid JSON object (no markdown, no code blocks) in this exact format.
IMPORTANT: Never use the word "Reddit" or "subreddit" in your output. Use "community", "developers", or "forums" instead.
{{
  "playlist_url": "https://www.youtube.com/playlist?list=...",
  "title": "Recommended playlist title",
  "channel": "Channel name",
  "thumbnail": "thumbnail URL if available or empty string",
  "justification": "A clear 2-3 sentence explanation citing why this playlist matches the requested level and what the community generally thinks of it.",
  "reddit_signals": ["key community insight 1", "key community insight 2", "key community insight 3"]
}}
"""


def get_recommendation(topic: str, level: str) -> Dict[str, Any]:
    """
    Main entry point. Fetches Reddit + YouTube data, sends to Gemini,
    returns a structured recommendation dict.
    """
    logger.info("Fetching recommendation for topic='%s' level='%s'", topic, level)

    # Fetch data in parallel conceptually (sequential is fine for this use case)
    reddit_posts = get_reddit_sentiment(topic, level)
    yt_playlists = search_playlists(topic, level)

    logger.info("Got %d Reddit posts, %d YouTube playlists", len(reddit_posts), len(yt_playlists))

    model = _configure_gemini()
    if not model:
        # Graceful fallback: return top YouTube result without AI synthesis
        if yt_playlists:
            top = yt_playlists[0]
            return {
                "playlist_url": top["playlist_url"],
                "title": top["title"],
                "channel": top["channel"],
                "thumbnail": top["thumbnail"],
                "justification": (
                    f"Gemini API not configured — showing the top YouTube result by relevance. "
                    f"Add your GEMINI_API_KEY to unlock AI-powered recommendations that cross-reference "
                    f"Reddit community sentiment."
                ),
                "reddit_signals": (
                    [f"{p['title'][:80]} (+{p['score']} upvotes)" for p in reddit_posts[:3]]
                    if reddit_posts else []
                ),
                "_no_gemini": True,
                "_youtube_options": [p for p in yt_playlists if p["playlist_url"] != top["playlist_url"]],
                "_reddit_posts": reddit_posts,
            }
        # No YouTube key either
        return {"error": "No API keys configured. Please add YOUTUBE_API_KEY (and optionally GEMINI_API_KEY) to your backend/.env file."}

    prompt = _build_prompt(topic, level, reddit_posts, yt_playlists)

    try:
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # Strip markdown code fences if present
        raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
        raw_text = re.sub(r"\s*```$", "", raw_text)

        recommendation = json.loads(raw_text)
        # Attach raw data for debugging / transparency
        # Filter the top pick out of alternatives to avoid duplication
        rec_url = recommendation.get("playlist_url", "")
        recommendation["_youtube_options"] = [
            p for p in yt_playlists if p["playlist_url"] != rec_url
        ]
        recommendation["_reddit_posts"] = reddit_posts
        return recommendation
    except json.JSONDecodeError:
        logger.error("Gemini returned non-JSON: %s", raw_text[:500])
        return {
            "error": "Failed to parse Gemini response. Please try again.",
            "_raw": raw_text[:500],
        }
    except Exception as exc:
        logger.error("Gemini API call failed: %s", exc)
        return {"error": str(exc)}
