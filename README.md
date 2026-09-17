# Gaming Portal

A full-stack browser arcade: FastAPI + SQLite backend, React + Vite frontend,
with account login/signup and a real profile (stats, achievements, history)
backed by the database.

## Backend (FastAPI + SQLite)

```bash
cd Backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

- API docs: http://localhost:8000/docs
- The SQLite file (`gaming_portal.db`) is created automatically on first run.
- Config lives in `.env` (JWT secret, allowed frontend URL, etc). Change
  `SECRET_KEY` before deploying anywhere real.

> Note: `requirements.txt` pins `bcrypt==4.0.1` alongside `passlib[bcrypt]==1.7.4`.
> Newer `bcrypt` releases break passlib's backend detection (a known upstream
> issue) and will make every register/login call fail with a 500 error —
> don't let this pin drift without testing registration afterwards.

## Frontend (React + Vite + Tailwind)

```bash
cd Frontend
npm install
npm run dev
```

- Runs at http://localhost:5173
- `.env` sets `VITE_API_URL` (defaults to `http://localhost:8000`) — point
  this at wherever the backend is running.
- You'll land on a login/sign-up screen first (`src/pages/AuthPage.jsx`).
  Creating an account calls `POST /auth/register` then logs you in
  automatically. The session token is kept in `localStorage` and the app
  re-validates it against `GET /auth/me` on load.

## How the two are wired together

- `src/api.js` — the only place that talks to the backend (fetch wrapper).
- `src/context/AuthContext.jsx` — owns the JWT + current user, exposes
  `login`, `register`, `logout`.
- `src/GamingPortal.jsx` — the app shell. On mount (and after every game),
  it pulls `/users/{id}/stats`, `/scores/me`, `/achievements/`, and
  `/achievements/me` to populate the Profile page and sidebar badge, and
  `/scores/leaderboard` for the Leaderboard page. Finishing a game calls
  `POST /scores/`, which is what actually awards coins and achievements
  server-side — the frontend just reflects whatever the backend returns.

## Run order

Start the backend first, then the frontend — the frontend will show
connection errors on the login screen if it can't reach the API.



This is the right one <-----