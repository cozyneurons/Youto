from sqlalchemy import create_engine

from app.models.base import Base
from app import models  # noqa: F401


def test_course_share_partial_index_works_with_sqlite():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
