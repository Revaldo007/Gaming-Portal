"""
Gaming Portal – FastAPI Application Entry Point
Run with:  uvicorn main:app --reload --port 8000
Docs at:   http://localhost:8000/docs
"""
import os
from contextlib import asynccontextmanager
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import create_db_and_tables
from routes import achievements, auth, games, scores, users


# ─── Upload directory ─────────────────────────────────────────────────────────

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ─── WebSocket Connection Manager ─────────────────────────────────────────────

class ConnectionManager:
    """Tracks active WebSocket connections and broadcasts messages to all."""

    def __init__(self):
        self.active: List[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        self.active = [c for c in self.active if c is not ws]

    async def broadcast(self, message: dict):
        dead = []
        for ws in self.active:
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)


manager = ConnectionManager()


# ─── Lifespan (replaces deprecated @app.on_event) ────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create DB tables on startup."""
    create_db_and_tables()
    yield


# ─── App instance ─────────────────────────────────────────────────────────────

app = FastAPI(
    title="Gaming Portal API",
    description=(
        "REST backend for the Gaming Portal — a browser-based arcade with "
        "leaderboards, achievements, and user profiles."
    ),
    version="1.0.0",
    lifespan=lifespan,
)


# ─── Static files (uploaded avatars) ──────────────────────────────────────────

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


# ─── CORS (allow the Vite dev server on port 5173) ────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # alternate React port
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Routers ──────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(games.router)
app.include_router(scores.router)
app.include_router(achievements.router)
app.include_router(users.router)


# ─── WebSocket – live profile updates ─────────────────────────────────────────

@app.websocket("/ws/profile")
async def ws_profile(websocket: WebSocket):
    """Clients connect here to receive real-time profile_update events."""
    await manager.connect(websocket)
    try:
        while True:
            # Keep the connection alive; we only push from the server side.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ─── Root health-check ────────────────────────────────────────────────────────

@app.get("/", tags=["health"])
def root():
    return {"status": "ok", "service": "Gaming Portal API", "version": "1.0.0"}


@app.get("/health", tags=["health"])
def health():
    return {"status": "ok"}
