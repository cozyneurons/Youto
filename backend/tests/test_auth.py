"""
Auth endpoint tests.
Uses an in-memory SQLite database via a test-specific engine override.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.services.database import get_db
from app.models.base import Base
import app.models  # noqa: F401

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


app.dependency_overrides[get_db] = override_get_db
Base.metadata.create_all(bind=engine)

client = TestClient(app)


@pytest.fixture(autouse=True)
def clean_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


def test_signup_success():
    resp = client.post("/api/auth/signup", json={
        "email": "test@example.com",
        "password": "password123",
        "name": "Test User",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"


def test_signup_duplicate_email():
    payload = {"email": "dup@example.com", "password": "password123"}
    client.post("/api/auth/signup", json=payload)
    resp = client.post("/api/auth/signup", json=payload)
    assert resp.status_code == 400


def test_login_success():
    client.post("/api/auth/signup", json={"email": "login@example.com", "password": "pass1234"})
    resp = client.post("/api/auth/login", json={"email": "login@example.com", "password": "pass1234"})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_wrong_password():
    client.post("/api/auth/signup", json={"email": "wp@example.com", "password": "correct123"})
    resp = client.post("/api/auth/login", json={"email": "wp@example.com", "password": "wrong999"})
    assert resp.status_code == 401
