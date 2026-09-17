import sys
sys.stdout.reconfigure(encoding='utf-8')
from datetime import datetime, timedelta
from sqlmodel import Session, select, create_engine
from models import User, Score
from auth import hash_password

engine = create_engine('sqlite:///gaming_portal.db')
session = Session(engine)

existing = session.exec(select(User)).all()
if len(existing) <= 1:
    print("Seeding demo players...")
    competitors = [
        {
            "username": "pixelknight",
            "display_name": "PixelKnight",
            "avatar_emoji": "⚔️",
            "coins": 210,
            "scores": [
                {"game_id": "whackamole", "game_name": "Whack-a-Mole", "score": 210, "result": "Won"},
                {"game_id": "carrace", "game_name": "Lane Racer", "score": 140, "result": "Won"},
                {"game_id": "snake", "game_name": "Snake", "score": 95, "result": "Won"},
                {"game_id": "memory", "game_name": "Memory Match", "score": 75, "result": "Won"},
                {"game_id": "rps", "game_name": "Rock Paper Scissors", "score": 20, "result": "Lost"},
            ]
        },
        {
            "username": "cybersamurai",
            "display_name": "CyberSamurai",
            "avatar_emoji": "🥷",
            "coins": 160,
            "scores": [
                {"game_id": "whackamole", "game_name": "Whack-a-Mole", "score": 180, "result": "Won"},
                {"game_id": "snake", "game_name": "Snake", "score": 110, "result": "Won"},
                {"game_id": "carrace", "game_name": "Lane Racer", "score": 80, "result": "Won"},
                {"game_id": "tictactoe", "game_name": "Tic Tac Toe", "score": 40, "result": "Won"},
            ]
        },
        {
            "username": "neonviper",
            "display_name": "NeonViper",
            "avatar_emoji": "🐍",
            "coins": 95,
            "scores": [
                {"game_id": "snake", "game_name": "Snake", "score": 130, "result": "Won"},
                {"game_id": "whackamole", "game_name": "Whack-a-Mole", "score": 70, "result": "Won"},
                {"game_id": "carrace", "game_name": "Lane Racer", "score": 25, "result": "Lost"},
            ]
        }
    ]

    for comp in competitors:
        user = User(
            username=comp["username"],
            display_name=comp["display_name"],
            avatar_emoji=comp["avatar_emoji"],
            coins=comp["coins"],
            hashed_password=hash_password("DemoPassword123!"),
            created_at=datetime.utcnow() - timedelta(days=2),
        )
        session.add(user)
        session.flush()

        for s in comp["scores"]:
            score = Score(
                user_id=user.id,
                game_id=s["game_id"],
                game_name=s["game_name"],
                score=s["score"],
                result=s["result"],
                played_at=datetime.utcnow() - timedelta(hours=5),
            )
            session.add(score)

    session.commit()
    print("Successfully seeded 3 demo players!")
else:
    print(f"Database already has {len(existing)} users. Skipping seed.")
