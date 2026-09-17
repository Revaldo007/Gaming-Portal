import React, { useState } from "react";
import { AlertCircle, Gamepad2, LogIn, UserPlus } from "lucide-react";
import { THEME } from "../theme";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function switchMode(next) {
    setMode(next);
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setError(null);

    if (username.trim().length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(username.trim(), password);
      } else {
        await register(username.trim(), password, displayName.trim());
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4"
      style={{
        background: `radial-gradient(circle at 15% 20%, rgba(139,108,246,0.25), transparent 45%),
                     radial-gradient(circle at 85% 80%, rgba(245,71,140,0.2), transparent 45%),
                     ${THEME.bg}`,
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .auth-btn { transition: transform 0.15s ease, filter 0.15s ease; }
        .auth-btn:hover { filter: brightness(1.06); transform: translateY(-1px); }
        .auth-btn:active { transform: scale(0.98); }
        .auth-input:focus { border-color: ${THEME.violet} !important; box-shadow: 0 0 0 3px rgba(139,108,246,0.25); }
      `}</style>

      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: `linear-gradient(135deg, ${THEME.violet}, ${THEME.pink})` }}
          >
            <Gamepad2 size={28} color="#fff" />
          </div>
          <p className="font-bold text-lg" style={{ color: THEME.cream }}>
            GAMING <span style={{ color: THEME.violet }}>PORTAL</span>
          </p>
          <p className="text-sm text-center" style={{ color: THEME.muted }}>
            {mode === "login" ? "Sign in to pick up where you left off." : "Create an account to start playing."}
          </p>
        </div>

        <div
          className="rounded-2xl border p-6 flex flex-col gap-4"
          style={{ borderColor: THEME.panel3, background: THEME.panel }}
        >
          <div className="flex rounded-xl border p-1" style={{ borderColor: THEME.panel3, background: THEME.panel2 }}>
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="auth-btn flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium"
              style={{
                background: mode === "login" ? THEME.violet : "transparent",
                color: mode === "login" ? "#fff" : THEME.muted,
              }}
            >
              <LogIn size={14} /> Log in
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className="auth-btn flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium"
              style={{
                background: mode === "register" ? THEME.violet : "transparent",
                color: mode === "register" ? "#fff" : THEME.muted,
              }}
            >
              <UserPlus size={14} /> Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: THEME.muted }}>
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-input rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ borderColor: THEME.panel3, background: THEME.panel2, color: THEME.cream }}
                placeholder="e.g. player_one"
                autoComplete="username"
                autoFocus
              />
            </div>

            {mode === "register" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium" style={{ color: THEME.muted }}>
                  Display name <span style={{ color: THEME.muted }}>(optional)</span>
                </label>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="auth-input rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{ borderColor: THEME.panel3, background: THEME.panel2, color: THEME.cream }}
                  placeholder="Shown on the leaderboard"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: THEME.muted }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input rounded-lg border px-3 py-2 text-sm outline-none"
                style={{ borderColor: THEME.panel3, background: THEME.panel2, color: THEME.cream }}
                placeholder="At least 4 characters"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </div>

            {error && (
              <p className="text-xs flex items-center gap-1.5" style={{ color: THEME.pink }}>
                <AlertCircle size={13} /> {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="auth-btn mt-1 py-2.5 rounded-lg font-semibold text-sm"
              style={{ background: THEME.violet, color: "#fff", opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: THEME.muted }}>
          {mode === "login" ? "New here?" : "Already have an account?"}{" "}
          <button
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
            className="font-medium underline"
            style={{ color: THEME.violet }}
          >
            {mode === "login" ? "Create an account" : "Log in instead"}
          </button>
        </p>
      </div>
    </div>
  );
}
