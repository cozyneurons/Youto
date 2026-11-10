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

METADATA_SUMMARY_PROMPT = (
    "You are an expert educational tutor. A full transcript is unavailable for this video, "
    "so summarize the lesson concepts and key takeaways in 3–5 clear, informative sentences based on "
    "the video title and detailed overview below. Focus on what the student will learn.\n\n"
    "Lesson Title: {title}\n"
    "Video Overview / Description:\n{description}"
)

# Content thresholds shared with routes/lessons.py
MIN_TRANSCRIPT_LEN = 50
MIN_DESCRIPTION_LEN = 20
MIN_TITLE_LEN = 3


def generate_summary(
    transcript: str | None = None,
    title: str | None = None,
    description: str | None = None,
    **kwargs,
) -> str:
    """
    Generate a plain-text summary of a video.
    Prefers the transcript; falls back to title and description if transcript is unavailable.
    Returns an empty string if the API key is missing or generation fails.
    """
    if not _gemini_ready:
        return ""

    prompt = ""
    if transcript and len(transcript.strip()) >= MIN_TRANSCRIPT_LEN:
        if len(transcript) > 100000:
            transcript = transcript[:100000]
        prompt = SUMMARY_PROMPT.format(transcript=transcript)
    elif description and len(description.strip()) >= MIN_DESCRIPTION_LEN:
        clean_desc = description.strip()[:4000]
        clean_title = (title or "Lesson").strip()[:200]
        prompt = METADATA_SUMMARY_PROMPT.format(title=clean_title, description=clean_desc)
    elif title and len(title.strip()) >= MIN_TITLE_LEN:
        clean_title = (title or "").strip()[:200]
        prompt = METADATA_SUMMARY_PROMPT.format(
            title=clean_title,
            description="No additional description is available for this lesson.",
        )
    else:
        return ""

    try:
        return _call_gemini(prompt)
    except Exception as exc:
        logger.error("Gemini summary generation failed: %s", exc)
        return ""


def _call_gemini(prompt: str) -> str:
    """Internal wrapper around the Gemini generative model API with model fallback."""
    import google.generativeai as genai  # noqa: F811
    candidate_models = [
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash",
        "gemini-flash-latest",
        "gemini-3.5-flash",
    ]
    last_err = None
    for model_name in candidate_models:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt)
            try:
                text = response.text.strip()
            except ValueError as ve:
                # Gemini raises ValueError when the response is blocked (e.g., safety filters)
                logger.warning("Gemini model %s returned a blocked response: %s. Trying next...", model_name, ve)
                last_err = ve
                continue
            if not text:
                logger.warning("Gemini model %s returned an empty response. Trying next...", model_name)
                last_err = RuntimeError(f"Empty response from {model_name}")
                continue
            return text
        except Exception as exc:
            last_err = exc
            logger.warning("Gemini model %s failed: %s. Trying next...", model_name, exc)

    raise last_err or RuntimeError("No Gemini models succeeded")


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

IMPORTANT: You MUST group multiple consecutive videos into the EXACT SAME phase. DO NOT create a unique phase for every single video. For example, if videos 0, 1, and 2 are all about Basics, they should ALL have the phase_name "Module 1: Basics".

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
