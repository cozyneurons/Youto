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
