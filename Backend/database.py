"""
Gaming Portal – Database Engine & Session
SQLite file stored at ./gaming_portal.db (relative to where the server runs).
"""
from sqlmodel import SQLModel, Session, create_engine

DATABASE_URL = "sqlite:///./gaming_portal.db"

# connect_args is required for SQLite to work with multiple threads (FastAPI uses a thread pool)
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False}, echo=False)


def create_db_and_tables() -> None:
    """Create all tables defined via SQLModel metadata."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI dependency: yields a DB session per request."""
    with Session(engine) as session:
        yield session
