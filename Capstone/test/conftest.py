import pytest

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
# from sqlalchemy.pool import StaticPool

from backend.mini_triage.main import app
from backend.mini_triage.database import Base
from backend.mini_triage.routers.auth import get_db

TEST_DATABASE_URL = "sqlite:///./test_request.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine
)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture
def client():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    
    app.dependency_overrides[get_db]=override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.pop(get_db, None)
    Base.metadata.drop_all(bind=test_engine)
    
