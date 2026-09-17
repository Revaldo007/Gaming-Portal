"""
Gaming Portal – Achievements Routes
GET /achievements/me  – all achievements earned by the current user
GET /achievements/    – all possible achievements (static catalog)
"""
from typing import List

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from database import get_session
from dependencies import get_current_user
from models import Achievement, AchievementRead, User

router = APIRouter(prefix="/achievements", tags=["achievements"])

# Full catalog mirroring the frontend ACHIEVEMENT_DEFS
CATALOG = [
    {"id": "first_game",  "name": "First Game",    "icon": "🏆", "description": "Play your first game."},
    {"id": "first_win",   "name": "First Win",     "icon": "⭐", "description": "Win any game."},
    {"id": "five_games",  "name": "5 Games Played","icon": "🔥", "description": "Play at least 5 games."},
    {"id": "high_scorer", "name": "Score 500+",    "icon": "💯", "description": "Score 500 or more in a single game."},
]


@router.get("/", tags=["achievements"])
def list_catalog():
    """Return all possible achievements with their descriptions."""
    return CATALOG


@router.get("/me", response_model=List[AchievementRead])
def my_achievements(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Return all achievements earned by the authenticated user."""
    return session.exec(
        select(Achievement).where(Achievement.user_id == current_user.id)
    ).all()
