"""
Gaming Portal – Scores Routes
POST /scores/          – submit a game score (authenticated)
GET  /scores/me        – fetch the current user's score history
GET  /scores/leaderboard?game_id=&limit= – top scores across all users
"""
from typing import Annotated, List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import case
from sqlmodel import Session, func, select

from database import get_session
from dependencies import get_current_user
from models import Achievement, Score, ScoreCreate, ScoreRead, User

router = APIRouter(prefix="/scores", tags=["scores"])

# Achievement definitions that mirror the frontend ACHIEVEMENT_DEFS
ACHIEVEMENT_DEFS = [
    {"id": "first_game",  "name": "First Game",   "icon": "🏆"},
    {"id": "first_win",   "name": "First Win",    "icon": "⭐"},
    {"id": "five_games",  "name": "5 Games Played","icon": "🔥"},
    {"id": "high_scorer", "name": "Score 500+",   "icon": "💯"},
]

COINS_PER_SCORE_UNIT = 5   # coins = score // COINS_PER_SCORE_UNIT
STRATEGY_WIN_BONUS = 20    # bonus coins for winning a strategy game
STRATEGY_GAME_IDS = {"chess", "tictactoe"}


def _check_and_award_achievements(user: User, all_scores: list[Score], session: Session):
    """Award any newly-earned achievements and persist them."""
    earned_ids = {
        a.achievement_id
        for a in session.exec(select(Achievement).where(Achievement.user_id == user.id)).all()
    }

    tests = {
        "first_game":  len(all_scores) >= 1,
        "first_win":   any(s.result == "Won" for s in all_scores),
        "five_games":  len(all_scores) >= 5,
        "high_scorer": any(s.score >= 500 for s in all_scores),
    }

    for defn in ACHIEVEMENT_DEFS:
        if defn["id"] not in earned_ids and tests.get(defn["id"], False):
            session.add(Achievement(
                user_id=user.id,
                achievement_id=defn["id"],
                achievement_name=defn["name"],
                icon=defn["icon"],
            ))


# ─── Submit score ─────────────────────────────────────────────────────────────

@router.post("/", response_model=ScoreRead, status_code=201)
async def submit_score(
    body: ScoreCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """Save a game result and award coins + achievements."""
    score = Score(user_id=current_user.id, **body.model_dump())
    session.add(score)

    # Award coins proportional to score
    coins_earned = body.score // COINS_PER_SCORE_UNIT

    # Award bonus coins for winning Strategy games
    from routes.games import GAMES_CATALOG
    strategy_ids = {g["id"] for g in GAMES_CATALOG if g.get("category") == "Strategy"} | STRATEGY_GAME_IDS
    if body.result == "Won" and body.game_id in strategy_ids:
        coins_earned += STRATEGY_WIN_BONUS

    current_user.coins = (current_user.coins or 0) + coins_earned
    session.add(current_user)

    session.flush()   # get score.id without committing yet

    # Achievement check
    all_scores = session.exec(select(Score).where(Score.user_id == current_user.id)).all()
    _check_and_award_achievements(current_user, list(all_scores), session)

    session.commit()
    session.refresh(score)

    if coins_earned > 0:
        try:
            from main import manager
            await manager.broadcast({
                "type": "profile_update",
                "user_id": current_user.id,
                "coins": current_user.coins,
            })
        except Exception:
            pass

    return score


# ─── Personal history ─────────────────────────────────────────────────────────

@router.get("/me", response_model=List[ScoreRead])
def my_scores(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
    limit: int = Query(default=50, le=200),
):
    """Return the authenticated user's recent scores, newest first."""
    results = session.exec(
        select(Score)
        .where(Score.user_id == current_user.id)
        .order_by(Score.played_at.desc())
        .limit(limit)
    ).all()
    return results


# ─── Global leaderboard ───────────────────────────────────────────────────────

@router.get("/leaderboard")
def leaderboard(
    game_id: Optional[str] = Query(default=None, description="Filter by game, e.g. 'snake'"),
    limit: int = Query(default=50, le=100),
    session: Session = Depends(get_session),
):
    """
    Return user-centric leaderboard.
    - If game_id is None or 'all': Ranks unique users by Total Score across all games.
    - If game_id is specified: Ranks unique users by High Score in that specific game.
    Each user appears at most once.
    """
    if game_id and game_id != "all":
        stmt = (
            select(
                User.id,
                User.username,
                User.display_name,
                User.avatar_emoji,
                User.avatar_url,
                func.max(Score.score).label("score"),
                func.count(Score.id).label("games_played"),
                func.coalesce(func.sum(case((Score.result == "Won", 1), else_=0)), 0).label("games_won"),
                func.max(Score.game_name).label("game_name"),
            )
            .join(Score, Score.user_id == User.id)
            .where(Score.game_id == game_id)
            .group_by(User.id)
            .order_by(func.max(Score.score).desc(), func.count(Score.id).desc())
            .limit(limit)
        )
        rows = session.exec(stmt).all()
        return [
            {
                "user_id": uid,
                "username": uname,
                "player": dname if dname else uname,
                "avatar_emoji": aemoji,
                "avatar_url": aurl,
                "score": sc,
                "games_played": gp,
                "games_won": gw,
                "game_id": game_id,
                "game_name": gname,
            }
            for uid, uname, dname, aemoji, aurl, sc, gp, gw, gname in rows
        ]
    else:
        stmt = (
            select(
                User.id,
                User.username,
                User.display_name,
                User.avatar_emoji,
                User.avatar_url,
                func.coalesce(func.sum(Score.score), 0).label("score"),
                func.count(Score.id).label("games_played"),
                func.coalesce(func.sum(case((Score.result == "Won", 1), else_=0)), 0).label("games_won"),
            )
            .join(Score, Score.user_id == User.id)
            .group_by(User.id)
            .order_by(func.coalesce(func.sum(Score.score), 0).desc(), func.count(Score.id).desc())
            .limit(limit)
        )
        rows = session.exec(stmt).all()
        return [
            {
                "user_id": uid,
                "username": uname,
                "player": dname if dname else uname,
                "avatar_emoji": aemoji,
                "avatar_url": aurl,
                "score": sc,
                "games_played": gp,
                "games_won": gw,
                "game_id": "all",
                "game_name": "All Games",
            }
            for uid, uname, dname, aemoji, aurl, sc, gp, gw in rows
        ]

