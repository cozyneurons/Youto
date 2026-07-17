import re


def is_valid_youtube_url(url: str) -> bool:
    """Return True if the URL is a recognisable YouTube playlist or video URL."""
    patterns = [
        r"https?://(?:www\.)?youtube\.com/playlist\?list=[\w-]+",
        r"https?://(?:www\.)?youtube\.com/watch\?.*list=[\w-]+",
        r"https?://youtu\.be/[\w-]+",
        r"https?://(?:www\.)?youtube\.com/watch\?v=[\w-]+",
    ]
    return any(re.search(p, url) for p in patterns)


def is_valid_email(email: str) -> bool:
    pattern = r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))


def is_strong_password(password: str) -> bool:
    """Minimum 8 chars; at least one letter and one digit."""
    return len(password) >= 8 and any(c.isalpha() for c in password) and any(c.isdigit() for c in password)
