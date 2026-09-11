# Project Progress & Changes

## 1. YouTube Extraction Fix
- **Issue**: `yt-dlp` was failing to extract playlist metadata due to outdated parsing logic breaking against new YouTube layouts.
- **Fix**: Updated `yt-dlp` version to `2026.8.19` in `requirements.txt`.

## 2. Render Database Configuration Fixes
- **Issue**: `OperationalError` and connection drops when idle, plus connection limit errors from exceeding free-tier max connections (50).
- **Fix**: Updated `backend/app/services/database.py` to include `pool_recycle=280` (preventing Render's 5-minute idle timeout kill), and decreased `pool_size` and `max_overflow` to stay within Render's free tier connection limits.
- **Issue**: App failing to start due to `postgres://` protocol rejection by SQLAlchemy.
- **Fix**: Added dynamic replacement logic in `backend/app/config.py` to automatically convert Render's `postgres://` URLs to `postgresql://`.

## 3. Celery Removal & BackgroundTasks Migration
- **Issue**: Render charges for a dedicated Background Worker process required by Celery, which isn't free.
- **Fix**: 
  - Completely removed the `celery` dependency from `requirements.txt`.
  - Stripped out Celery configurations from `config.py` and deleted `celery_config.py`.
  - Converted `@celery_app.task` decorators in `extract_video.py`, `send_notifications.py`, and `check_overdue.py` into native Python functions.
  - Migrated async task triggering in `playlists.py` to use FastAPI's built-in `BackgroundTasks` instead of Celery's `.delay()`.

## 4. Persistent Failure Handling & Scheduled Recovery
- **Issue**: FastAPI's `BackgroundTasks` are tied to the web process and are lost on restart, requiring a durable retry solution for failed/interrupted video extractions.
- **Fix**:
  - Added `extraction_status`, `extraction_attempts`, `extraction_error`, and `processing_started_at` columns to the `Lesson` model.
  - Generated an Alembic migration script (`d6bef82b2171`) to apply these schema changes.
  - Updated `extract_video.py` to set a processing timestamp lease when starting, track task attempts, log errors directly into the database, and mark extractions as `failed` after 3 attempts (or `pending_retry`).
  - Added a new scheduled recovery module `backend/app/tasks/retry_extractions.py` to find and re-queue incomplete extractions (including `processing` leases that have expired after 1 hour).
  - Created two new secure API endpoints in `main.py` (`/api/cron/check-overdue` and `/api/cron/retry-extractions`) meant to be pinged by an external free cron service (like UptimeRobot) to replace Celery Beat.
