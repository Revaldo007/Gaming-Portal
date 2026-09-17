"""
Gaming Portal – Database Models
Uses SQLModel (SQLAlchemy + Pydantic hybrid) with SQLite.
"""
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel


# ─── User ─────────────────────────────────────────────────────────────────────

class UserBase(SQLModel):
    username: str = Field(index=True, unique=True, min_length=2, max_length=32)
    display_name: str = Field(default="", max_length=64)
    avatar_emoji: str = Field(default="👤", max_length=8)
    avatar_url: Optional[str] = Field(default=None, max_length=512)


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str
    coins: int = Field(default=120)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserCreate(UserBase):
    password: str = Field(min_length=4)


class UserRead(UserBase):
    id: int
    coins: int
    created_at: datetime


class UserUpdate(SQLModel):
    display_name: Optional[str] = None
    avatar_emoji: Optional[str] = None
    avatar_url: Optional[str] = None


class CoinAdjust(SQLModel):
    amount: int
    reason: Optional[str] = None


# ─── Score ────────────────────────────────────────────────────────────────────

class ScoreBase(SQLModel):
    game_id: str = Field(index=True, max_length=32)      # e.g. "snake"
    game_name: str = Field(max_length=64)                 # e.g. "Snake"
    score: int = Field(ge=0)
    result: str = Field(max_length=16)                    # "Won" | "Lost" | "Draw"


class Score(ScoreBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    played_at: datetime = Field(default_factory=datetime.utcnow)


class ScoreCreate(ScoreBase):
    pass


class ScoreRead(ScoreBase):
    id: int
    user_id: int
    played_at: datetime


# ─── Achievement ──────────────────────────────────────────────────────────────

class AchievementBase(SQLModel):
    achievement_id: str = Field(max_length=64)   # e.g. "first_win"
    achievement_name: str = Field(max_length=128)
    icon: str = Field(max_length=8)


class Achievement(AchievementBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    earned_at: datetime = Field(default_factory=datetime.utcnow)


class AchievementRead(AchievementBase):
    id: int
    user_id: int
    earned_at: datetime
