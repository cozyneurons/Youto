import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.services.database import get_db
from app.models.base import Base
from app.models.lesson import Lesson
from app.models.course import Course
from app.models.user import User
from app.middleware.auth_middleware import get_current_user

# ── In-memory SQLite for tests ───────────────────────────────────────────────
SQLALCHEMY_TEST_URL = "sqlite:///./test.db"

engine = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()

def override_get_current_user():
    return User(id=1, email="test@example.com", name="Test User")

app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

Base.metadata.create_all(bind=engine)
client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


def test_generate_summary_provider_failure(monkeypatch):
    # Setup test data
    db = TestingSession()
    course = Course(title="Test Course", created_by=1)
    db.add(course)
    db.commit()

    lesson = Lesson(
        course_id=course.id,
        title="Test Lesson",
        order_index=1,
        transcript="This is a test transcript with some content so it doesn't fail length validation.",
        duration=100
    )
    db.add(lesson)
    db.commit()
    lesson_id = lesson.id
    db.close()

    # Mock generate_summary to simulate provider failure
    def mock_generate_summary(transcript):
        raise Exception("Provider failed")
    
    # We patch the generate_summary directly where it is defined since it is imported locally
    monkeypatch.setattr("app.services.llm_service.generate_summary", lambda t: "")

    resp = client.post(f"/api/lessons/{lesson_id}/generate-summary")
    
    # Should return 503 instead of 500 when generation fails
    assert resp.status_code == 503
    assert "unavailable" in resp.json()["detail"].lower()
