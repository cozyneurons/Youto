"""
Reddit sentiment scraping via Arctic Shift (PullPush) — free historical Reddit data.
This avoids Reddit's strict 403 blocks on unauthenticated API calls.
"""
from __future__ import annotations

from typing import Any, Dict, List

import httpx

from app.utils.logger import logger

PULLPUSH_BASE = "https://api.pullpush.io/reddit/search/submission/"


def get_reddit_sentiment(topic: str, level: str) -> List[Dict[str, Any]]:
    """
    Search PullPush (historical Reddit data up to early 2025) for course recommendations.
    """
    # E.g., 'python beginner playlist course tutorial'
    query = f"{topic} {level} playlist course tutorial"
    
    try:
        resp = httpx.get(
            PULLPUSH_BASE,
            params={
                "q": query,
                "size": 15,            # Get top 15 results
                "sort": "desc",
                "sort_type": "score",  # Sort by highest upvotes
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json().get("data", [])
        if not isinstance(data, list):
            data = []
    except Exception as exc:
        logger.warning("PullPush Reddit search failed: %s", exc)
        return []

    results = []
    seen_urls = set()
    
    for p in data:
        if not isinstance(p, dict):
            continue
            
        raw_score = p.get("score")
        try:
            score = int(raw_score) if raw_score is not None else 0
        except (ValueError, TypeError):
            score = 0
            
        # Skip very low-quality posts
        if score < 5:
            continue
            
        url = p.get("url", "")
        # Basic deduplication
        if url in seen_urls:
            continue
        seen_urls.add(url)
        
        # PullPush provides a direct permalink if we prepend reddit.com
        permalink = p.get("permalink", "")
        full_permalink = f"https://reddit.com{permalink}" if permalink else url

        # Note: PullPush submission search doesn't include comments inline, 
        # but we pass the post's text/description if it exists to give Gemini context.
        selftext = p.get("selftext", "")
        if selftext and selftext not in ["[deleted]", "[removed]"]:
            post_body = selftext[:300] + "..."  
        else:
            post_body = ""

        results.append({
            "title": p.get("title", "")[:200],
            "score": score,
            "num_comments": p.get("num_comments", 0),
            "subreddit": p.get("subreddit", ""),
            "url": url,
            "permalink": full_permalink,
            "post_body": post_body,
        })

    # Sort again just to be safe
    results.sort(key=lambda x: x["score"], reverse=True)
    
    # Return top 10
    final_results = results[:10]
    logger.info("Arctic Shift Reddit sentiment: %d unique posts for topic='%s'", len(final_results), topic)
    
    return final_results
