"""
Reddit sentiment scraping — no auth required.
Uses the public JSON endpoints with a proper User-Agent header.

Flow:
  Step 1: Dynamically discover the top 3-5 most relevant subreddits for the topic
           via reddit.com/subreddits/search.json (ranked by subscriber count)
  Step 2: Search each of those subreddits for playlist/course/tutorial posts
           and pull post title, upvotes, comment count, and top comments
  Step 3: Merge, deduplicate, sort by score, return top posts
"""
from __future__ import annotations

from typing import Any, Dict, List

import httpx

from app.utils.logger import logger

HEADERS = {"User-Agent": "YoutoApp/1.0 (educational course aggregator)"}
REDDIT_BASE = "https://www.reddit.com"


# ── Step 1: Dynamic Subreddit Discovery ────────────────────────────────────────

def _discover_subreddits(topic: str, limit: int = 10) -> List[str]:
    """
    Hit reddit.com/subreddits/search.json to find subreddits relevant to the topic.
    Results come back already ranked by subscriber count + activity.
    We pick the top 3-5 that are clearly on-topic (filter out too-generic ones).
    """
    try:
        resp = httpx.get(
            f"{REDDIT_BASE}/subreddits/search.json",
            params={"q": topic, "limit": limit, "sort": "relevance"},
            headers=HEADERS,
            timeout=8,
        )
        resp.raise_for_status()
        children = resp.json().get("data", {}).get("children", [])
    except Exception as exc:
        logger.warning("Reddit subreddit discovery failed: %s", exc)
        return []

    subreddits: List[str] = []
    for child in children:
        data = child.get("data", {})
        name = data.get("display_name", "")
        subscribers = data.get("subscribers", 0)
        # Skip subreddits with very few subscribers (likely not useful)
        if subscribers < 1000:
            continue
        subreddits.append(name)
        if len(subreddits) >= 5:
            break

    logger.info("Discovered subreddits for '%s': %s", topic, subreddits)
    return subreddits if subreddits else ["learnprogramming", "artificial"]


# ── Step 2: Search Subreddits for Posts ────────────────────────────────────────

def _get_top_comment(post_id: str, subreddit: str) -> str:
    """
    Fetch the single highest-voted top-level comment from a post.
    Returns empty string if unavailable or on any error.
    """
    try:
        resp = httpx.get(
            f"{REDDIT_BASE}/r/{subreddit}/comments/{post_id}.json",
            params={"limit": 5, "depth": 1, "sort": "top"},
            headers=HEADERS,
            timeout=6,
        )
        resp.raise_for_status()
        listing = resp.json()
        if len(listing) < 2:
            return ""
        comment_children = listing[1].get("data", {}).get("children", [])
        for c in comment_children:
            body = c.get("data", {}).get("body", "")
            if body and body != "[deleted]" and body != "[removed]":
                return body[:300]
    except Exception:
        pass
    return ""


def _search_subreddit(subreddit: str, topic: str, level: str) -> List[Dict[str, Any]]:
    """
    Search a single subreddit for posts about topic+playlist/course/tutorial.
    Fetches post metadata and optionally the top comment as extra context.
    """
    query = f"{topic} {level} playlist course tutorial"
    try:
        resp = httpx.get(
            f"{REDDIT_BASE}/r/{subreddit}/search.json",
            params={
                "q": query,
                "sort": "top",
                "limit": 10,
                "restrict_sr": 1,
                "t": "all",
            },
            headers=HEADERS,
            timeout=8,
        )
        resp.raise_for_status()
        children = resp.json().get("data", {}).get("children", [])
    except Exception as exc:
        logger.warning("Reddit search failed for r/%s: %s", subreddit, exc)
        return []

    results = []
    for child in children:
        p = child.get("data", {})
        post_id = p.get("id", "")
        score = p.get("score", 0)
        # Skip low-quality posts
        if score < 5:
            continue
        top_comment = ""
        if post_id:
            top_comment = _get_top_comment(post_id, subreddit)
        results.append({
            "title": p.get("title", "")[:200],
            "score": score,
            "num_comments": p.get("num_comments", 0),
            "subreddit": subreddit,
            "url": p.get("url", ""),
            "permalink": f"https://reddit.com{p.get('permalink', '')}",
            "top_comment": top_comment,
        })

    return results


# ── Step 3: Main Entry Point ───────────────────────────────────────────────────

def get_reddit_sentiment(topic: str, level: str) -> List[Dict[str, Any]]:
    """
    Full flow:
      1. Dynamically discover the top 3-5 subreddits for the topic.
      2. Search each for playlist/course posts (with top comment).
      3. Merge, deduplicate by URL, sort by score, return top 10.
    """
    # Step 1
    subreddits = _discover_subreddits(topic)

    # Step 2
    all_posts: List[Dict[str, Any]] = []
    for sub in subreddits:
        posts = _search_subreddit(sub, topic, level)
        all_posts.extend(posts)
        logger.info("r/%s → %d posts", sub, len(posts))

    # Step 3: Deduplicate by URL
    seen_urls: set = set()
    condensed: List[Dict[str, Any]] = []
    for p in all_posts:
        url = p.get("url", "")
        if url in seen_urls:
            continue
        seen_urls.add(url)
        condensed.append(p)

    # Sort by upvotes descending, take top 10
    condensed.sort(key=lambda x: x["score"], reverse=True)
    result = condensed[:10]

    logger.info("Reddit sentiment: %d unique posts for topic='%s'", len(result), topic)
    return result
