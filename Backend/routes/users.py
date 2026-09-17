"""
Gaming Portal – Users Routes
GET  /users/{user_id}        – public profile (no auth required)
GET  /users/{user_id}/stats  – aggregated stats for a user
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, func, select

from database import get_session
from models import Score, User, UserRead

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}", response_model=UserRead)
def get_user(user_id: int, session: Session = Depends(get_session)):
    """Return a user's public profile."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{user_id}/stats")
def get_user_stats(user_id: int, session: Session = Depends(get_session)):
    """Return aggregated stats: games played, won, lost, total score, favourite game."""
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    scores = session.exec(select(Score).where(Score.user_id == user_id)).all()

    played = len(scores)
    won    = sum(1 for s in scores if s.result == "Won")
    lost   = sum(1 for s in scores if s.result == "Lost")
    draws  = sum(1 for s in scores if s.result == "Draw")
    total  = sum(s.score for s in scores)

    # Favourite game by play count
    if scores:
        from collections import Counter
        favourite = Counter(s.game_name for s in scores).most_common(1)[0][0]
    else:
        favourite = None

    return {
        "user_id":       user_id,
        "username":      user.username,
        "display_name":  user.display_name,
        "coins":         user.coins,
        "games_played":  played,
        "games_won":     won,
        "games_lost":    lost,
        "games_drawn":   draws,
        "total_score":   total,
        "favourite_game": favourite,
    }
