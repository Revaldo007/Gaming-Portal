/**
 * Gaming Portal – API client
 * Thin wrapper around fetch() for the FastAPI backend.
 * Base URL comes from VITE_API_URL (see .env), defaulting to localhost:8000.
 */
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.detail) {
        detail = Array.isArray(body.detail)
          ? body.detail.map((d) => d.msg).join(", ")
          : body.detail;
      }
    } catch {
      /* response wasn't JSON — keep statusText */
    }
    throw new Error(detail || "Request failed");
  }
  if (res.status === 204) return null;
  return res.json();
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export function register({ username, password, display_name }) {
  return fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, display_name }),
  }).then(handle);
}

export function login({ username, password }) {
  const body = new URLSearchParams({ username, password });
  return fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  }).then(handle);
}

export function getMe(token) {
  return fetch(`${BASE_URL}/auth/me`, { headers: authHeaders(token) }).then(handle);
}

export function updateMe(token, body) {
  return fetch(`${BASE_URL}/auth/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(body),
  }).then(handle);
}

export const updateProfile = updateMe;

export function adjustCoins(token, amount, reason) {
  return fetch(`${BASE_URL}/auth/me/coins`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify({ amount, reason }),
  }).then(handle);
}

// ─── Users ──────────────────────────────────────────────────────────────────

export function getUserStats(userId, token) {
  return fetch(`${BASE_URL}/users/${userId}/stats`, { headers: authHeaders(token) }).then(handle);
}

// ─── Scores ─────────────────────────────────────────────────────────────────

export function submitScore(token, payload) {
  return fetch(`${BASE_URL}/scores/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(token) },
    body: JSON.stringify(payload),
  }).then(handle);
}

export function getMyScores(token, limit = 50) {
  return fetch(`${BASE_URL}/scores/me?limit=${limit}`, { headers: authHeaders(token) }).then(handle);
}

export function getLeaderboard({ gameId, limit = 50 } = {}) {
  const params = new URLSearchParams();
  if (gameId && gameId !== "all") params.set("game_id", gameId);
  if (limit) params.set("limit", limit);
  return fetch(`${BASE_URL}/scores/leaderboard?${params.toString()}`).then(handle);
}

// ─── Achievements ───────────────────────────────────────────────────────────

export function getAchievementsCatalog() {
  return fetch(`${BASE_URL}/achievements/`).then(handle);
}

export function getMyAchievements(token) {
  return fetch(`${BASE_URL}/achievements/me`, { headers: authHeaders(token) }).then(handle);
}

// ─── Avatar upload ───────────────────────────────────────────────────────────

export function uploadAvatar(token, file) {
  const form = new FormData();
  form.append("file", file);
  return fetch(`${BASE_URL}/auth/me/avatar`, {
    method: "POST",
    headers: authHeaders(token),  // NO Content-Type — browser sets multipart boundary
    body: form,
  }).then(handle);
}
