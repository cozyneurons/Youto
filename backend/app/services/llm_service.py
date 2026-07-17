"""
Gemini LLM integration for per-video transcript summarization.
Requires GEMINI_API_KEY in .env. If not set, summarization is silently skipped.
"""
from __future__ import annotations

from app.config import settings
from app.utils.logger import logger

_gemini_ready = False

if settings.GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.GEMINI_API_KEY)
        _gemini_ready = True
    except ImportError:
        logger.warning("google-generativeai package not installed — Gemini disabled")
else:
    logger.info("GEMINI_API_KEY not set — transcript summarization disabled")


SUMMARY_PROMPT = (
    "You are a helpful assistant. Summarize the following YouTube video transcript "
    "in 3–5 clear, informative sentences. Focus on the key concepts and takeaways. "
    "Be concise and avoid filler phrases.\n\nTranscript:\n{transcript}"
)


def generate_summary(transcript: str) -> str:
    """
    Generate a plain-text summary of a video transcript using Gemini 1.5 Flash.
    Returns an empty string if the API key is missing or an error occurs.
    """
    if not _gemini_ready:
        return ""
    if not transcript or len(transcript.strip()) < 50:
        return ""

    try:
        return _call_gemini(SUMMARY_PROMPT.format(transcript=transcript[:8000]))
    except Exception as exc:
        logger.error("Gemini summary generation failed: %s", exc)
        return ""


def _call_gemini(prompt: str) -> str:
    """Internal wrapper around the Gemini generative model API."""
    import google.generativeai as genai  # noqa: F811
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    return response.text.strip()


def generate_course_phases(playlist_title: str, video_titles: list[str]) -> list[dict]:
    """
    Calls Groq API to intelligently group a list of video titles into logical phases.
    Returns a list of dicts: [{"video_index": 0, "phase_name": "Fundamentals"}, ...]
    """
    import httpx
    import json
    
    if not video_titles:
        return []
        
    def get_fallback():
        section_size = max(1, (len(video_titles) + 2) // 3)
        return [{"video_index": i, "phase_name": f"Phase {i // section_size + 1}"} for i in range(len(video_titles))]

    if not settings.GROQ_API_KEY:
        logger.warning("GROQ_API_KEY not set — falling back to mathematical phasing")
        return get_fallback()

    titles_str = "\n".join(f"{i}: {title}" for i, title in enumerate(video_titles))

    prompt = f"""You are an expert curriculum designer. Given a YouTube playlist title and a list of video titles in order, logically group these videos into 3 to 6 distinct phases (e.g., "Fundamentals", "Core Concepts", "Advanced", "Projects").

Playlist Title: {playlist_title}

Videos:
{titles_str}

Output ONLY a raw JSON array of objects. Do not include markdown code blocks (like ```json), just the raw JSON.
Each object must have exactly two keys:
- "video_index": the integer index of the video (from the list above)
- "phase_name": a concise, descriptive name for the phase (e.g., "Module 1: Basics")

The array must have exactly one object for every video provided, in the exact same order.
"""
    try:
        response = httpx.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
            json={
                "model": "llama-3.1-8b-instant",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.2
            },
            timeout=15.0
        )
        response.raise_for_status()
        data = response.json()
        content = data["choices"][0]["message"]["content"].strip()
        
        # Clean up markdown formatting if present
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        
        phases = json.loads(content.strip())
        return phases
    except Exception as exc:
        logger.error("Groq phase generation failed: %s", exc)
        return get_fallback()
