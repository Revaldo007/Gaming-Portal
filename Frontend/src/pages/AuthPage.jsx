import React, { useState } from "react";
import { AlertCircle, LogIn, UserPlus, User, Lock } from "lucide-react";
import { THEME } from "../theme";
import { useAuth } from "../context/AuthContext";
import LottiePlayer from "../components/LottiePlayer";

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
      className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden"
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
        .auth-btn:hover { filter: brightness(1.08); transform: translateY(-1px); }
        .auth-btn:active { transform: scale(0.98); }

        .cyber-input {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .cyber-input:focus {
          border-color: ${THEME.violet} !important;
          box-shadow: 0 0 20px rgba(139, 108, 246, 0.4), inset 0 1px 2px rgba(0, 0, 0, 0.5) !important;
          background: rgba(18, 24, 46, 0.95) !important;
        }

        /* Override harsh browser autofill yellow/white box */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-text-fill-color: #F1EFFB !important;
          -webkit-box-shadow: 0 0 0 1000px #0F1528 inset !important;
          box-shadow: 0 0 0 1000px #0F1528 inset !important;
          border-color: rgba(139, 108, 246, 0.45) !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        .glow-btn {
          background: linear-gradient(135deg, #8B6CF6 0%, #D946EF 55%, #F43F5E 100%);
          box-shadow: 0 6px 20px rgba(139, 108, 246, 0.4), 0 2px 10px rgba(244, 63, 94, 0.3);
          transition: all 0.2s ease;
        }
        .glow-btn:hover:not(:disabled) {
          filter: brightness(1.1);
          box-shadow: 0 8px 28px rgba(217, 70, 239, 0.55), 0 0 18px rgba(139, 108, 246, 0.5);
          transform: translateY(-1.5px);
        }
        .glow-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        @keyframes floatGentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(0.6deg); }
        }
        @keyframes floatGentleRev {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(8px) rotate(-0.6deg); }
        }
        @keyframes titleShimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .anim-float-left {
          animation: floatGentle 5.5s ease-in-out infinite;
        }
        .anim-float-right {
          animation: floatGentleRev 6.2s ease-in-out infinite;
        }
        .title-stylish {
          background: linear-gradient(
            90deg,
            #FFFFFF 0%,
            #EDE9FE 18%,
            #C4B5FD 35%,
            #F472B6 58%,
            #DDD6FE 80%,
            #FFFFFF 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: titleShimmer 7s ease-in-out infinite;
          filter: drop-shadow(0 2px 24px rgba(139, 108, 246, 0.45));
        }
      `}</style>

      {/* Main Portal Title */}
      <div className="text-center w-full max-w-[1700px] px-4 z-10 mb-6 md:mb-0 md:absolute md:top-6 lg:top-8 left-0 right-0 mx-auto relative">
        {/* Soft Ambient Title Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 max-w-3xl h-14 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: `linear-gradient(90deg, ${THEME.violet}, ${THEME.pink})` }}
        />

        <h1
          className="title-stylish font-black tracking-tight leading-snug md:whitespace-nowrap relative z-10"
          style={{
            fontSize: "clamp(1.4rem, 2.55vw, 2.75rem)",
          }}
        >
          Multi-Game Web Portal with User Authentication and Score Management
        </h1>

        {/* Refined Glowing Underline Accent */}
        <div className="flex items-center justify-center gap-2 mt-3.5 relative z-10">
          <span
            className="w-1.5 h-1.5 rounded-full opacity-80"
            style={{ background: THEME.violet, boxShadow: `0 0 8px ${THEME.violet}` }}
          />
          <div
            className="h-[3px] w-48 rounded-full"
            style={{
              background: `linear-gradient(90deg, transparent, ${THEME.violet} 25%, ${THEME.pink} 75%, transparent)`,
              boxShadow: "0 0 14px rgba(245, 71, 140, 0.55)",
            }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full opacity-80"
            style={{ background: THEME.pink, boxShadow: `0 0 8px ${THEME.pink}` }}
          />
        </div>
      </div>

      {/* Interactive Portal Showcase: Left Lottie + Center Auth Form + Right Lottie */}
      <div className="w-full max-w-[1550px] mx-auto flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 lg:gap-24 xl:gap-36 2xl:gap-44 z-10 px-6 sm:px-12 lg:px-16 xl:px-24">

        {/* Left Side: Pure Snake & Ladder Animation */}
        <div className="hidden md:flex items-center justify-center flex-1 max-w-[280px] lg:max-w-[320px] xl:max-w-[360px] anim-float-left">
          <div className="w-full aspect-square relative flex items-center justify-center">
            {/* Subtle Ambient Violet Glow */}
            <div
              className="absolute w-44 h-44 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ background: THEME.violet }}
            />
            <LottiePlayer
              src="/Snake ladder Loading animation.json"
              className="w-full h-full relative z-10"
            />
          </div>
        </div>

        {/* Center: Auth Card & Controller */}
        <div className="w-full max-w-[400px] flex-shrink-0 relative">
          
          {/* Subtle Ambient Back-Glow Behind Card */}
          <div
            className="absolute -inset-1 rounded-[32px] blur-2xl opacity-45 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 50% 25%, ${THEME.violet}, ${THEME.pink} 70%, transparent)`,
            }}
          />

          <div className="flex flex-col items-center gap-3 mb-6 relative z-10">
            <div className="relative flex items-center justify-center">
              {/* Glowing aura effect */}
              <div
                className="absolute w-24 h-24 rounded-full blur-2xl opacity-70 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${THEME.violet}, ${THEME.pink})` }}
              />
              {/* Animated Controller GIF */}
              <img
                src="/Controller.gif"
                alt="Gaming Controller"
                className="relative w-20 h-20 object-contain drop-shadow-[0_12px_24px_rgba(139,108,246,0.5)]"
              />
            </div>
          </div>

          <div
            className="relative rounded-3xl border p-6 sm:p-7 flex flex-col gap-4 backdrop-blur-2xl shadow-2xl z-10"
            style={{
              borderColor: "rgba(139, 108, 246, 0.32)",
              background: "linear-gradient(160deg, rgba(26, 33, 58, 0.8) 0%, rgba(13, 17, 34, 0.94) 100%)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 32px rgba(139, 108, 246, 0.2)",
            }}
          >
            {/* Mode Switcher Tabs */}
            <div
              className="flex rounded-xl p-1 border"
              style={{
                borderColor: "rgba(139, 108, 246, 0.2)",
                background: "rgba(10, 14, 26, 0.65)",
              }}
            >
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="auth-btn flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200"
                style={{
                  background: mode === "login"
                    ? `linear-gradient(135deg, ${THEME.violet}, #7C3AED)`
                    : "transparent",
                  color: mode === "login" ? "#ffffff" : THEME.muted,
                  boxShadow: mode === "login"
                    ? "0 4px 14px rgba(139, 108, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : "none",
                }}
              >
                <LogIn size={15} /> Log in
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="auth-btn flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200"
                style={{
                  background: mode === "register"
                    ? `linear-gradient(135deg, ${THEME.violet}, #7C3AED)`
                    : "transparent",
                  color: mode === "register" ? "#ffffff" : THEME.muted,
                  boxShadow: mode === "register"
                    ? "0 4px 14px rgba(139, 108, 246, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)"
                    : "none",
                }}
              >
                <UserPlus size={15} /> Sign up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 mt-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: THEME.muted }}>
                  Username
                </label>
                <div className="relative flex items-center">
                  <User size={15} className="absolute left-3.5 pointer-events-none" style={{ color: THEME.violet }} />
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="cyber-input w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm outline-none"
                    style={{
                      borderColor: "rgba(139, 108, 246, 0.25)",
                      background: "rgba(10, 14, 26, 0.72)",
                      color: THEME.cream,
                    }}
                    placeholder="e.g. player_one"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
              </div>

              {mode === "register" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: THEME.muted }}>
                    Display name <span className="opacity-60 font-normal lowercase">(optional)</span>
                  </label>
                  <div className="relative flex items-center">
                    <User size={15} className="absolute left-3.5 pointer-events-none" style={{ color: THEME.violet }} />
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="cyber-input w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm outline-none"
                      style={{
                        borderColor: "rgba(139, 108, 246, 0.25)",
                        background: "rgba(10, 14, 26, 0.72)",
                        color: THEME.cream,
                      }}
                      placeholder="Shown on the leaderboard"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold tracking-wider uppercase" style={{ color: THEME.muted }}>
                  Password
                </label>
                <div className="relative flex items-center">
                  <Lock size={15} className="absolute left-3.5 pointer-events-none" style={{ color: THEME.violet }} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="cyber-input w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm outline-none"
                    style={{
                      borderColor: "rgba(139, 108, 246, 0.25)",
                      background: "rgba(10, 14, 26, 0.72)",
                      color: THEME.cream,
                    }}
                    placeholder="At least 4 characters"
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                </div>
              </div>

              {error && (
                <div
                  className="text-xs flex items-center gap-2 p-2.5 rounded-xl border"
                  style={{
                    borderColor: "rgba(245, 71, 140, 0.35)",
                    background: "rgba(245, 71, 140, 0.1)",
                    color: "#FFA6C9",
                  }}
                >
                  <AlertCircle size={14} className="flex-shrink-0 text-pink-400" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="glow-btn mt-2 py-3 rounded-xl font-bold text-sm tracking-wide text-white flex items-center justify-center gap-2"
                style={{
                  opacity: submitting ? 0.7 : 1,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? (
                  <span>Please wait…</span>
                ) : mode === "login" ? (
                  <>
                    <LogIn size={16} />
                    <span>Log in</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={16} />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="text-center text-xs mt-5 relative z-10" style={{ color: THEME.muted }}>
            {mode === "login" ? "New here?" : "Already have an account?"}{" "}
            <button
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="font-semibold underline decoration-violet-500/50 hover:decoration-pink-400 transition-all ml-1"
              style={{ color: THEME.cream }}
            >
              {mode === "login" ? "Create an account" : "Log in instead"}
            </button>
          </p>
        </div>

        {/* Right Side: Pure Tic Tac Toe Animation */}
        <div className="hidden md:flex items-center justify-center flex-1 max-w-[280px] lg:max-w-[320px] xl:max-w-[360px] anim-float-right">
          <div className="w-full aspect-square relative flex items-center justify-center">
            {/* Subtle Ambient Pink Glow */}
            <div
              className="absolute w-44 h-44 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ background: THEME.pink }}
            />
            <LottiePlayer
              src="/Tic Tac Toe.json"
              className="w-full h-full relative z-10"
              lightGridStrokes={true}
            />
          </div>
        </div>

      </div>

      {/* Project Credits (Bottom-Right) */}
      <div className="sm:absolute bottom-5 right-6 mt-6 sm:mt-0 text-right z-10">
        <div
          className="px-5 py-3.5 rounded-2xl border backdrop-blur-md inline-block text-right shadow-2xl max-w-sm transition-all duration-300 hover:border-violet-500/40"
          style={{
            borderColor: "rgba(139, 108, 246, 0.25)",
            background: "rgba(18, 23, 42, 0.82)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45)",
          }}
        >
          {/* Developer Details */}
          <p className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase" style={{ color: THEME.muted }}>
            Developed By
          </p>
          <p className="text-sm sm:text-base font-bold tracking-wide mt-0.5" style={{ color: THEME.cream }}>
            Benazir.S
          </p>
          <p className="text-xs sm:text-[13px] font-medium" style={{ color: THEME.violet }}>
            II M.Sc Computer Science
          </p>

          {/* Divider */}
          <div className="h-px w-full my-2 bg-gradient-to-r from-transparent via-violet-500/25 to-transparent" />

          {/* Guidance Details */}
          <p className="text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase" style={{ color: THEME.muted }}>
            Under the Guidance of
          </p>
          <p className="text-sm sm:text-base font-bold tracking-wide mt-0.5" style={{ color: THEME.cream }}>
            Dr. R. Kavitha Jaba Malar
          </p>
          <p className="text-[11px] sm:text-xs font-medium leading-tight mt-0.5" style={{ color: THEME.muted }}>
            Associate Professor & Head
          </p>
          <p className="text-[11px] sm:text-xs font-medium leading-tight" style={{ color: THEME.muted }}>
            Postgraduate & Research Dept. of Computer Science
          </p>
          <p className="text-[11px] sm:text-xs font-semibold mt-0.5" style={{ color: THEME.violet }}>
            Muslim Arts College, Thiruvithancode
          </p>
        </div>
      </div>
    </div>
  );
}
