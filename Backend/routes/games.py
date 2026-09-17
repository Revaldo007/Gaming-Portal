"""
Gaming Portal – Games Catalog Routes
GET /games/     – full catalog of all playable games (static)
GET /games/{id} – single game detail
"""
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/games", tags=["games"])

# This mirrors the GAMES list in the frontend so the backend can serve it too
GAMES_CATALOG = [
    {
        "id": "chess",
        "name": "Chess",
        "emoji": "♟️",
        "category": "Strategy",
        "difficulty": "Hard",
        "rating": 4.9,
        "badge": "New",
        "blurb": "Classic chess against the CPU. Outmaneuver it and deliver checkmate.",
    },
    {
        "id": "carrace",
        "name": "Lane Racer",
        "emoji": "🏎️",
        "category": "Arcade",
        "difficulty": "Hard",
        "rating": 4.7,
        "badge": "New",
        "blurb": "Swerve between lanes and dodge oncoming traffic as it speeds up.",
    },
    {
        "id": "tictactoe",
        "name": "Tic Tac Toe",
        "emoji": "❌",
        "category": "Strategy",
        "difficulty": "Easy",
        "rating": 4.6,
        "badge": "Hot",
        "blurb": "Two players, three in a row, one bragging right.",
    },
    {
        "id": "snake",
        "name": "Snake",
        "emoji": "🐍",
        "category": "Arcade",
        "difficulty": "Hard",
        "rating": 4.8,
        "badge": "Popular",
        "blurb": "Eat, grow, don't bite yourself. Arrow keys to steer.",
    },
    {
        "id": "memory",
        "name": "Memory Match",
        "emoji": "🧩",
        "category": "Puzzle",
        "difficulty": "Medium",
        "rating": 4.5,
        "badge": None,
        "blurb": "Flip, remember, match. Fewer moves, higher score.",
    },
    {
        "id": "quiz",
        "name": "Quick Quiz",
        "emoji": "🧠",
        "category": "Quiz",
        "difficulty": "Medium",
        "rating": 4.4,
        "badge": None,
        "blurb": "Five questions. Speed doesn't count, accuracy does.",
    },
    {
        "id": "rps",
        "name": "Rock Paper Scissors",
        "emoji": "✊",
        "category": "Casual",
        "difficulty": "Easy",
        "rating": 4.3,
        "badge": None,
        "blurb": "Best of five against the house. No skill, all nerve.",
    },
    {
        "id": "whackamole",
        "name": "Whack-a-Mole",
        "emoji": "🔨",
        "category": "Arcade",
        "difficulty": "Medium",
        "rating": 4.5,
        "badge": "New",
        "blurb": "Moles pop up fast — tap them before they duck back down. 30 seconds on the clock.",
    },
]

_index = {g["id"]: g for g in GAMES_CATALOG}


@router.get("/")
def list_games(category: str | None = None):
    """Return all games, optionally filtered by category."""
    games = GAMES_CATALOG
    if category:
        games = [g for g in games if g["category"].lower() == category.lower()]
    return games


@router.get("/{game_id}")
def get_game(game_id: str):
    """Return a single game by its id."""
    game = _index.get(game_id)
    if not game:
        raise HTTPException(status_code=404, detail=f"Game '{game_id}' not found")
    return game
