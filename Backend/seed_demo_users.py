import sys
sys.stdout.reconfigure(encoding='utf-8')
from datetime import datetime, timedelta, timezone
from sqlmodel import Session, select, create_engine
from models import User, Score
from auth import hash_password

engine = create_engine('sqlite:///gaming_portal.db')

competitors = [
    {
        "username": "pixelknight",
        "display_name": "PixelKnight",
        "avatar_emoji": "⚔️",
        "coins": 340,
        "scores": [
            {"game_id": "chess", "game_name": "Chess", "score": 240, "result": "Won"},
            {"game_id": "whackamole", "game_name": "Whack-a-Mole", "score": 210, "result": "Won"},
            {"game_id": "carrace", "game_name": "Lane Racer", "score": 140, "result": "Won"},
            {"game_id": "snake", "game_name": "Snake", "score": 95, "result": "Won"},
            {"game_id": "memory", "game_name": "Memory Match", "score": 75, "result": "Won"},
            {"game_id": "quiz", "game_name": "Quick Quiz", "score": 90, "result": "Won"},
            {"game_id": "rps", "game_name": "Rock Paper Scissors", "score": 30, "result": "Won"},
            {"game_id": "tictactoe", "game_name": "Tic Tac Toe", "score": 40, "result": "Won"},
        ]
    },
    {
        "username": "cybersamurai",
        "display_name": "CyberSamurai",
        "avatar_emoji": "🥷",
        "coins": 280,
        "scores": [
            {"game_id": "chess", "game_name": "Chess", "score": 190, "result": "Won"},
            {"game_id": "whackamole", "game_name": "Whack-a-Mole", "score": 180, "result": "Won"},
            {"game_id": "snake", "game_name": "Snake", "score": 110, "result": "Won"},
            {"game_id": "carrace", "game_name": "Lane Racer", "score": 120, "result": "Won"},
            {"game_id": "tictactoe", "game_name": "Tic Tac Toe", "score": 50, "result": "Won"},
            {"game_id": "memory", "game_name": "Memory Match", "score": 85, "result": "Won"},
            {"game_id": "quiz", "game_name": "Quick Quiz", "score": 80, "result": "Won"},
            {"game_id": "rps", "game_name": "Rock Paper Scissors", "score": 25, "result": "Won"},
        ]
    },
    {
        "username": "neonviper",
        "display_name": "NeonViper",
        "avatar_emoji": "🐍",
        "coins": 220,
        "scores": [
            {"game_id": "snake", "game_name": "Snake", "score": 135, "result": "Won"},
            {"game_id": "whackamole", "game_name": "Whack-a-Mole", "score": 120, "result": "Won"},
            {"game_id": "carrace", "game_name": "Lane Racer", "score": 110, "result": "Won"},
            {"game_id": "chess", "game_name": "Chess", "score": 140, "result": "Won"},
            {"game_id": "memory", "game_name": "Memory Match", "score": 70, "result": "Won"},
            {"game_id": "quiz", "game_name": "Quick Quiz", "score": 70, "result": "Won"},
            {"game_id": "rps", "game_name": "Rock Paper Scissors", "score": 20, "result": "Won"},
            {"game_id": "tictactoe", "game_name": "Tic Tac Toe", "score": 30, "result": "Won"},
        ]
    },
    {
        "username": "arcadequeen",
        "display_name": "ArcadeQueen",
        "avatar_emoji": "👑",
        "coins": 310,
        "scores": [
            {"game_id": "carrace", "game_name": "Lane Racer", "score": 185, "result": "Won"},
            {"game_id": "whackamole", "game_name": "Whack-a-Mole", "score": 195, "result": "Won"},
            {"game_id": "snake", "game_name": "Snake", "score": 115, "result": "Won"},
            {"game_id": "memory", "game_name": "Memory Match", "score": 95, "result": "Won"},
            {"game_id": "chess", "game_name": "Chess", "score": 175, "result": "Won"},
            {"game_id": "quiz", "game_name": "Quick Quiz", "score": 100, "result": "Won"},
            {"game_id": "tictactoe", "game_name": "Tic Tac Toe", "score": 40, "result": "Won"},
            {"game_id": "rps", "game_name": "Rock Paper Scissors", "score": 35, "result": "Won"},
        ]
    },
    {
        "username": "shadowblade",
        "display_name": "ShadowBlade",
        "avatar_emoji": "⚡",
        "coins": 260,
        "scores": [
            {"game_id": "chess", "game_name": "Chess", "score": 280, "result": "Won"},
            {"game_id": "memory", "game_name": "Memory Match", "score": 100, "result": "Won"},
            {"game_id": "tictactoe", "game_name": "Tic Tac Toe", "score": 50, "result": "Won"},
            {"game_id": "quiz", "game_name": "Quick Quiz", "score": 100, "result": "Won"},
            {"game_id": "snake", "game_name": "Snake", "score": 90, "result": "Won"},
            {"game_id": "whackamole", "game_name": "Whack-a-Mole", "score": 150, "result": "Won"},
            {"game_id": "carrace", "game_name": "Lane Racer", "score": 90, "result": "Won"},
            {"game_id": "rps", "game_name": "Rock Paper Scissors", "score": 25, "result": "Won"},
        ]
    }
]

with Session(engine) as session:
    seeded_count = 0
    scores_count = 0

    for comp in competitors:
        user = session.exec(select(User).where(User.username == comp["username"])).first()
        if not user:
            user = User(
                username=comp["username"],
                display_name=comp["display_name"],
                avatar_emoji=comp["avatar_emoji"],
                coins=comp["coins"],
                hashed_password=hash_password("DemoPassword123!"),
                created_at=datetime.now(timezone.utc) - timedelta(days=2),
            )
            session.add(user)
            session.flush()
            seeded_count += 1

        # Check existing scores for this user
        existing_scores = session.exec(select(Score).where(Score.user_id == user.id)).all()
        existing_game_ids = {s.game_id for s in existing_scores}

        for s in comp["scores"]:
            if s["game_id"] not in existing_game_ids:
                score = Score(
                    user_id=user.id,
                    game_id=s["game_id"],
                    game_name=s["game_name"],
                    score=s["score"],
                    result=s["result"],
                    played_at=datetime.now(timezone.utc) - timedelta(hours=3),
                )
                session.add(score)
                scores_count += 1

    session.commit()
    print(f"Done! Seeded {seeded_count} new demo users and {scores_count} game scores.")
