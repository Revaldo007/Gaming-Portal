import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import {
  Home as HomeIcon,
  Gamepad2,
  Trophy,
  User as UserIcon,
  Award,
  Search,
  Bell,
  Coins,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Star,
  ArrowLeft,
  RotateCcw,
  Play,
  LogOut,
  Flame,
  Sparkles,
  Zap,
  Pencil,
  Check,
} from "lucide-react";

import { THEME } from "./theme";
import { useAuth } from "./context/AuthContext";
import * as api from "./api";

/* ---- small color utility for snake skin gradient ---- */
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bl = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bl})`;
}

/* ---- reusable game-piece icons ---- */
function CarSVG({ id = "car", palette = "violet", flipped = false }) {
  const palettes = {
    violet: { top: "#C9BBFF", mid: THEME.violet, bottom: "#5A3FC0", stroke: "#3B2A85", stripe: THEME.pink, light: THEME.gold },
    red: { top: "#FFB199", mid: "#F0553A", bottom: "#A62E1C", stroke: "#7A2013", stripe: "#FFD873", light: "#FFE38A" },
    amber: { top: "#FFE1A8", mid: "#F0A93A", bottom: "#A66518", stroke: "#7A4A13", stripe: "#FFF3C9", light: "#FFF3C9" },
    teal: { top: "#B4F5E4", mid: "#2FB6A0", bottom: "#166B5C", stroke: "#0F4A40", stripe: "#D6FFF3", light: "#E6FFF7" },
  };
  const c = palettes[palette] || palettes.violet;
  return (
    <svg viewBox="0 0 28 44" width="100%" height="100%" style={{ overflow: "visible", transform: flipped ? "rotate(180deg)" : "none" }}>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c.top} />
          <stop offset="50%" stopColor={c.mid} />
          <stop offset="100%" stopColor={c.bottom} />
        </linearGradient>
      </defs>
      <ellipse cx="14" cy="41.5" rx="10" ry="1.8" fill="#000" opacity="0.3" />
      {/* rear wing */}
      <rect x="3" y="33.5" width="22" height="2.8" rx="1.4" fill={c.stroke} />
      <rect x="9.5" y="29.5" width="9" height="5.5" rx="1.2" fill={c.bottom} />
      {/* wheels */}
      <rect x="1.3" y="8.5" width="3.4" height="7.5" rx="1.5" fill="#14172A" />
      <rect x="23.3" y="8.5" width="3.4" height="7.5" rx="1.5" fill="#14172A" />
      <rect x="1.3" y="26" width="3.4" height="7.5" rx="1.5" fill="#14172A" />
      <rect x="23.3" y="26" width="3.4" height="7.5" rx="1.5" fill="#14172A" />
      {/* body */}
      <path d="M14 1.5c4.4 0 7.2 3.6 7.2 8.6v20.4c0 4.4-3 6.9-7.2 6.9s-7.2-2.5-7.2-6.9V10.1c0-5 2.8-8.6 7.2-8.6z"
        fill={`url(#${id}-body)`} stroke={c.stroke} strokeWidth="0.5" />
      {/* cockpit */}
      <ellipse cx="14" cy="15" rx="4.6" ry="6.2" fill="#171B2E" />
      <ellipse cx="14" cy="12.8" rx="3" ry="2.6" fill="#3A4470" opacity="0.7" />
      {/* side stripes */}
      <rect x="6.2" y="17" width="2" height="13" rx="1" fill={c.stripe} />
      <rect x="19.8" y="17" width="2" height="13" rx="1" fill={c.stripe} />
      {/* headlights */}
      <circle cx="11.2" cy="3.4" r="1.25" fill={c.light} />
      <circle cx="16.8" cy="3.4" r="1.25" fill={c.light} />
    </svg>
  );
}

/* ---- apple icon used for snake food ---- */
function AppleSVG({ variant = "red" }) {
  const palettes = {
    red: { top: "#FF8A80", mid: "#F0553A", bottom: "#A62E1C", leaf: "#5DBE6B", leafDark: "#2F8C4A", stem: "#7A4A2E", shine: "#FFD9CF" },
    gold: { top: "#FFF3C9", mid: THEME.gold, bottom: "#A66518", leaf: "#5DBE6B", leafDark: "#2F8C4A", stem: "#7A4A2E", shine: "#FFFDE7" },
  };
  const c = palettes[variant] || palettes.red;
  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`apple-${variant}`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={c.top} />
          <stop offset="55%" stopColor={c.mid} />
          <stop offset="100%" stopColor={c.bottom} />
        </radialGradient>
      </defs>
      <ellipse cx="16" cy="27.5" rx="8" ry="1.6" fill="#000" opacity="0.22" />
      {/* leaf */}
      <path d="M17 6.5c0-3 2.6-4.6 5.2-4.3-.4 2.9-2.4 4.9-5.2 4.7z" fill={c.leaf} stroke={c.leafDark} strokeWidth="0.4" />
      {/* stem */}
      <path d="M15.6 8.2c-.2-2 .3-4 1.6-5.3" fill="none" stroke={c.stem} strokeWidth="1.4" strokeLinecap="round" />
      {/* body */}
      <path
        d="M16 9.5c3.6-2.4 8.6-.7 9.6 4 1 4.6-1.6 10.4-5 13.4-1.6 1.4-3.2 1.6-4.6 1.6s-3-.2-4.6-1.6c-3.4-3-6-8.8-5-13.4 1-4.7 6-6.4 9.6-4z"
        fill={`url(#apple-${variant})`}
        stroke={c.bottom}
        strokeWidth="0.5"
      />
      {/* shine */}
      <ellipse cx="11.5" cy="14" rx="2.6" ry="4" fill={c.shine} opacity="0.55" />
    </svg>
  );
}

/* ---- cherry icon (twin cherries) ---- */
function CherrySVG() {
  const mid = "#E0294B", top = "#FF7A8E", bottom = "#8C1030", leaf = "#5DBE6B", leafDark = "#2F8C4A", stem = "#7A4A2E", shine = "#FFD3DC";
  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="cherry-a" cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor={top} /><stop offset="55%" stopColor={mid} /><stop offset="100%" stopColor={bottom} />
        </radialGradient>
      </defs>
      <ellipse cx="16" cy="28.5" rx="9" ry="1.5" fill="#000" opacity="0.2" />
      <path d="M16.5 5c-.6-1.6-.2-3.3 1-4.6" fill="none" stroke={stem} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M17.5 1.6c1.4-1 3.1-1.1 4.4-.2" fill="none" stroke={stem} strokeWidth="1.1" strokeLinecap="round" />
      <path d="M20.5 1.1c0-2 1.7-3.3 3.8-3.1-.2 2.2-1.8 3.6-3.8 3.1z" fill={leaf} stroke={leafDark} strokeWidth="0.35" transform="translate(0,3)" />
      <circle cx="10.5" cy="19" r="7.4" fill="url(#cherry-a)" stroke={bottom} strokeWidth="0.5" />
      <circle cx="21.5" cy="21.5" r="7.4" fill="url(#cherry-a)" stroke={bottom} strokeWidth="0.5" />
      <ellipse cx="8" cy="15.5" rx="1.8" ry="2.6" fill={shine} opacity="0.6" />
      <ellipse cx="19" cy="18" rx="1.8" ry="2.6" fill={shine} opacity="0.6" />
    </svg>
  );
}

/* ---- berry icon (cluster) ---- */
function BerrySVG() {
  const mid = "#7B4FE0", top = "#B79CFF", bottom = "#4A2E96", leaf = "#5DBE6B", leafDark = "#2F8C4A", shine = "#E7DBFF";
  const berry = (cx, cy, r) => (
    <g key={`${cx}-${cy}`}>
      <circle cx={cx} cy={cy} r={r} fill="url(#berry-a)" stroke={bottom} strokeWidth="0.4" />
      <ellipse cx={cx - r * 0.35} cy={cy - r * 0.4} rx={r * 0.32} ry={r * 0.45} fill={shine} opacity="0.5" />
    </g>
  );
  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="berry-a" cx="35%" cy="28%" r="80%">
          <stop offset="0%" stopColor={top} /><stop offset="55%" stopColor={mid} /><stop offset="100%" stopColor={bottom} />
        </radialGradient>
      </defs>
      <ellipse cx="16" cy="28.5" rx="9" ry="1.5" fill="#000" opacity="0.2" />
      <path d="M16 8c0-2.6 2-4 4.4-3.7-.4 2.5-2 4-4.4 3.7z" fill={leaf} stroke={leafDark} strokeWidth="0.35" />
      {berry(12, 12, 5.6)}
      {berry(20.5, 12.5, 5.6)}
      {berry(9.5, 21, 6.2)}
      {berry(17.5, 22, 6.4)}
      {berry(23.5, 20, 5.6)}
    </svg>
  );
}

/* ---- special gem icon ---- */
function GemSVG() {
  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="gem-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D6FFF8" />
          <stop offset="45%" stopColor="#4FE0D0" />
          <stop offset="100%" stopColor="#7B4FE0" />
        </linearGradient>
      </defs>
      <ellipse cx="16" cy="28" rx="8.5" ry="1.5" fill="#000" opacity="0.22" />
      <path d="M6 12 L16 4 L26 12 L16 29 Z" fill="url(#gem-a)" stroke="#3B2A85" strokeWidth="0.6" />
      <path d="M6 12 L16 12 L16 29 Z" fill="#fff" opacity="0.14" />
      <path d="M16 4 L11 12 L16 12 L21 12 Z" fill="#fff" opacity="0.28" />
      <path d="M6 12 L26 12" stroke="#3B2A85" strokeWidth="0.5" opacity="0.6" />
      <path d="M11 12 L16 29" stroke="#3B2A85" strokeWidth="0.4" opacity="0.35" />
      <path d="M21 12 L16 29" stroke="#3B2A85" strokeWidth="0.4" opacity="0.35" />
    </svg>
  );
}

/* ===========================================================
   STATIC DATA
=========================================================== */

const GAMES = [
  {
    id: "chess",
    name: "Chess",
    emoji: "♟️",
    category: "Strategy",
    difficulty: "Hard",
    rating: 4.9,
    badge: "New",
    blurb: "Classic chess against the CPU. Outmaneuver it and deliver checkmate.",
    gradient: "linear-gradient(135deg,#2E2A45,#12131F)",
    image: "https://plus.unsplash.com/premium_photo-1670183859029-99a0a2c1912b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2hlc3MlMjBnYW1lfGVufDB8fDB8fHww",
    externalImage: "https://plus.unsplash.com/premium_photo-1670183859029-99a0a2c1912b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Y2hlc3MlMjBnYW1lfGVufDB8fDB8fHww",
  },
  {
    id: "carrace",
    name: "Lane Racer",
    emoji: "🏎️",
    category: "Arcade",
    difficulty: "Hard",
    rating: 4.7,
    badge: "New",
    blurb: "Swerve between lanes and dodge oncoming traffic as it speeds up.",
    gradient: "linear-gradient(135deg,#4A1F2E,#171B22)",
    image: "/games/carrace.jpg",
    externalImage: "https://t3.ftcdn.net/jpg/20/84/03/20/240_F_2084032042_qI8WB0lV9jSTFxq0VHXpi5akbX9E0Mw6.jpg",
  },
  {
    id: "tictactoe",
    name: "Tic Tac Toe",
    emoji: "❌",
    category: "Strategy",
    difficulty: "Easy",
    rating: 4.6,
    badge: "Hot",
    blurb: "Two players, three in a row, one bragging right.",
    gradient: "linear-gradient(135deg,#3A2E6B,#171B33)",
    image: "/games/tictactoe.jpg",
    externalImage: "https://t4.ftcdn.net/jpg/00/00/16/21/240_F_162140_5C5kXTvE1p8HEWTPMextCUwFgm5FBU.jpg",
  },
  {
    id: "snake",
    name: "Snake",
    emoji: "🐍",
    category: "Arcade",
    difficulty: "Hard",
    rating: 4.8,
    badge: "Popular",
    blurb: "Eat, grow, don't bite yourself. Arrow keys to steer.",
    gradient: "linear-gradient(135deg,#1E4B3C,#101C29)",
    image: "/games/snake.jpg",
    externalImage: "https://stock.adobe.com/v1/pics/placeholders/spacer.gif",
  },
  {
    id: "memory",
    name: "Memory Match",
    emoji: "🧩",
    category: "Puzzle",
    difficulty: "Medium",
    rating: 4.5,
    badge: null,
    blurb: "Flip, remember, match. Fewer moves, higher score.",
    gradient: "linear-gradient(135deg,#3D2A55,#171B33)",
    image: "/games/memory.jpg",
    externalImage: "https://t3.ftcdn.net/jpg/05/51/56/66/240_F_551566628_yk5hn3rhSKOVAnE3xfG4VxFa0X6Droma.jpg",
  },
  {
    id: "quiz",
    name: "Quick Quiz",
    emoji: "🧠",
    category: "Quiz",
    difficulty: "Medium",
    rating: 4.4,
    badge: null,
    blurb: "Five questions. Speed doesn't count, accuracy does.",
    gradient: "linear-gradient(135deg,#264A5E,#131B2C)",
    image: "/games/quiz.jpg",
    externalImage: "https://t4.ftcdn.net/jpg/13/83/36/11/240_F_1383361184_0BWJdJwf5bZZoxEJwb9Jzrf1She52zI1.jpg",
  },
  {
    id: "rps",
    name: "Rock Paper Scissors",
    emoji: "✊",
    category: "Casual",
    difficulty: "Easy",
    rating: 4.3,
    badge: null,
    blurb: "Best of five against the house. No skill, all nerve.",
    gradient: "linear-gradient(135deg,#5A2E3C,#171B22)",
    image: "/games/rps.jpg",
    externalImage: "https://t4.ftcdn.net/jpg/14/69/49/59/240_F_1469495941_WrXH8kqUDmh8yZBzOp5uuhTWgHjgkvDu.jpg",
  },
  {
    id: "whackamole",
    name: "Whack-a-Mole",
    emoji: "🔨",
    category: "Arcade",
    difficulty: "Medium",
    rating: 4.5,
    badge: "New",
    blurb: "Chain combos on golden moles, dodge the bombs, beat the clock. 30 frantic seconds.",
    gradient: "linear-gradient(135deg,#4A3B1F,#1B1710)",
    image: "/games/whackamole.jpg",
    externalImage: "https://t4.ftcdn.net/jpg/21/15/19/59/240_F_2115195970_s9IBhaEfH2wRKqh3OAnPe9y6NogXtaQ2.jpg",
  },
];

const COMING_SOON = [
  { id: "cs1", name: "Math Challenge", emoji: "🔢", category: "Puzzle" },
  { id: "cs2", name: "Simple Pong", emoji: "🏓", category: "Arcade" },
  { id: "cs3", name: "Word Scramble", emoji: "🔤", category: "Quiz" },
  { id: "cs4", name: "2048 Merge", emoji: "🟨", category: "Puzzle" },
];

const CATEGORIES = ["All", "Arcade", "Puzzle", "Quiz", "Strategy", "Casual"];

const QUIZ_QUESTIONS = [
  {
    q: "Which language runs natively in a web browser?",
    options: ["Python", "JavaScript", "C++", "Rust"],
    a: 1,
  },
  {
    q: "In React, what hook manages local component state?",
    options: ["useEffect", "useRef", "useState", "useMemo"],
    a: 2,
  },
  {
    q: "What does REST stand for, at its core?",
    options: [
      "Rapid External State Transfer",
      "Representational State Transfer",
      "Remote Server Transaction",
      "Recursive State Tree",
    ],
    a: 1,
  },
  {
    q: "Which utility-first CSS framework styles this portal?",
    options: ["Bootstrap", "Bulma", "Tailwind CSS", "Foundation"],
    a: 2,
  },
  {
    q: "In Tic Tac Toe, how many squares are on the board?",
    options: ["6", "9", "12", "16"],
    a: 1,
  },
];

/* ===========================================================
   SHARED UI
=========================================================== */

function FadeIn({ viewKey, children }) {
  // Re-mounts on key change, kicking off a CSS fade/slide-up each time the view changes.
  return (
    <div key={viewKey} className="anim-fadein">
      {children}
    </div>
  );
}

function Stars({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <Star size={12} fill={THEME.gold} color={THEME.gold} />
      <span className="text-xs" style={{ color: THEME.muted }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

function ScorePanel({ score, label = "Score" }) {
  const prev = useRef(score);
  const [bump, setBump] = useState(false);
  useEffect(() => {
    if (prev.current !== score) {
      setBump(true);
      prev.current = score;
      const t = setTimeout(() => setBump(false), 320);
      return () => clearTimeout(t);
    }
  }, [score]);
  return (
    <div
      className="score-panel inline-flex items-center gap-3 px-4 py-2 rounded-xl border"
      style={{ borderColor: THEME.panel3, background: `linear-gradient(180deg, ${THEME.panel2}, ${THEME.panel})` }}
    >
      <span className="text-xs uppercase tracking-wide" style={{ color: THEME.muted, letterSpacing: "0.06em" }}>
        {label}
      </span>
      <span
        className={bump ? "score-bump" : ""}
        style={{ fontFamily: "'Press Start 2P', monospace", color: THEME.gold, fontSize: "1rem", display: "inline-block" }}
      >
        {score}
      </span>
    </div>
  );
}

function GameOverPanel({ title, detail, onReplay, onBack }) {
  const confetti = ["🎉", "✨", "🏆", "⭐", "🎊"];
  return (
    <div
      className="anim-gameover relative text-center rounded-2xl border p-8 flex flex-col items-center gap-4 overflow-hidden"
      style={{ borderColor: THEME.gold, background: `radial-gradient(circle at 50% -10%, rgba(255,183,3,0.18), transparent 55%), ${THEME.panel2}` }}
    >
      <div className="pointer-events-none absolute inset-0">
        {confetti.map((c, i) => (
          <span key={i} className="confetti-piece" style={{ left: `${8 + i * 20}%`, animationDelay: `${i * 0.12}s` }}>
            {c}
          </span>
        ))}
      </div>
      <span className="text-4xl trophy-pop">🏁</span>
      <h3 style={{ fontFamily: "'Press Start 2P', monospace", color: THEME.gold }} className="text-lg relative">
        {title}
      </h3>
      <p style={{ color: THEME.muted }} className="relative">{detail}</p>
      <div className="flex gap-3 relative">
        <button onClick={onReplay} className="btn-press flex items-center gap-2 px-4 py-2 rounded-lg font-medium"
          style={{ background: THEME.pink, color: "#fff" }}>
          <RotateCcw size={16} /> Play again
        </button>
        <button onClick={onBack} className="btn-press flex items-center gap-2 px-4 py-2 rounded-lg font-medium border"
          style={{ borderColor: THEME.panel3, color: THEME.cream }}>
          <ArrowLeft size={16} /> Back to games
        </button>
      </div>
    </div>
  );
}

/* Game card used in carousels + grids, styled after a game-store tile */
function GameCard({ game, onPlay, wide }) {
  const imgSrc = game.image || game.externalImage;
  return (
    <button
      onClick={() => onPlay(game.id)}
      className="game-card group text-left rounded-2xl overflow-hidden border flex-shrink-0 transition-all duration-300 hover:border-[#8B6CF6]/50 hover:shadow-xl hover:shadow-[#8B6CF6]/10"
      style={{
        borderColor: THEME.panel3,
        background: THEME.panel,
        width: wide ? "min(88vw, 260px)" : "100%",
      }}
    >
      <div
        className="relative flex items-center justify-center h-36 overflow-hidden"
        style={{ background: game.gradient }}
      >
        {imgSrc && (
          <img
            src={imgSrc}
            alt={game.name}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              if (game.externalImage && e.currentTarget.src !== game.externalImage && !game.externalImage.includes("spacer.gif")) {
                e.currentTarget.src = game.externalImage;
              }
            }}
          />
        )}
        {/* Soft bottom vignette overlay to blend into the card body */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e131f] via-transparent to-black/20 pointer-events-none" />

        {/* Floating emoji icon badge in bottom-left */}
        <span
          className="absolute bottom-2 left-2 text-base w-7 h-7 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-110"
        >
          {game.emoji}
        </span>

        {game.badge && (
          <span
            className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-md backdrop-blur-sm"
            style={{
              background: game.badge === "New" ? THEME.green : game.badge === "Hot" ? THEME.pink : THEME.violet,
              color: "#fff",
            }}
          >
            {game.badge}
          </span>
        )}
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <p className="font-semibold text-sm truncate" style={{ color: THEME.cream }}>
          {game.name}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] px-2 py-0.5 rounded-full border" style={{ borderColor: THEME.panel3, color: THEME.muted }}>
            {game.category}
          </span>
          <Stars rating={game.rating} />
        </div>
        <span
          className="mt-1 text-center text-xs font-medium rounded-lg py-1.5 transition-colors group-hover:bg-[#8B6CF6] group-hover:text-white"
          style={{ background: THEME.panel2, color: THEME.gold }}
        >
          Play now
        </span>
      </div>
    </button>
  );
}

function ComingSoonCard({ game }) {
  return (
    <div
      className="rounded-2xl overflow-hidden border flex-shrink-0 opacity-60"
      style={{ borderColor: THEME.panel3, background: THEME.panel, width: "min(88vw, 260px)" }}
    >
      <div className="flex items-center justify-center h-32" style={{ background: THEME.panel2 }}>
        <span className="text-5xl grayscale">{game.emoji}</span>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <p className="font-semibold text-sm" style={{ color: THEME.cream }}>{game.name}</p>
        <span className="text-[11px]" style={{ color: THEME.muted }}>{game.category} · Coming soon</span>
      </div>
    </div>
  );
}

/* Horizontal carousel with smooth-scroll arrow buttons */
function Carousel({ children }) {
  const ref = useRef(null);
  function scroll(dir) {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * 300, behavior: "smooth" });
  }
  return (
    <div className="relative">
      <div ref={ref} className="carousel-track no-scrollbar flex gap-4 overflow-x-auto pb-2 snap-x snap-proximity">
        {React.Children.map(children, (c) => (
          <div className="snap-start">{c}</div>
        ))}
      </div>
      <button
        onClick={() => scroll(-1)}
        className="btn-press hidden sm:flex absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full items-center justify-center border shadow-lg"
        style={{ background: THEME.panel2, borderColor: THEME.panel3, color: THEME.cream }}
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={() => scroll(1)}
        className="btn-press hidden sm:flex absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full items-center justify-center border shadow-lg"
        style={{ background: THEME.panel2, borderColor: THEME.panel3, color: THEME.cream }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

/* ===========================================================
   GAMES (logic unchanged, presentation shared via GameOverPanel/ScorePanel)
=========================================================== */

const TTT_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function tttCheckWinner(b) {
  for (const line of TTT_LINES) {
    const [a, c, d] = line;
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { who: b[a], line };
  }
  if (b.every(Boolean)) return { who: "draw", line: null };
  return null;
}

/* Minimax search (depth-weighted so the CPU prefers the fastest win / slowest loss) */
function tttMinimax(b, player, depth, cpuMark, playerMark) {
  const result = tttCheckWinner(b);
  if (result) {
    if (result.who === cpuMark) return 10 - depth;
    if (result.who === playerMark) return depth - 10;
    return 0;
  }
  const avail = b.reduce((acc, v, i) => (v ? acc : [...acc, i]), []);
  if (player === cpuMark) {
    let best = -Infinity;
    for (const idx of avail) {
      const next = [...b];
      next[idx] = cpuMark;
      best = Math.max(best, tttMinimax(next, playerMark, depth + 1, cpuMark, playerMark));
    }
    return best;
  }
  let best = Infinity;
  for (const idx of avail) {
    const next = [...b];
    next[idx] = playerMark;
    best = Math.min(best, tttMinimax(next, cpuMark, depth + 1, cpuMark, playerMark));
  }
  return best;
}

/* Would placing the CPU's mark at idx immediately hand the player a winning reply? (1-ply safety check) */
function tttMoveIsSafe(b, idx, cpuMark, playerMark) {
  const afterCpu = [...b];
  afterCpu[idx] = cpuMark;
  if (tttCheckWinner(afterCpu)) return true;
  return !afterCpu.some((v, j) => {
    if (v) return false;
    const afterPlayer = [...afterCpu];
    afterPlayer[j] = playerMark;
    return tttCheckWinner(afterPlayer)?.who === playerMark;
  });
}

/* Picks the CPU's move: strong by default, with a touch of humanlike imperfection so it stays beatable */
function tttGetCpuMove(b, cpuMark, playerMark) {
  const avail = b.reduce((acc, v, i) => (v ? acc : [...acc, i]), []);
  if (avail.length === 9) {
    const openings = [0, 2, 4, 6, 8];
    return openings[Math.floor(Math.random() * openings.length)];
  }
  const relaxed = avail.length > 3 && Math.random() < 0.18;
  if (relaxed) {
    const safeMoves = avail.filter((idx) => tttMoveIsSafe(b, idx, cpuMark, playerMark));
    if (safeMoves.length) return safeMoves[Math.floor(Math.random() * safeMoves.length)];
  }
  let bestScore = -Infinity;
  let bestMoves = [];
  for (const idx of avail) {
    const next = [...b];
    next[idx] = cpuMark;
    const score = tttMinimax(next, playerMark, 0, cpuMark, playerMark);
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [idx];
    } else if (score === bestScore) {
      bestMoves.push(idx);
    }
  }
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

// Randomly decides who takes the first turn each round
function tttRandomFirstTurn(playerMark, cpuMark) {
  return Math.random() < 0.5 ? playerMark : cpuMark;
}

function TicTacToe({ onFinish }) {
  const empty = Array(9).fill(null);
  const [playerMark, setPlayerMark] = useState("X");
  const cpuMark = playerMark === "X" ? "O" : "X";
  const [board, setBoard] = useState(empty);
  const [turn, setTurn] = useState(() => tttRandomFirstTurn("X", "O")); // who goes 1st/2nd is randomized each round
  const [winner, setWinner] = useState(null);
  const [winLine, setWinLine] = useState(null);
  const [wins, setWins] = useState({ X: 0, O: 0 });
  const [thinking, setThinking] = useState(false);
  const cpuTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(cpuTimerRef.current), []);

  function applyMove(i, mark, currentBoard) {
    const next = [...currentBoard];
    next[i] = mark;
    setBoard(next);
    const result = tttCheckWinner(next);
    if (result) {
      setWinLine(result.line);
      setTimeout(() => setWinner(result.who), result.line ? 550 : 0);
      if (result.who !== "draw") setWins((w) => ({ ...w, [result.who]: w[result.who] + 1 }));
    } else {
      setTurn(mark === "X" ? "O" : "X");
    }
  }

  function place(i) {
    if (board[i] || winner || turn !== playerMark || thinking) return;
    applyMove(i, playerMark, board);
  }

  // Auto-player: whenever it's the CPU's turn, it thinks for a beat and then moves on its own
  useEffect(() => {
    if (winner || turn !== cpuMark) return;
    setThinking(true);
    cpuTimerRef.current = setTimeout(() => {
      setBoard((currentBoard) => {
        const move = tttGetCpuMove(currentBoard, cpuMark, playerMark);
        if (move != null) applyMove(move, cpuMark, currentBoard);
        return currentBoard;
      });
      setThinking(false);
    }, 550 + Math.random() * 350);
    return () => clearTimeout(cpuTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, winner, cpuMark]);

  function reset() {
    clearTimeout(cpuTimerRef.current);
    setBoard(empty);
    setTurn(tttRandomFirstTurn(playerMark, cpuMark));
    setWinner(null);
    setWinLine(null);
    setThinking(false);
  }

  // Lets the player pick which mark they want to play as; starts a fresh match
  function choosePlayerMark(mark) {
    if (mark === playerMark) return;
    clearTimeout(cpuTimerRef.current);
    const newCpuMark = mark === "X" ? "O" : "X";
    setPlayerMark(mark);
    setBoard(empty);
    setTurn(tttRandomFirstTurn(mark, newCpuMark));
    setWinner(null);
    setWinLine(null);
    setThinking(false);
    setWins({ X: 0, O: 0 });
  }

  function finishSession() {
    onFinish({
      score: wins.X + wins.O === 0 ? 0 : Math.max(wins.X, wins.O),
      result: wins[playerMark] === wins[cpuMark] ? "Draw" : wins[playerMark] > wins[cpuMark] ? "Won" : "Lost",
    });
  }

  // Only allow switching sides between rounds, not mid-match
  const gameInProgress = board.some(Boolean) && !winner;

  const LINE_STYLE = {
    "0,1,2": { top: "16.5%", left: "50%", width: "92%", rotate: "0deg" },
    "3,4,5": { top: "50%", left: "50%", width: "92%", rotate: "0deg" },
    "6,7,8": { top: "83.5%", left: "50%", width: "92%", rotate: "0deg" },
    "0,3,6": { top: "50%", left: "16.5%", width: "92%", rotate: "90deg" },
    "1,4,7": { top: "50%", left: "50%", width: "92%", rotate: "90deg" },
    "2,5,8": { top: "50%", left: "83.5%", width: "92%", rotate: "90deg" },
    "0,4,8": { top: "50%", left: "50%", width: "128%", rotate: "45deg" },
    "2,4,6": { top: "50%", left: "50%", width: "128%", rotate: "-45deg" },
  };

  const boardLocked = !!winner || turn !== playerMark || thinking;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2 p-1 rounded-full" style={{ background: THEME.panel, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)" }}>
        <span className="text-xs pl-2 pr-1" style={{ color: THEME.muted }}>Play as</span>
        {["X", "O"].map((mark) => (
          <button
            key={mark}
            onClick={() => choosePlayerMark(mark)}
            disabled={gameInProgress}
            aria-pressed={playerMark === mark}
            className="btn-press text-sm font-bold w-9 h-9 rounded-full border flex items-center justify-center"
            style={{
              borderColor: playerMark === mark ? THEME.pink : THEME.panel3,
              background: playerMark === mark ? "rgba(255,60,120,0.14)" : THEME.panel2,
              color: playerMark === mark ? THEME.pink : THEME.muted,
              opacity: gameInProgress && playerMark !== mark ? 0.45 : 1,
              cursor: gameInProgress ? "not-allowed" : "pointer",
            }}
          >
            {mark}
          </button>
        ))}
      </div>
      <div className="flex gap-4">
        <div className="relative">
          <ScorePanel score={wins[playerMark]} label="You" />
          {!winner && turn === playerMark && !thinking && <span className="turn-dot" style={{ background: THEME.pink }} />}
        </div>
        <div className="relative">
          <ScorePanel score={wins[cpuMark]} label="CPU" />
          {!winner && turn === cpuMark && <span className="turn-dot" style={{ background: THEME.gold }} />}
        </div>
      </div>
      {!winner ? (
        <>
          <p style={{ color: THEME.muted, minHeight: "1.5em" }}>
            {thinking ? (
              <span className="ttt-thinking">
                CPU is thinking<span className="ttt-thinking-dots"><span>.</span><span>.</span><span>.</span></span>
              </span>
            ) : (
              <>Turn: <span style={{ color: THEME.pink, fontWeight: 600 }}>Your move</span></>
            )}
          </p>
          <div
            className={`relative grid grid-cols-3 gap-2 p-2 rounded-2xl ttt-board ${thinking ? "ttt-board-thinking" : ""}`}
            style={{ background: THEME.panel, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)" }}
          >
            {board.map((cell, i) => {
              const onWinLine = winLine && winLine.includes(i);
              return (
                <button key={i} onClick={() => place(i)} disabled={!!cell || boardLocked}
                  aria-label={cell ? `Cell ${i + 1}, ${cell}` : `Cell ${i + 1}, empty`}
                  className="ttt-cell btn-press w-20 h-20 sm:w-24 sm:h-24 rounded-xl border text-4xl font-bold flex items-center justify-center"
                  style={{
                    borderColor: onWinLine ? THEME.gold : THEME.panel3,
                    background: onWinLine ? "rgba(255,183,3,0.12)" : THEME.panel2,
                    color: cell === playerMark ? THEME.pink : THEME.gold,
                    cursor: cell || boardLocked ? "default" : "pointer",
                  }}>
                  {cell && <span className="mark-pop" key={cell + i}>{cell}</span>}
                </button>
              );
            })}
            {winLine && (
              <span
                className="win-strike-wrap"
                style={{
                  top: LINE_STYLE[winLine.join(",")].top,
                  left: LINE_STYLE[winLine.join(",")].left,
                  width: LINE_STYLE[winLine.join(",")].width,
                  transform: `translate(-50%, -50%) rotate(${LINE_STYLE[winLine.join(",")].rotate})`,
                }}
              >
                <span className="win-strike-bar" style={{ background: THEME.gold, color: THEME.gold }} />
              </span>
            )}
          </div>
        </>
      ) : (
        <GameOverPanel title={winner === "draw" ? "Draw" : winner === playerMark ? "You win the round" : "CPU wins the round"}
          detail="Play another round, or bank this session's score." onReplay={reset} onBack={finishSession} />
      )}
      {!winner && (
        <button onClick={finishSession} className="text-sm underline btn-press" style={{ color: THEME.muted }}>
          End session &amp; save score
        </button>
      )}
    </div>
  );
}

/* ---- chess engine (pure functions, no UI) ---- */
const CHESS_KNIGHT_OFFSETS = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const CHESS_KING_OFFSETS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const CHESS_BISHOP_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
const CHESS_ROOK_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const CHESS_PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
const CHESS_GLYPH = {
  wk: "♔", wq: "♕", wr: "♖", wb: "♗", wn: "♘", wp: "♙",
  bk: "♚", bq: "♛", br: "♜", bb: "♝", bn: "♞", bp: "♟",
};
const CHESS_CPU_DEPTH = 3;

function chessInitialBoard() {
  return [
    ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
    ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
    ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"],
  ];
}
function chessInitialState() {
  return { castling: { wK: true, wQ: true, bK: true, bQ: true }, enPassant: null };
}
function chessCloneBoard(b) { return b.map((row) => row.slice()); }
function chessInBounds(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
function chessColor(p) { return p ? p[0] : null; }
function chessType(p) { return p ? p[1] : null; }

function chessPseudoMovesForSquare(board, r, c, state) {
  const piece = board[r][c];
  if (!piece) return [];
  const color = chessColor(piece);
  const type = chessType(piece);
  const moves = [];
  if (type === "p") {
    const dir = color === "w" ? -1 : 1;
    const startRow = color === "w" ? 6 : 1;
    const promoRow = color === "w" ? 0 : 7;
    const addForward = (nr, nc, opts = {}) => {
      if (nr === promoRow) {
        for (const promo of ["q", "r", "b", "n"]) {
          moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: null, promotion: promo });
        }
      } else {
        moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: null, isDoublePawnPush: !!opts.double });
      }
    };
    const addCapture = (nr, nc, captured) => {
      if (nr === promoRow) {
        for (const promo of ["q", "r", "b", "n"]) {
          moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured, promotion: promo });
        }
      } else {
        moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured });
      }
    };
    if (chessInBounds(r + dir, c) && !board[r + dir][c]) {
      addForward(r + dir, c);
      if (r === startRow && !board[r + 2 * dir][c]) addForward(r + 2 * dir, c, { double: true });
    }
    for (const dc of [-1, 1]) {
      const nr = r + dir, nc = c + dc;
      if (!chessInBounds(nr, nc)) continue;
      const target = board[nr][nc];
      if (target && chessColor(target) !== color) {
        addCapture(nr, nc, target);
      } else if (state.enPassant && state.enPassant.r === nr && state.enPassant.c === nc) {
        moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: (color === "w" ? "b" : "w") + "p", enPassantCapture: true });
      }
    }
  } else if (type === "n") {
    for (const [dr, dc] of CHESS_KNIGHT_OFFSETS) {
      const nr = r + dr, nc = c + dc;
      if (!chessInBounds(nr, nc)) continue;
      const target = board[nr][nc];
      if (!target || chessColor(target) !== color) moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: target || null });
    }
  } else if (type === "b" || type === "r" || type === "q") {
    const dirs = type === "b" ? CHESS_BISHOP_DIRS : type === "r" ? CHESS_ROOK_DIRS : CHESS_BISHOP_DIRS.concat(CHESS_ROOK_DIRS);
    for (const [dr, dc] of dirs) {
      let nr = r + dr, nc = c + dc;
      while (chessInBounds(nr, nc)) {
        const target = board[nr][nc];
        if (!target) {
          moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: null });
        } else {
          if (chessColor(target) !== color) moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: target });
          break;
        }
        nr += dr; nc += dc;
      }
    }
  } else if (type === "k") {
    for (const [dr, dc] of CHESS_KING_OFFSETS) {
      const nr = r + dr, nc = c + dc;
      if (!chessInBounds(nr, nc)) continue;
      const target = board[nr][nc];
      if (!target || chessColor(target) !== color) moves.push({ from: { r, c }, to: { r: nr, c: nc }, piece, captured: target || null });
    }
  }
  return moves;
}

function chessSquareAttacked(board, r, c, byColor) {
  const pawnDir = byColor === "w" ? 1 : -1;
  for (const dc of [-1, 1]) {
    const pr = r + pawnDir, pc = c + dc;
    if (chessInBounds(pr, pc) && board[pr][pc] === byColor + "p") return true;
  }
  for (const [dr, dc] of CHESS_KNIGHT_OFFSETS) {
    const nr = r + dr, nc = c + dc;
    if (chessInBounds(nr, nc) && board[nr][nc] === byColor + "n") return true;
  }
  for (const [dr, dc] of CHESS_KING_OFFSETS) {
    const nr = r + dr, nc = c + dc;
    if (chessInBounds(nr, nc) && board[nr][nc] === byColor + "k") return true;
  }
  for (const [dr, dc] of CHESS_BISHOP_DIRS) {
    let nr = r + dr, nc = c + dc;
    while (chessInBounds(nr, nc)) {
      const t = board[nr][nc];
      if (t) { if (chessColor(t) === byColor && (chessType(t) === "b" || chessType(t) === "q")) return true; break; }
      nr += dr; nc += dc;
    }
  }
  for (const [dr, dc] of CHESS_ROOK_DIRS) {
    let nr = r + dr, nc = c + dc;
    while (chessInBounds(nr, nc)) {
      const t = board[nr][nc];
      if (t) { if (chessColor(t) === byColor && (chessType(t) === "r" || chessType(t) === "q")) return true; break; }
      nr += dr; nc += dc;
    }
  }
  return false;
}

function chessFindKing(board, color) {
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) if (board[r][c] === color + "k") return { r, c };
  return null;
}
function chessInCheck(board, color) {
  const kp = chessFindKing(board, color);
  if (!kp) return false;
  return chessSquareAttacked(board, kp.r, kp.c, color === "w" ? "b" : "w");
}

function chessMakeMove(board, state, move) {
  const nb = chessCloneBoard(board);
  const { from, to, piece } = move;
  nb[from.r][from.c] = null;
  if (move.enPassantCapture) nb[from.r][to.c] = null;
  nb[to.r][to.c] = move.promotion ? chessColor(piece) + move.promotion : piece;
  if (move.castle === "K") {
    nb[from.r][5] = nb[from.r][7];
    nb[from.r][7] = null;
  } else if (move.castle === "Q") {
    nb[from.r][3] = nb[from.r][0];
    nb[from.r][0] = null;
  }
  const color = chessColor(piece);
  const type = chessType(piece);
  const ns = { castling: { ...state.castling }, enPassant: null };
  if (type === "k") { ns.castling[color + "K"] = false; ns.castling[color + "Q"] = false; }
  if (type === "r") {
    const homeRow = color === "w" ? 7 : 0;
    if (from.r === homeRow && from.c === 0) ns.castling[color + "Q"] = false;
    if (from.r === homeRow && from.c === 7) ns.castling[color + "K"] = false;
  }
  if (move.captured) {
    const capColor = color === "w" ? "b" : "w";
    const capHomeRow = capColor === "w" ? 7 : 0;
    if (to.r === capHomeRow && to.c === 0) ns.castling[capColor + "Q"] = false;
    if (to.r === capHomeRow && to.c === 7) ns.castling[capColor + "K"] = false;
  }
  if (move.isDoublePawnPush) ns.enPassant = { r: (from.r + to.r) / 2, c: from.c };
  return { board: nb, state: ns };
}

function chessCastleMoves(board, color, state) {
  const moves = [];
  const row = color === "w" ? 7 : 0;
  const opp = color === "w" ? "b" : "w";
  if (board[row][4] !== color + "k") return moves;
  if (chessSquareAttacked(board, row, 4, opp)) return moves;
  if (state.castling[color + "K"] && !board[row][5] && !board[row][6] && board[row][7] === color + "r") {
    if (!chessSquareAttacked(board, row, 5, opp) && !chessSquareAttacked(board, row, 6, opp)) {
      moves.push({ from: { r: row, c: 4 }, to: { r: row, c: 6 }, piece: color + "k", captured: null, castle: "K" });
    }
  }
  if (state.castling[color + "Q"] && !board[row][1] && !board[row][2] && !board[row][3] && board[row][0] === color + "r") {
    if (!chessSquareAttacked(board, row, 3, opp) && !chessSquareAttacked(board, row, 2, opp)) {
      moves.push({ from: { r: row, c: 4 }, to: { r: row, c: 2 }, piece: color + "k", captured: null, castle: "Q" });
    }
  }
  return moves;
}

function chessLegalMoves(board, color, state) {
  const pseudo = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] && chessColor(board[r][c]) === color) pseudo.push(...chessPseudoMovesForSquare(board, r, c, state));
    }
  }
  pseudo.push(...chessCastleMoves(board, color, state));
  return pseudo.filter((m) => {
    const { board: nb } = chessMakeMove(board, state, m);
    return !chessInCheck(nb, color);
  });
}

function chessEvaluate(board) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;
      const val = CHESS_PIECE_VALUES[chessType(p)];
      const centerBonus = (r === 3 || r === 4) && (c === 3 || c === 4) ? 6 : 0;
      score += chessColor(p) === "w" ? val + centerBonus : -(val + centerBonus);
    }
  }
  return score;
}

function chessMinimax(board, state, color, depth, alpha, beta) {
  const legal = chessLegalMoves(board, color, state);
  if (legal.length === 0) {
    if (chessInCheck(board, color)) return { score: color === "w" ? -100000 - depth : 100000 + depth };
    return { score: 0 };
  }
  if (depth === 0) return { score: chessEvaluate(board) };
  let bestMoves = [];
  let best = color === "w" ? -Infinity : Infinity;
  for (const m of legal) {
    const { board: nb, state: ns } = chessMakeMove(board, state, m);
    const { score } = chessMinimax(nb, ns, color === "w" ? "b" : "w", depth - 1, alpha, beta);
    if (color === "w") {
      if (score > best) { best = score; bestMoves = [m]; } else if (score === best) bestMoves.push(m);
      alpha = Math.max(alpha, best);
    } else {
      if (score < best) { best = score; bestMoves = [m]; } else if (score === best) bestMoves.push(m);
      beta = Math.min(beta, best);
    }
    if (beta <= alpha) break;
  }
  const move = bestMoves.length ? bestMoves[Math.floor(Math.random() * bestMoves.length)] : legal[0];
  return { score: best, move };
}

function chessGetCpuMove(board, color, state, depth = CHESS_CPU_DEPTH, blunderChance = 0) {
  const legal = chessLegalMoves(board, color, state);
  if (!legal.length) return null;
  if (blunderChance > 0 && Math.random() < blunderChance) {
    return legal[Math.floor(Math.random() * legal.length)];
  }
  const { move } = chessMinimax(board, state, color, depth, -Infinity, Infinity);
  return move || legal[Math.floor(Math.random() * legal.length)];
}

const CHESS_FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const CHESS_DIFFICULTIES = {
  easy: { label: "Easy", depth: 1, blunderChance: 0.32, desc: "Only looks one move ahead — great for learning the ropes." },
  medium: { label: "Medium", depth: 2, blunderChance: 0.1, desc: "Plans a couple moves out with the occasional slip." },
  hard: { label: "Hard", depth: 3, blunderChance: 0, desc: "Calculates several moves ahead and rarely errs." },
};
const CHESS_BEST_KEY = "chess_best_v1";

const CHESS_PIECE_SCORE = { p: 15, n: 45, b: 45, r: 80, q: 150 };

function calculateChessScore({ victor, diffKey, moves, captured, reason }) {
  const capturedBonus = (captured || []).reduce((sum, piece) => {
    const type = piece ? piece[1] : null;
    return sum + (CHESS_PIECE_SCORE[type] || 15);
  }, 0);

  if (victor === "player") {
    // Base difficulty points: Easy 200, Medium 350, Hard 500
    const basePoints = diffKey === "hard" ? 500 : diffKey === "medium" ? 350 : 200;
    const checkmateBonus = reason === "checkmate" ? 100 : 50;

    // Move efficiency bonus (faster checkmate earns more points)
    let moveBonus = 0;
    if (moves <= 20) moveBonus = 150;
    else if (moves <= 35) moveBonus = 100;
    else if (moves <= 50) moveBonus = 50;
    else moveBonus = 20;

    return basePoints + checkmateBonus + moveBonus + capturedBonus;
  } else if (victor === "draw") {
    const basePoints = diffKey === "hard" ? 200 : diffKey === "medium" ? 140 : 80;
    return basePoints + capturedBonus;
  } else {
    // Defeat: Still credit points for enemy pieces captured
    return Math.max(15, capturedBonus);
  }
}

function Chess({ onFinish }) {
  const [phase, setPhase] = useState("select"); // select | playing
  const [diffKey, setDiffKey] = useState(null);
  const [bestWins, setBestWins] = useState({});
  const [playerColor, setPlayerColor] = useState("w");
  const cpuColor = playerColor === "w" ? "b" : "w";
  const [board, setBoard] = useState(chessInitialBoard);
  const [gameState, setGameState] = useState(chessInitialState);
  const [turn, setTurn] = useState("w");
  const [selected, setSelected] = useState(null);
  const [legalForSelected, setLegalForSelected] = useState([]);
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [lastMove, setLastMove] = useState(null);
  const [winner, setWinner] = useState(null); // 'player' | 'cpu' | 'draw'
  const [winReason, setWinReason] = useState(null);
  const [wins, setWins] = useState({ player: 0, cpu: 0 });
  const [thinking, setThinking] = useState(false);
  const [captured, setCaptured] = useState({ player: [], cpu: [] });
  const [playerMoves, setPlayerMoves] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [roundScore, setRoundScore] = useState(0);
  const cpuTimerRef = useRef(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CHESS_BEST_KEY);
      if (raw) setBestWins(JSON.parse(raw));
    } catch { /* ignore */ }
    return () => clearTimeout(cpuTimerRef.current);
  }, []);

  function startDifficulty(key) {
    clearTimeout(cpuTimerRef.current);
    setDiffKey(key);
    setBoard(chessInitialBoard());
    setGameState(chessInitialState());
    setTurn("w");
    setSelected(null);
    setLegalForSelected([]);
    setPendingPromotion(null);
    setLastMove(null);
    setWinner(null);
    setWinReason(null);
    setThinking(false);
    setCaptured({ player: [], cpu: [] });
    setWins({ player: 0, cpu: 0 });
    setPlayerMoves(0);
    setSessionScore(0);
    setRoundScore(0);
    setPhase("playing");
  }

  function backToDifficulty() {
    clearTimeout(cpuTimerRef.current);
    setPhase("select");
    setDiffKey(null);
  }

  function recordCapture(move, moverColor) {
    if (!move.captured) return;
    setCaptured((c) => (moverColor === playerColor
      ? { ...c, player: [...c.player, move.captured] }
      : { ...c, cpu: [...c.cpu, move.captured] }));
  }

  function advanceAfterMove(nb, ns, moverColor, move) {
    const nextColor = moverColor === "w" ? "b" : "w";
    const legal = chessLegalMoves(nb, nextColor, ns);
    if (legal.length === 0) {
      const currentCaptures = (moverColor === playerColor && move?.captured)
        ? [...captured.player, move.captured]
        : captured.player;
      const currentMoves = playerMoves + (moverColor === playerColor ? 1 : 0);

      if (chessInCheck(nb, nextColor)) {
        const victor = moverColor === playerColor ? "player" : "cpu";
        setWinner(victor);
        setWinReason("checkmate");
        setWins((w) => ({ ...w, [victor]: w[victor] + 1 }));
        if (victor === "player" && diffKey) {
          setBestWins((prev) => {
            const next = { ...prev, [diffKey]: (prev[diffKey] || 0) + 1 };
            try { window.localStorage.setItem(CHESS_BEST_KEY, JSON.stringify(next)); } catch { /* ignore */ }
            return next;
          });
        }
        const earned = calculateChessScore({
          victor,
          diffKey,
          moves: currentMoves,
          captured: currentCaptures,
          reason: "checkmate",
        });
        setRoundScore(earned);
        setSessionScore((s) => s + earned);
      } else {
        setWinner("draw");
        setWinReason("stalemate");
        const earned = calculateChessScore({
          victor: "draw",
          diffKey,
          moves: currentMoves,
          captured: currentCaptures,
          reason: "stalemate",
        });
        setRoundScore(earned);
        setSessionScore((s) => s + earned);
      }
    } else {
      setTurn(nextColor);
    }
  }

  function commitMove(move) {
    const moverColor = chessColor(move.piece);
    if (moverColor === playerColor) {
      setPlayerMoves((m) => m + 1);
    }
    const { board: nb, state: ns } = chessMakeMove(board, gameState, move);
    recordCapture(move, moverColor);
    setBoard(nb);
    setGameState(ns);
    setLastMove({ from: move.from, to: move.to });
    setSelected(null);
    setLegalForSelected([]);
    advanceAfterMove(nb, ns, moverColor, move);
  }

  // Auto-player: whenever it's the CPU's turn, it thinks for a beat and then moves on its own
  useEffect(() => {
    if (phase !== "playing" || winner || turn !== cpuColor || pendingPromotion) return;
    setThinking(true);
    cpuTimerRef.current = setTimeout(() => {
      const legal = chessLegalMoves(board, cpuColor, gameState);
      if (legal.length) {
        const cfg = CHESS_DIFFICULTIES[diffKey] || CHESS_DIFFICULTIES.hard;
        const move = chessGetCpuMove(board, cpuColor, gameState, cfg.depth, cfg.blunderChance);
        commitMove(move);
      }
      setThinking(false);
    }, 500 + Math.random() * 500);
    return () => clearTimeout(cpuTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, winner, cpuColor, pendingPromotion, phase]);

  function selectSquare(r, c) {
    if (winner || thinking || pendingPromotion || turn !== playerColor) return;
    if (selected) {
      const matches = legalForSelected.filter((m) => m.to.r === r && m.to.c === c);
      if (matches.length === 1) { commitMove(matches[0]); return; }
      if (matches.length > 1) { setPendingPromotion({ options: matches }); return; }
    }
    const piece = board[r][c];
    if (piece && chessColor(piece) === playerColor) {
      setSelected({ r, c });
      setLegalForSelected(chessLegalMoves(board, playerColor, gameState).filter((m) => m.from.r === r && m.from.c === c));
    } else {
      setSelected(null);
      setLegalForSelected([]);
    }
  }

  function choosePromotion(letter) {
    const move = pendingPromotion.options.find((m) => m.promotion === letter);
    setPendingPromotion(null);
    if (move) commitMove(move);
  }

  function reset() {
    clearTimeout(cpuTimerRef.current);
    setBoard(chessInitialBoard());
    setGameState(chessInitialState());
    setTurn("w");
    setSelected(null);
    setLegalForSelected([]);
    setPendingPromotion(null);
    setLastMove(null);
    setWinner(null);
    setWinReason(null);
    setThinking(false);
    setCaptured({ player: [], cpu: [] });
    setPlayerMoves(0);
    setRoundScore(0);
  }

  function choosePlayerColor(color) {
    if (color === playerColor) return;
    clearTimeout(cpuTimerRef.current);
    setPlayerColor(color);
    setBoard(chessInitialBoard());
    setGameState(chessInitialState());
    setTurn("w");
    setSelected(null);
    setLegalForSelected([]);
    setPendingPromotion(null);
    setLastMove(null);
    setWinner(null);
    setWinReason(null);
    setThinking(false);
    setCaptured({ player: [], cpu: [] });
    setWins({ player: 0, cpu: 0 });
    setPlayerMoves(0);
    setSessionScore(0);
    setRoundScore(0);
  }

  function finishSession() {
    const inProgressCaptures = !winner
      ? (captured.player || []).reduce((sum, piece) => sum + (CHESS_PIECE_SCORE[piece?.[1]] || 15), 0)
      : 0;
    const finalScore = Math.max(sessionScore + inProgressCaptures, roundScore);

    onFinish({
      score: finalScore,
      result: wins.player === wins.cpu ? (wins.player > 0 ? "Won" : "Draw") : wins.player > wins.cpu ? "Won" : "Lost",
    });
  }

  const gameInProgress = !!lastMove && !winner;
  const inCheckColor = winner ? null : (chessInCheck(board, turn) ? turn : null);
  const kingInCheckPos = inCheckColor ? chessFindKing(board, inCheckColor) : null;
  const displayRows = playerColor === "w" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const displayCols = playerColor === "w" ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

  if (phase === "select") {
    return (
      <div className="flex flex-col items-center gap-5 w-full max-w-sm">
        <h3 className="text-sm font-semibold" style={{ color: THEME.cream }}>Choose a difficulty</h3>
        <div className="flex flex-col gap-2.5 w-full">
          {Object.entries(CHESS_DIFFICULTIES).map(([key, cfg]) => {
            const best = bestWins[key];
            return (
              <button
                key={key}
                onClick={() => startDifficulty(key)}
                className="btn-press flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left"
                style={{ borderColor: THEME.panel3, background: `linear-gradient(180deg, ${THEME.panel2}, ${THEME.panel})` }}
              >
                <span className="flex flex-col items-start">
                  <span className="text-sm font-semibold" style={{ color: THEME.cream }}>{cfg.label}</span>
                  <span className="text-xs" style={{ color: THEME.muted }}>{cfg.desc}</span>
                </span>
                {best ? (
                  <span className="inline-flex items-center gap-1 text-xs flex-shrink-0" style={{ color: THEME.gold }}>
                    <Trophy size={13} /> {best}
                  </span>
                ) : (
                  <Play size={16} color={THEME.muted} className="flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <button onClick={backToDifficulty} className="text-xs underline btn-press -mb-1" style={{ color: THEME.muted }}>
        Difficulty: {CHESS_DIFFICULTIES[diffKey]?.label} · Change
      </button>
      <div className="flex items-center gap-2 p-1 rounded-full" style={{ background: THEME.panel, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)" }}>
        <span className="text-xs pl-2 pr-1" style={{ color: THEME.muted }}>Play as</span>
        {[{ id: "w", label: "White" }, { id: "b", label: "Black" }].map((opt) => (
          <button
            key={opt.id}
            onClick={() => choosePlayerColor(opt.id)}
            disabled={gameInProgress}
            aria-pressed={playerColor === opt.id}
            className="btn-press text-xs font-bold px-3 h-9 rounded-full border flex items-center justify-center"
            style={{
              borderColor: playerColor === opt.id ? THEME.pink : THEME.panel3,
              background: playerColor === opt.id ? "rgba(255,60,120,0.14)" : THEME.panel2,
              color: playerColor === opt.id ? THEME.pink : THEME.muted,
              opacity: gameInProgress && playerColor !== opt.id ? 0.45 : 1,
              cursor: gameInProgress ? "not-allowed" : "pointer",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <ScorePanel score={wins.player} label="You (Wins)" />
          {!winner && turn === playerColor && !thinking && <span className="turn-dot" style={{ background: THEME.pink }} />}
        </div>
        <div className="flex flex-col items-center px-4 py-2 rounded-xl border" style={{ borderColor: THEME.panel3, background: THEME.panel }}>
          <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: THEME.muted }}>Match Points</span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "0.85rem", color: THEME.gold }}>
            {sessionScore + (!winner ? (captured.player || []).reduce((sum, p) => sum + (CHESS_PIECE_SCORE[p?.[1]] || 15), 0) : 0)}
          </span>
        </div>
        <div className="relative">
          <ScorePanel score={wins.cpu} label="CPU (Wins)" />
          {!winner && turn === cpuColor && <span className="turn-dot" style={{ background: THEME.gold }} />}
        </div>
      </div>

      {!winner ? (
        <>
          <p style={{ color: THEME.muted, minHeight: "1.5em" }} className="text-sm">
            {thinking ? (
              <span className="ttt-thinking">
                CPU is thinking<span className="ttt-thinking-dots"><span>.</span><span>.</span><span>.</span></span>
              </span>
            ) : inCheckColor ? (
              <>
                <span style={{ color: THEME.pink, fontWeight: 600 }}>Check!</span>{" "}
                {inCheckColor === playerColor ? "Your king is under attack." : "CPU's king is under attack."}
              </>
            ) : (
              <>Turn: <span style={{ color: THEME.pink, fontWeight: 600 }}>{turn === playerColor ? "Your move" : "CPU's move"}</span></>
            )}
          </p>

          <div className="flex flex-col items-center gap-1">
            <div
              className="grid grid-cols-8 rounded-xl overflow-hidden border"
              style={{ borderColor: THEME.panel3, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)" }}
            >
              {displayRows.map((r) => displayCols.map((c) => {
                const piece = board[r][c];
                const isLight = (r + c) % 2 === 0;
                const isSelected = selected && selected.r === r && selected.c === c;
                const isLastMove = lastMove && ((lastMove.from.r === r && lastMove.from.c === c) || (lastMove.to.r === r && lastMove.to.c === c));
                const isKingInCheck = kingInCheckPos && kingInCheckPos.r === r && kingInCheckPos.c === c;
                const destMoves = legalForSelected.filter((m) => m.to.r === r && m.to.c === c);
                const isDest = destMoves.length > 0;
                const isCaptureDest = isDest && (!!piece || destMoves[0].enPassantCapture);
                let bg = isLight ? THEME.panel2 : THEME.panel;
                if (isKingInCheck) bg = "rgba(240,85,58,0.35)";
                else if (isSelected) bg = "rgba(255,60,120,0.28)";
                else if (isLastMove) bg = isLight ? "rgba(255,183,3,0.16)" : "rgba(255,183,3,0.12)";
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => selectSquare(r, c)}
                    disabled={thinking || turn !== playerColor}
                    className="btn-press w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center relative"
                    style={{ background: bg, cursor: thinking || turn !== playerColor ? "default" : "pointer" }}
                  >
                    {piece && (
                      <span
                        className="mark-pop select-none"
                        style={{ fontSize: "1.6rem", lineHeight: 1, color: chessColor(piece) === "w" ? "#F5F1E6" : THEME.violet, filter: chessColor(piece) === "w" ? "drop-shadow(0 1px 1px rgba(0,0,0,0.6))" : "drop-shadow(0 1px 2px rgba(0,0,0,0.55))" }}
                      >
                        {CHESS_GLYPH[piece]}
                      </span>
                    )}
                    {isDest && !isCaptureDest && (
                      <span className="absolute rounded-full" style={{ width: "26%", height: "26%", background: THEME.gold, opacity: 0.75 }} />
                    )}
                    {isDest && isCaptureDest && (
                      <span className="absolute inset-1 rounded-md" style={{ boxShadow: `inset 0 0 0 3px ${THEME.gold}` }} />
                    )}
                  </button>
                );
              }))}
            </div>
            <div className="grid grid-cols-8 w-full px-0.5">
              {displayCols.map((c) => (
                <span key={c} className="text-center text-[9px]" style={{ color: THEME.muted }}>{CHESS_FILES[c]}</span>
              ))}
            </div>
          </div>

          {(captured.player.length > 0 || captured.cpu.length > 0) && (
            <div className="flex flex-col items-center gap-1 text-lg" style={{ minHeight: "1.5rem" }}>
              {captured.player.length > 0 && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] mr-1" style={{ color: THEME.muted }}>You took</span>
                  {captured.player.map((p, i) => <span key={i}>{CHESS_GLYPH[p]}</span>)}
                </div>
              )}
              {captured.cpu.length > 0 && (
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] mr-1" style={{ color: THEME.muted }}>CPU took</span>
                  {captured.cpu.map((p, i) => <span key={i}>{CHESS_GLYPH[p]}</span>)}
                </div>
              )}
            </div>
          )}

          {pendingPromotion && (
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl border anim-popin" style={{ borderColor: THEME.gold, background: THEME.panel2 }}>
              <p className="text-xs" style={{ color: THEME.muted }}>Promote pawn to:</p>
              <div className="flex gap-2">
                {["q", "r", "b", "n"].map((pc) => (
                  <button
                    key={pc}
                    onClick={() => choosePromotion(pc)}
                    className="btn-press w-11 h-11 rounded-lg border text-2xl flex items-center justify-center"
                    style={{ borderColor: THEME.panel3, background: THEME.panel, color: playerColor === "w" ? "#F5F1E6" : THEME.violet }}
                  >
                    {CHESS_GLYPH[playerColor + pc]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <GameOverPanel
          title={winner === "draw" ? "Draw by stalemate" : winner === "player" ? "Checkmate — you win!" : "Checkmate — CPU wins"}
          detail={roundScore > 0
            ? `+${roundScore} pts earned! Total Session Score: ${sessionScore} pts.`
            : "Play another round, or bank this session's score."}
          onReplay={reset}
          onBack={finishSession}
        />
      )}
      {!winner && (
        <button onClick={finishSession} className="text-sm underline btn-press" style={{ color: THEME.muted }}>
          End session &amp; bank score ({sessionScore + (captured.player || []).reduce((sum, p) => sum + (CHESS_PIECE_SCORE[p?.[1]] || 15), 0)} pts)
        </button>
      )}
    </div>
  );
}

const RPS_BEST_STREAK_KEY = "rps_best_streak_v1";
const RPS_CHANT = ["Rock", "Paper", "Scissors", "Shoot!"];
const RPS_CHOICES = [
  { id: "rock", emoji: "🪨", label: "Rock" },
  { id: "paper", emoji: "📄", label: "Paper" },
  { id: "scissors", emoji: "✂️", label: "Scissors" },
];

function RPS({ onFinish }) {
  const [phase, setPhase] = useState("ready"); // ready | clash | reveal | over
  const [chantIdx, setChantIdx] = useState(0);
  const [player, setPlayer] = useState(null);
  const [cpu, setCpu] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [score, setScore] = useState({ w: 0, l: 0, d: 0 });
  const [picked, setPicked] = useState(null);
  const [rounds, setRounds] = useState([]); // 'win' | 'lose' | 'draw' per round
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [bestStreakAllTime, setBestStreakAllTime] = useState(0);

  const timersRef = useRef([]);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(RPS_BEST_STREAK_KEY));
      if (!Number.isNaN(stored) && stored > 0) setBestStreakAllTime(stored);
    } catch { /* ignore */ }
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const ensureAudio = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtxRef.current = new Ctx();
    } catch { /* ignore */ }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq, dur = 0.09, type = "sine", vol = 0.045) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch { /* ignore */ }
  }, []);

  function beats(a, b) {
    return (a === "rock" && b === "scissors") || (a === "paper" && b === "rock") || (a === "scissors" && b === "paper");
  }

  function play(choiceId) {
    if (phase !== "ready") return;
    ensureAudio();
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    setPicked(choiceId);
    setOutcome(null);
    setPlayer(null);
    setCpu(null);
    setPhase("clash");
    setChantIdx(0);
    playTone(320, 0.07, "square", 0.035);

    const beat = 250;
    for (let i = 1; i <= 3; i++) {
      const t = setTimeout(() => {
        setChantIdx(i);
        playTone(320 + i * 50, 0.07, "square", 0.035);
      }, beat * i);
      timersRef.current.push(t);
    }

    const t = setTimeout(() => {
      const cpuChoice = RPS_CHOICES[Math.floor(Math.random() * 3)].id;
      let result;
      if (choiceId === cpuChoice) result = "draw";
      else if (beats(choiceId, cpuChoice)) result = "win";
      else result = "lose";

      setPlayer(choiceId);
      setCpu(cpuChoice);
      setOutcome(result);
      setPhase("reveal");
      setPicked(null);
      setRounds((r) => [...r, result]);

      if (result === "win") {
        playTone(880, 0.18, "triangle", 0.06);
        setStreak((st) => {
          const ns = st + 1;
          setBestStreak((bs) => Math.max(bs, ns));
          setBestStreakAllTime((bs) => {
            if (ns > bs) {
              try { window.localStorage.setItem(RPS_BEST_STREAK_KEY, String(ns)); } catch { /* ignore */ }
              return ns;
            }
            return bs;
          });
          return ns;
        });
      } else if (result === "lose") {
        playTone(140, 0.2, "sawtooth", 0.06);
        setStreak(0);
      } else {
        playTone(420, 0.12, "sine", 0.045);
        setStreak(0);
      }

      const nextScore = {
        w: score.w + (result === "win" ? 1 : 0),
        l: score.l + (result === "lose" ? 1 : 0),
        d: score.d + (result === "draw" ? 1 : 0),
      };
      setScore(nextScore);
      const matchOver = nextScore.w === 3 || nextScore.l === 3;

      const back = setTimeout(() => {
        setPhase(matchOver ? "over" : "ready");
      }, matchOver ? 1100 : 1250);
      timersRef.current.push(back);
    }, beat * 3 + 200);
    timersRef.current.push(t);
  }

  function reset() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setPhase("ready");
    setPlayer(null); setCpu(null); setOutcome(null);
    setScore({ w: 0, l: 0, d: 0 });
    setPicked(null);
    setRounds([]);
    setStreak(0);
    setBestStreak(0);
    setChantIdx(0);
  }

  function finishSession() {
    onFinish({ score: score.w, result: score.w > score.l ? "Won" : score.w < score.l ? "Lost" : "Draw" });
  }

  const resultColor = outcome === "win" ? THEME.green : outcome === "lose" ? THEME.pink : THEME.muted;
  const resultText = outcome === "win" ? "You won that round!" : outcome === "lose" ? "House takes it." : outcome === "draw" ? "Draw — go again." : "\u00A0";
  const shootBeat = phase === "clash" && chantIdx === 3;

  if (phase === "over") {
    return (
      <GameOverPanel
        title={score.w > score.l ? "You beat the house" : "House wins this time"}
        detail={`Final tally — ${score.w} wins, ${score.l} losses, ${score.d} draws · Best streak x${bestStreak || 1}`}
        onReplay={reset}
        onBack={finishSession}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm">
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <ScorePanel score={`${score.w} – ${score.l} – ${score.d}`} label="Win – Lose – Draw" />
        {streak >= 2 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border" style={{ borderColor: THEME.gold, background: `linear-gradient(180deg, ${THEME.panel2}, ${THEME.panel})` }}>
            <Flame size={14} color={THEME.gold} className="float-anim" />
            <span className="text-xs font-semibold" style={{ color: THEME.cream }}>{streak} in a row</span>
          </div>
        )}
        {bestStreakAllTime > 0 && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border" style={{ borderColor: THEME.panel3, background: THEME.panel }}>
            <Trophy size={13} color={THEME.gold} />
            <span className="text-xs" style={{ color: THEME.muted }}>Best streak {bestStreakAllTime}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const r = rounds[i];
          const dotColor = r === "win" ? THEME.green : r === "lose" ? THEME.pink : r === "draw" ? THEME.muted : "transparent";
          return (
            <span
              key={i}
              className="rps-pip"
              style={{
                width: 9, height: 9, borderRadius: "50%",
                background: r ? dotColor : "transparent",
                border: `1.5px solid ${r ? dotColor : THEME.panel3}`,
              }}
            />
          );
        })}
      </div>

      <div className="relative flex items-center gap-6 sm:gap-10 text-5xl h-20">
        <span
          className={phase === "clash" ? "rps-pump" : outcome ? "rps-reveal" : ""}
          style={{
            filter: outcome === "win" ? `drop-shadow(0 0 16px ${THEME.green})` : "none",
            opacity: outcome === "lose" ? 0.45 : 1,
          }}
        >
          {phase === "clash" ? "✊" : player ? RPS_CHOICES.find((c) => c.id === player).emoji : "❓"}
        </span>

        <span
          className={`flex items-center justify-center rounded-full transition-all ${shootBeat ? "rps-zap" : ""}`}
          style={{ width: 34, height: 34, color: shootBeat ? THEME.gold : THEME.muted }}
        >
          {shootBeat ? <Zap size={22} fill={THEME.gold} /> : <span style={{ fontSize: "1.1rem" }}>vs</span>}
        </span>

        <span
          className={phase === "clash" ? "rps-pump" : outcome ? "rps-reveal" : ""}
          style={{
            animationDelay: phase === "clash" ? "0.05s" : "0.08s",
            filter: outcome === "lose" ? `drop-shadow(0 0 16px ${THEME.pink})` : "none",
            opacity: outcome === "win" ? 0.45 : 1,
          }}
        >
          {phase === "clash" ? "✊" : cpu ? RPS_CHOICES.find((c) => c.id === cpu).emoji : "❓"}
        </span>
      </div>

      <p className="rps-chant text-xs uppercase font-bold h-4" style={{ color: THEME.gold, letterSpacing: "0.12em" }}>
        {phase === "clash" ? RPS_CHANT[chantIdx] : "\u00A0"}
      </p>

      <p className="text-sm h-5" style={{ color: resultColor, fontWeight: 600 }}>
        {phase === "reveal" ? resultText : "\u00A0"}
      </p>

      <div className="flex gap-4">
        {RPS_CHOICES.map((c) => (
          <button
            key={c.id}
            onClick={() => play(c.id)}
            disabled={phase !== "ready"}
            aria-label={c.label}
            className="rps-choice btn-press w-16 h-16 rounded-full text-3xl flex items-center justify-center border relative"
            style={{
              borderColor: picked === c.id ? THEME.pink : THEME.gold,
              background: picked === c.id ? "rgba(245,71,140,0.15)" : THEME.panel2,
              opacity: phase !== "ready" && picked !== c.id ? 0.4 : 1,
            }}
          >
            {c.emoji}
          </button>
        ))}
      </div>
      <p className="text-xs" style={{ color: THEME.muted }}>First to 3 wins ends the match.</p>
    </div>
  );
}

const MEMORY_DIFFICULTIES = {
  easy: { pairs: 4, label: "Easy", cols: 4, preview: 1300 },
  medium: { pairs: 6, label: "Medium", cols: 4, preview: 1700 },
  hard: { pairs: 8, label: "Hard", cols: 4, preview: 2100 },
};
const MEMORY_ICON_POOL = ["🍎", "🍋", "🍇", "🍒", "🍉", "🍓", "🍑", "🥝", "🍍", "🥥"];
const MEMORY_BEST_KEY = "memory_best_v1";

function buildMemoryDeck(pairs) {
  const icons = shuffleArr(MEMORY_ICON_POOL).slice(0, pairs);
  return shuffleArr([...icons, ...icons]).map((icon, i) => ({ id: i, icon, flipped: false, matched: false }));
}

function Memory({ onFinish }) {
  const [diffKey, setDiffKey] = useState(null);
  const [phase, setPhase] = useState("select"); // select | preview | playing | over
  const [deck, setDeck] = useState([]);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [mismatchPair, setMismatchPair] = useState([]);
  const [matchedPair, setMatchedPair] = useState([]);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [bestScores, setBestScores] = useState({});

  const previewTimeoutRef = useRef(null);
  const audioCtxRef = useRef(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(MEMORY_BEST_KEY);
      if (raw) setBestScores(JSON.parse(raw));
    } catch { /* ignore */ }
    return () => clearTimeout(previewTimeoutRef.current);
  }, []);

  const ensureAudio = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtxRef.current = new Ctx();
    } catch { /* ignore */ }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq, dur = 0.09, type = "sine", vol = 0.045) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch { /* ignore */ }
  }, []);

  const diff = diffKey ? MEMORY_DIFFICULTIES[diffKey] : null;
  const allMatched = phase === "playing" && deck.length > 0 && deck.every((c) => c.matched);
  const pairsFound = deck.filter((c) => c.matched).length / 2;

  const parPoints = diff ? diff.pairs * 220 : 0;
  const flawless = diff ? moves === diff.pairs : false;
  const score = allMatched
    ? Math.max(100, Math.round(parPoints - moves * 35 - elapsed * 3 + maxCombo * 15 + (flawless ? 200 : 0)))
    : 0;

  function startDifficulty(key) {
    ensureAudio();
    const cfg = MEMORY_DIFFICULTIES[key];
    setDiffKey(key);
    setDeck(buildMemoryDeck(cfg.pairs).map((c) => ({ ...c, flipped: true })));
    setSelected([]);
    setMoves(0);
    setLocked(true);
    setMismatchPair([]);
    setMatchedPair([]);
    setCombo(0);
    setMaxCombo(0);
    setElapsed(0);
    setPhase("preview");
    clearTimeout(previewTimeoutRef.current);
    previewTimeoutRef.current = setTimeout(() => {
      setDeck((cur) => cur.map((c) => ({ ...c, flipped: false })));
      setLocked(false);
      setPhase("playing");
    }, cfg.preview);
  }

  // Elapsed-time ticker while actively playing.
  useEffect(() => {
    if (phase !== "playing") return;
    const iv = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(iv);
  }, [phase]);

  function flip(i) {
    if (locked || phase !== "playing" || deck[i].flipped || deck[i].matched || selected.length === 2) return;
    playTone(480, 0.05, "square", 0.03);
    setDeck((cur) => {
      const copy = cur.map((c, idx) => (idx === i ? { ...c, flipped: true } : c));
      return copy;
    });
    const nextSelected = [...selected, i];
    setSelected(nextSelected);
    if (nextSelected.length === 2) {
      setLocked(true);
      setMoves((m) => m + 1);
      const [a, b] = nextSelected;
      setTimeout(() => {
        setDeck((cur) => {
          const isMatch = cur[a].icon === cur[b].icon;
          if (isMatch) {
            setMatchedPair([a, b]);
            playTone(760, 0.09, "triangle", 0.05);
            playTone(1020, 0.12, "triangle", 0.045);
            setCombo((c) => {
              const nc = c + 1;
              setMaxCombo((mc) => Math.max(mc, nc));
              return nc;
            });
            setTimeout(() => setMatchedPair([]), 500);
            return cur.map((c, idx) => (idx === a || idx === b ? { ...c, matched: true } : c));
          }
          setMismatchPair([a, b]);
          playTone(160, 0.16, "sawtooth", 0.05);
          setCombo(0);
          setTimeout(() => setMismatchPair([]), 320);
          return cur.map((c, idx) => (idx === a || idx === b ? { ...c, flipped: false } : c));
        });
        setSelected([]);
        setLocked(false);
      }, 650);
    }
  }

  // Fire once when the board is cleared.
  useEffect(() => {
    if (!allMatched) return;
    playTone(880, 0.14, "triangle", 0.05);
    setTimeout(() => playTone(1180, 0.2, "triangle", 0.05), 130);
    setBestScores((prev) => {
      const cur = prev[diffKey] || 0;
      if (score > cur) {
        const next = { ...prev, [diffKey]: score };
        try { window.localStorage.setItem(MEMORY_BEST_KEY, JSON.stringify(next)); } catch { /* ignore */ }
        return next;
      }
      return prev;
    });
    setPhase("over");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allMatched]);

  function reset() {
    clearTimeout(previewTimeoutRef.current);
    setPhase("select");
    setDiffKey(null);
    setDeck([]);
    setSelected([]);
    setMoves(0);
    setLocked(false);
    setMismatchPair([]);
    setMatchedPair([]);
    setCombo(0);
    setMaxCombo(0);
    setElapsed(0);
  }

  function playAgainSameDifficulty() {
    if (diffKey) startDifficulty(diffKey);
  }

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");
  const isNewBest = phase === "over" && diffKey && score >= (bestScores[diffKey] || 0);

  if (phase === "select") {
    return (
      <div className="flex flex-col items-center gap-5 w-full max-w-sm">
        <h3 className="text-sm font-semibold" style={{ color: THEME.cream }}>Choose a difficulty</h3>
        <div className="flex flex-col gap-2.5 w-full">
          {Object.entries(MEMORY_DIFFICULTIES).map(([key, cfg]) => {
            const best = bestScores[key];
            return (
              <button
                key={key}
                onClick={() => startDifficulty(key)}
                className="btn-press flex items-center justify-between px-4 py-3 rounded-xl border"
                style={{ borderColor: THEME.panel3, background: `linear-gradient(180deg, ${THEME.panel2}, ${THEME.panel})` }}
              >
                <span className="flex flex-col items-start">
                  <span className="text-sm font-semibold" style={{ color: THEME.cream }}>{cfg.label}</span>
                  <span className="text-xs" style={{ color: THEME.muted }}>{cfg.pairs} pairs · {cfg.pairs * 2} cards</span>
                </span>
                {best ? (
                  <span className="inline-flex items-center gap-1 text-xs" style={{ color: THEME.gold }}>
                    <Trophy size={13} /> {best}
                  </span>
                ) : (
                  <Play size={16} color={THEME.muted} />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === "over") {
    return (
      <GameOverPanel
        title={flawless ? "Flawless clear!" : "All matched"}
        detail={`${moves} moves · ${mm}:${ss} · Score ${score}${isNewBest ? " — new best!" : ` · Best ${bestScores[diffKey] || score}`}`}
        onReplay={playAgainSameDifficulty}
        onBack={() => onFinish({ score, result: "Won" })}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <ScorePanel score={moves} label="Moves" />
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: THEME.panel3, background: `linear-gradient(180deg, ${THEME.panel2}, ${THEME.panel})` }}>
          <span className="text-xs uppercase tracking-wide" style={{ color: THEME.muted, letterSpacing: "0.06em" }}>Time</span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", color: THEME.cream, fontSize: "0.85rem" }}>{mm}:{ss}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ borderColor: THEME.panel3, background: THEME.panel }}>
          <span className="text-xs" style={{ color: THEME.muted }}>{pairsFound}/{diff.pairs} pairs</span>
        </div>
        {combo >= 2 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border" style={{ borderColor: THEME.gold, background: `linear-gradient(180deg, ${THEME.panel2}, ${THEME.panel})` }}>
            <Flame size={14} color={THEME.gold} className="float-anim" />
            <span className="text-xs font-semibold" style={{ color: THEME.cream }}>x{combo} streak</span>
          </div>
        )}
      </div>

      {phase === "preview" && (
        <p className="wam-countdown-pop text-xs uppercase font-bold" style={{ color: THEME.gold, letterSpacing: "0.1em" }}>
          Memorize the board…
        </p>
      )}

      <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `repeat(${diff.cols}, minmax(0,1fr))` }}>
        {deck.map((card, i) => {
          const shown = card.flipped || card.matched;
          const isMismatch = mismatchPair.includes(i);
          const isFreshMatch = matchedPair.includes(i);
          return (
            <div key={card.id} className="memory-card-outer" style={{ animationDelay: phase === "preview" ? "0s" : `${i * 0.035}s` }}>
              <button
                onClick={() => flip(i)}
                disabled={shown || phase !== "playing"}
                className={`btn-press w-14 h-14 sm:w-16 sm:h-16 memory-card-flip ${isMismatch ? "memory-mismatch" : ""} ${isFreshMatch ? "memory-match-burst" : ""}`}
                style={{ transform: shown ? "rotateY(180deg)" : "rotateY(0deg)", background: "transparent", border: "none", padding: 0, cursor: shown || phase !== "playing" ? "default" : "pointer" }}
              >
                <span className="memory-face memory-face-back" style={{ borderColor: THEME.panel3, background: THEME.panel2 }}>
                  <span className="memory-face-dot" style={{ background: THEME.panel3 }} />
                </span>
                <span
                  className="memory-face memory-face-front text-2xl"
                  style={{
                    borderColor: card.matched ? THEME.green : THEME.panel3,
                    background: card.matched ? "rgba(95,217,138,0.14)" : THEME.panel3,
                    boxShadow: card.matched ? `0 0 16px rgba(95,217,138,0.45)` : "none",
                  }}
                >
                  {card.icon}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Quiz({ onFinish }) {
  const [step, setStep] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [picked, setPicked] = useState(null);
  const done = step >= QUIZ_QUESTIONS.length;

  function answer(i) {
    if (picked !== null) return;
    setPicked(i);
    if (i === QUIZ_QUESTIONS[step].a) setCorrect((c) => c + 1);
    setTimeout(() => { setPicked(null); setStep((s) => s + 1); }, 600);
  }

  function reset() { setStep(0); setCorrect(0); setPicked(null); }

  if (done) {
    return (
      <GameOverPanel title={`${correct} / ${QUIZ_QUESTIONS.length} correct`}
        detail={correct === QUIZ_QUESTIONS.length ? "Perfect run." : "Solid effort — try again for a clean sweep."}
        onReplay={reset} onBack={() => onFinish({ score: correct, result: correct >= 3 ? "Won" : "Lost" })} />
    );
  }

  const q = QUIZ_QUESTIONS[step];
  const progress = ((step + (picked !== null ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100;
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <ScorePanel score={`${step + 1} / ${QUIZ_QUESTIONS.length}`} label="Question" />
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: THEME.panel3 }}>
        <div className="h-full rounded-full quiz-progress" style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${THEME.violet}, ${THEME.pink})` }} />
      </div>
      <div key={step} className="quiz-slide flex flex-col items-center gap-6 w-full">
        <p className="text-center" style={{ color: THEME.cream }}>{q.q}</p>
        <div className="grid grid-cols-1 gap-2 w-full">
          {q.options.map((opt, i) => {
            const isPicked = picked === i;
            const isCorrect = picked !== null && i === q.a;
            const isWrongPick = isPicked && !isCorrect;
            return (
              <button key={i} onClick={() => answer(i)} disabled={picked !== null}
                className="quiz-option btn-press text-left px-4 py-2.5 rounded-lg border flex items-center justify-between"
                style={{
                  borderColor: isCorrect ? THEME.green : isWrongPick ? THEME.pink : THEME.panel3,
                  background: isCorrect ? "rgba(95,217,138,0.12)" : isWrongPick ? "rgba(245,71,140,0.15)" : THEME.panel2,
                  color: THEME.cream,
                }}>
                <span>{opt}</span>
                {isCorrect && <span className="check-pop" style={{ color: THEME.green }}>✓</span>}
                {isWrongPick && <span className="check-pop" style={{ color: THEME.pink }}>✕</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Snake({ onFinish }) {
  const SIZE = 14;
  const START = [{ x: 6, y: 6 }];
  const BASE_TICK = 210;
  const MIN_TICK = 105;
  const COMBO_WINDOW = 2200;
  const TRAIL_DOTS = 5;

  // food variety table: weight = spawn rarity, points = score gain (x combo), growth = segments added
  const FOOD_KINDS = {
    apple: { weight: 50, points: 10, growth: 1, label: "+1", tone: 660 },
    berry: { weight: 22, points: 20, growth: 1, label: "+2", tone: 720 },
    cherry: { weight: 15, points: 30, growth: 2, label: "+3", tone: 780 },
    golden: { weight: 9, points: 50, growth: 3, label: "+5", tone: 880 },
    gem: { weight: 4, points: 100, growth: 4, label: "+10", tone: 1046 },
  };
  const FOOD_WEIGHT_TOTAL = Object.values(FOOD_KINDS).reduce((s, k) => s + k.weight, 0);
  const pickFoodKind = () => {
    let r = Math.random() * FOOD_WEIGHT_TOTAL;
    for (const [key, cfg] of Object.entries(FOOD_KINDS)) {
      if (r < cfg.weight) return key;
      r -= cfg.weight;
    }
    return "apple";
  };
  const FOOD_VISUALS = {
    apple: { Icon: () => <AppleSVG variant="red" />, glow: `drop-shadow(0 1px 2px rgba(0,0,0,0.45))`, ring: false, sparkle: false },
    berry: { Icon: () => <BerrySVG />, glow: `drop-shadow(0 0 3px rgba(123,79,224,0.5))`, ring: false, sparkle: false },
    cherry: { Icon: () => <CherrySVG />, glow: `drop-shadow(0 0 3px rgba(224,41,75,0.5))`, ring: false, sparkle: false },
    golden: { Icon: () => <AppleSVG variant="gold" />, glow: `drop-shadow(0 0 4px ${THEME.gold}) drop-shadow(0 0 7px rgba(255,183,3,0.5))`, ring: true, ringColor: "rgba(255,183,3,0.55)", sparkle: true },
    gem: { Icon: () => <GemSVG />, glow: `drop-shadow(0 0 4px #4FE0D0) drop-shadow(0 0 8px rgba(123,79,224,0.55))`, ring: true, ringColor: "rgba(79,224,208,0.55)", sparkle: true },
  };

  const [snake, setSnake] = useState(START);
  const [food, setFood] = useState({ x: 9, y: 6, kind: "apple" });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [bestLength, setBestLength] = useState(0);
  const [bestPoints, setBestPoints] = useState(0);
  const [points, setPoints] = useState(0);
  const [combo, setCombo] = useState(0);
  const [comboBanner, setComboBanner] = useState(null); // { id, text }
  const [markers, setMarkers] = useState([]); // floating score text on eat
  const [crashShake, setCrashShake] = useState(false);
  const [crashFlash, setCrashFlash] = useState(false);
  const [chomp, setChomp] = useState(false);
  const [boardPx, setBoardPx] = useState(0);

  const dirRef = useRef(dir);
  dirRef.current = dir;
  const inputQueueRef = useRef([]);
  const markerIdRef = useRef(0);
  const comboRef = useRef(0);
  const lastEatRef = useRef(0);
  const comboClearTimeoutRef = useRef(null);
  const boardRef = useRef(null);
  const segElRefs = useRef([]);
  const trailElRefs = useRef([]);
  const prevGridRef = useRef(START);
  const nextGridRef = useRef(START);
  const tickStartTimeRef = useRef(0);
  const tickDurationRef = useRef(BASE_TICK);
  const headHistoryRef = useRef([]);
  const audioCtxRef = useRef(null);
  const rafRef = useRef(null);
  const touchStartRef = useRef(null);
  const reducedMotionRef = useRef(false);

  const score = snake.length - 1;
  const tickMs = Math.max(MIN_TICK, BASE_TICK - score * 2);
  const cellPx = boardPx > 0 ? boardPx / SIZE : 380 / SIZE;
  const cellPxRef = useRef(cellPx);
  cellPxRef.current = cellPx;

  // measure the board's rendered pixel size responsively (keeps pixel-based motion crisp on any screen)
  useLayoutEffect(() => {
    try {
      reducedMotionRef.current = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      /* ignore */
    }
    const el = boardRef.current;
    if (!el) return;
    const measure = () => setBoardPx(el.clientWidth);
    measure();
    let ro;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    } else {
      window.addEventListener("resize", measure);
    }
    return () => { if (ro) ro.disconnect(); else window.removeEventListener("resize", measure); };
  }, []);

  // load persisted bests
  useEffect(() => {
    try {
      const sl = Number(window.localStorage.getItem("snake_best_length_v1"));
      if (!Number.isNaN(sl) && sl > 0) setBestLength(sl);
      const sp = Number(window.localStorage.getItem("snake_best_points_v1"));
      if (!Number.isNaN(sp) && sp > 0) setBestPoints(sp);
    } catch {
      /* localStorage unavailable — ignore */
    }
  }, []);

  const ensureAudio = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtxRef.current = new Ctx();
    } catch {
      /* audio unsupported — ignore */
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq, dur = 0.09, type = "sine", vol = 0.05) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {
      /* ignore */
    }
  }, []);

  const placeFood = useCallback((body) => {
    let pos;
    do { pos = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) }; }
    while (body.some((s) => s.x === pos.x && s.y === pos.y));
    return { ...pos, kind: pickFoodKind() };
  }, []);

  const beginRun = useCallback(() => {
    ensureAudio();
    if (!running && !over) setRunning(true);
  }, [running, over, ensureAudio]);

  const queueDir = useCallback((next) => {
    if (over) return;
    beginRun();
    const cur = inputQueueRef.current.length ? inputQueueRef.current[inputQueueRef.current.length - 1] : dirRef.current;
    if (cur.x + next.x === 0 && cur.y + next.y === 0) return; // no reversing into yourself
    if (cur.x === next.x && cur.y === next.y) return;
    if (inputQueueRef.current.length < 2) inputQueueRef.current.push(next);
  }, [over, beginRun]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "p" || e.key === "P") {
        setPaused((p) => (running && !over ? !p : p));
        return;
      }
      const map = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
      const next = map[e.key];
      if (!next) return;
      e.preventDefault();
      queueDir(next);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [queueDir, running, over]);

  function onTouchStart(e) {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e) {
    const start = touchStartRef.current;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    touchStartRef.current = null;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return; // too small to count as a swipe
    if (Math.abs(dx) > Math.abs(dy)) queueDir({ x: dx > 0 ? 1 : -1, y: 0 });
    else queueDir({ x: 0, y: dy > 0 ? 1 : -1 });
  }

  useEffect(() => {
    if (!running || over || paused) return;
    const id = setInterval(() => {
      setSnake((cur) => {
        if (inputQueueRef.current.length) {
          const nextDir = inputQueueRef.current.shift();
          dirRef.current = nextDir;
          setDir(nextDir);
        }
        const head = { x: cur[0].x + dirRef.current.x, y: cur[0].y + dirRef.current.y };
        const hitWall = head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE;
        const hitSelf = cur.some((s) => s.x === head.x && s.y === head.y);
        if (hitWall || hitSelf) {
          setOver(true);
          setRunning(false);
          setCrashShake(true);
          setCrashFlash(true);
          setTimeout(() => setCrashShake(false), 380);
          setTimeout(() => setCrashFlash(false), 260);
          playTone(110, 0.25, "sawtooth", 0.06);
          const finalScore = cur.length - 1;
          setBestLength((b) => {
            const nx = Math.max(b, finalScore);
            try { window.localStorage.setItem("snake_best_length_v1", String(nx)); } catch { /* ignore */ }
            return nx;
          });
          setPoints((p) => {
            setBestPoints((b) => {
              const nx = Math.max(b, p);
              try { window.localStorage.setItem("snake_best_points_v1", String(nx)); } catch { /* ignore */ }
              return nx;
            });
            return p;
          });
          return cur;
        }

        const eatenFood = head.x === food.x && head.y === food.y;
        let newBody = [head, ...cur];
        let grewExtra = 0;

        if (eatenFood) {
          const kindCfg = FOOD_KINDS[food.kind] || FOOD_KINDS.apple;
          playTone(kindCfg.tone, 0.08, "square", 0.045);
          setChomp(true);
          setTimeout(() => setChomp(false), 220);
          const now = performance.now();
          const withinCombo = now - lastEatRef.current < COMBO_WINDOW;
          lastEatRef.current = now;
          comboRef.current = withinCombo ? comboRef.current + 1 : 1;
          setCombo(comboRef.current);
          clearTimeout(comboClearTimeoutRef.current);
          comboClearTimeoutRef.current = setTimeout(() => { comboRef.current = 0; setCombo(0); }, COMBO_WINDOW);
          if (comboRef.current >= 2) {
            const bid = ++markerIdRef.current + 100000;
            setComboBanner({ id: bid, text: `Combo x${comboRef.current}!` });
            setTimeout(() => setComboBanner((b) => (b && b.id === bid ? null : b)), 700);
          }
          const gain = kindCfg.points * comboRef.current;
          setPoints((p) => p + gain);
          grewExtra = kindCfg.growth - 1;
          const mid = ++markerIdRef.current;
          setMarkers((m) => [...m, { id: mid, x: head.x, y: head.y, text: `+${gain}` }]);
          setTimeout(() => setMarkers((m) => m.filter((mk) => mk.id !== mid)), 550);
          setFood(placeFood(newBody));
        } else {
          newBody.pop();
        }
        for (let k = 0; k < grewExtra; k++) newBody.push(newBody[newBody.length - 1]);

        prevGridRef.current = cur;
        nextGridRef.current = newBody;
        tickStartTimeRef.current = performance.now();
        tickDurationRef.current = tickMs;

        return newBody;
      });
    }, tickMs);
    return () => clearInterval(id);
  }, [running, over, paused, food, placeFood, tickMs, playTone]);

  // smooth per-frame interpolation applied directly to the DOM via refs — keeps motion buttery
  // and decoupled from React's render cycle instead of relying on CSS transition catch-up.
  useEffect(() => {
    if (!running || over) return;
    function easeInOutSine(t) { return -(Math.cos(Math.PI * t) - 1) / 2; }
    function frame(now) {
      const dur = tickDurationRef.current || tickMs;
      const raw = Math.min(1, (now - tickStartTimeRef.current) / dur);
      const eased = reducedMotionRef.current ? 1 : easeInOutSine(raw);
      const prev = prevGridRef.current;
      const next = nextGridRef.current;
      const px = cellPxRef.current;
      let headPx = null;
      for (let i = 0; i < next.length; i++) {
        const p0 = prev[i] || next[i];
        const p1 = next[i];
        const gx = p0.x + (p1.x - p0.x) * eased;
        const gy = p0.y + (p1.y - p0.y) * eased;
        const el = segElRefs.current[i];
        if (el) el.style.transform = `translate3d(${gx * px}px, ${gy * px}px, 0)`;
        if (i === 0) headPx = { x: gx * px, y: gy * px };
      }
      if (headPx && !reducedMotionRef.current) {
        const hist = headHistoryRef.current;
        hist.push(headPx);
        if (hist.length > 24) hist.shift();
        for (let k = 0; k < TRAIL_DOTS; k++) {
          const sample = hist[hist.length - 1 - (k + 1) * 3];
          const dot = trailElRefs.current[k];
          if (!dot) continue;
          if (sample) {
            dot.style.transform = `translate3d(${sample.x}px, ${sample.y}px, 0)`;
            dot.style.opacity = String(Math.max(0, 0.28 - k * 0.045));
          } else {
            dot.style.opacity = "0";
          }
        }
      }
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, over, tickMs]);

  function reset() {
    setSnake(START);
    setFood({ x: 9, y: 6, kind: "apple" });
    setDir({ x: 1, y: 0 });
    dirRef.current = { x: 1, y: 0 };
    inputQueueRef.current = [];
    setOver(false);
    setRunning(false);
    setPaused(false);
    setPoints(0);
    setCombo(0);
    comboRef.current = 0;
    setComboBanner(null);
    setMarkers([]);
    setCrashFlash(false);
    setChomp(false);
    prevGridRef.current = START;
    nextGridRef.current = START;
    segElRefs.current = [];
    headHistoryRef.current = [];
  }

  const isNewBest = over && score > 0 && score >= bestLength;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <ScorePanel score={score} label="Length" />
        <ScorePanel score={points} label="Score" />
      </div>
      {!over ? (
        <>
          <div
            ref={boardRef}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            className={`relative overflow-hidden rounded-xl border snake-board ${crashShake ? "car-shake" : ""}`}
            style={{
              width: "min(90vw, 380px)", aspectRatio: "1 / 1",
              borderColor: THEME.panel3,
              background: `radial-gradient(120% 90% at 50% 0%, rgba(63,199,111,0.08), transparent 60%), ${THEME.panel2}`,
              backgroundImage: `radial-gradient(120% 90% at 50% 0%, rgba(63,199,111,0.08), transparent 60%), linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
              backgroundSize: `100% 100%, ${100 / SIZE}% ${100 / SIZE}%, ${100 / SIZE}% ${100 / SIZE}%`,
              boxShadow: `inset 0 0 32px rgba(0,0,0,0.5)${!running ? `, 0 0 0 1px rgba(63,199,111,0.15)` : ""}`,
              touchAction: "none",
            }}
          >
            {/* head glow afterimage trail — updated imperatively every frame for smooth 60fps motion */}
            {Array.from({ length: TRAIL_DOTS }).map((_, k) => (
              <div
                key={k}
                ref={(el) => { trailElRefs.current[k] = el; }}
                className="absolute rounded-full"
                style={{ width: cellPx * 0.6, height: cellPx * 0.6, background: THEME.green, filter: "blur(4px)", opacity: 0, willChange: "transform, opacity" }}
              />
            ))}

            {snake.map((s, i) => {
              const isHead = i === 0;
              const t = snake.length > 1 ? i / (snake.length - 1) : 0;
              const bodyColor = lerpColor("#8CE99A", THEME.green, Math.min(1, t * 1.3));
              const scale = isHead ? 1 : Math.max(0.66, 1 - (i / snake.length) * 0.46);
              return (
                <div
                  key={i}
                  ref={(el) => { segElRefs.current[i] = el; }}
                  className="absolute snake-segment"
                  style={{
                    width: cellPx,
                    height: cellPx,
                    left: 0,
                    top: 0,
                    transform: `translate3d(${s.x * cellPx}px, ${s.y * cellPx}px, 0)`,
                    padding: "1.5px",
                    zIndex: isHead ? snake.length + 1 : snake.length - i,
                    willChange: "transform",
                  }}
                >
                  {isHead ? (
                    <div
                      className="snake-head"
                      style={{
                        width: "100%", height: "100%",
                        transform: `rotate(${dir.x === 1 ? 90 : dir.x === -1 ? -90 : dir.y === 1 ? 180 : 0}deg)`,
                        transition: `transform ${Math.min(0.12, tickMs / 1000 * 0.7)}s cubic-bezier(0.22,1,0.36,1)`,
                      }}
                    >
                      <div className={chomp ? "snake-chomp" : ""} style={{
                        position: "relative", width: "100%", height: "100%", borderRadius: "48% 48% 34% 34%",
                        background: `radial-gradient(120% 120% at 30% 18%, #E8FFC2, #8CE99A 45%, ${THEME.green} 78%)`,
                        boxShadow: `0 0 12px ${THEME.green}, 0 0 22px rgba(63,199,111,0.35), inset 0 -3px 4px rgba(15,90,50,0.35)`,
                      }}>
                        {/* nostrils */}
                        <span className="snake-nostril" style={{ left: "38%", top: "9%" }} />
                        <span className="snake-nostril" style={{ right: "38%", top: "9%" }} />
                        {/* expressive cartoon eyes */}
                        <span className="snake-eye-white snake-blink" style={{ left: "13%", top: "20%" }}>
                          <span className="snake-pupil" />
                          <span className="snake-glint" />
                        </span>
                        <span className="snake-eye-white snake-blink" style={{ right: "13%", top: "20%" }}>
                          <span className="snake-pupil" />
                          <span className="snake-glint" />
                        </span>
                        {/* happy smile */}
                        <span className="snake-smile" />
                        {/* cheek blushes */}
                        <span className="snake-blush" style={{ left: "6%", top: "46%" }} />
                        <span className="snake-blush" style={{ right: "6%", top: "46%" }} />
                        {running && !paused && <span className="snake-tongue" style={{ background: THEME.pink }} />}
                        {!running && <span className="snake-idle-glow" />}
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: "100%", height: "100%", transform: `scale(${scale})` }}>
                      <div
                        className={`snake-scale${running && !paused ? " snake-wiggle" : ""}`}
                        style={{
                          width: "100%", height: "100%",
                          borderRadius: "40% 40% 34% 34%",
                          background: `radial-gradient(120% 130% at 32% 22%, rgba(255,255,255,0.5), transparent 50%), ${bodyColor}`,
                          filter: i % 2 === 0 ? "brightness(1)" : "brightness(0.86)",
                          boxShadow: `inset 0 0 0 1.2px rgba(0,0,0,0.28), inset 0 -4px 4px rgba(0,0,0,0.22), 0 0 ${6 - t * 4}px ${bodyColor}55`,
                          animationDelay: `${i * 55}ms`,
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            <div
              key={`${food.x}-${food.y}-${food.kind}`}
              className="absolute food-pop"
              style={{
                width: `${100 / SIZE}%`,
                height: `${100 / SIZE}%`,
                left: `${(food.x * 100) / SIZE}%`,
                top: `${(food.y * 100) / SIZE}%`,
              }}
            >
              {(() => {
                const fv = FOOD_VISUALS[food.kind] || FOOD_VISUALS.apple;
                const Icon = fv.Icon;
                return (
                  <>
                    {fv.ring && <div className="food-ring" style={{ borderColor: fv.ringColor }} />}
                    <div style={{ width: "100%", height: "100%", position: "relative", transform: "scale(1.32)", filter: fv.glow }}>
                      <Icon />
                      {fv.sparkle && (
                        <Sparkles
                          size={Math.max(7, cellPx * 0.32)}
                          color="#fff"
                          style={{ position: "absolute", right: "-16%", top: "-16%", filter: `drop-shadow(0 0 3px ${THEME.gold})` }}
                        />
                      )}
                    </div>
                  </>
                );
              })()}
            </div>

            {markers.map((mk) => (
              <div
                key={mk.id}
                className="absolute wam-marker"
                style={{
                  left: `${(mk.x * 100) / SIZE}%`,
                  top: `${(mk.y * 100) / SIZE}%`,
                  width: `${100 / SIZE}%`,
                  textAlign: "center",
                  color: THEME.gold,
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "0.6rem",
                  pointerEvents: "none",
                  zIndex: 999,
                }}
              >
                {mk.text}
              </div>
            ))}

            {comboBanner && (
              <div
                key={comboBanner.id}
                className="absolute wam-combo-banner"
                style={{
                  top: "6%", left: "50%", transform: "translateX(-50%)",
                  padding: "3px 10px", borderRadius: 999,
                  background: `linear-gradient(135deg, ${THEME.gold}, ${THEME.pink})`,
                  color: "#171226", fontSize: "0.65rem", fontWeight: 700,
                  pointerEvents: "none", zIndex: 1000,
                }}
              >
                {comboBanner.text}
              </div>
            )}

            {crashFlash && <div className="absolute inset-0 pointer-events-none crash-flash" />}

            {paused && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ background: "rgba(11,13,22,0.55)" }}>
                <span style={{ fontFamily: "'Press Start 2P', monospace", color: THEME.cream, fontSize: "0.85rem" }}>PAUSED</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs" style={{ color: THEME.muted }}>
              {running ? `Best: ${bestLength} len · ${bestPoints} pts` : "Press an arrow key, swipe, or use the pad to start."}
            </p>
            {running && (
              <button onClick={() => setPaused((p) => !p)} className="btn-press text-xs px-2 py-1 rounded-lg border" style={{ borderColor: THEME.panel3, color: THEME.cream }}>
                {paused ? "Resume" : "Pause"}
              </button>
            )}
          </div>

          {/* on-screen d-pad — works alongside arrow keys and swipes for touch/trackpad users */}
          <div className="grid gap-1.5" style={{ gridTemplateColumns: "repeat(3, 2.4rem)", gridTemplateRows: "repeat(2, 2.4rem)" }}>
            <div />
            <button onClick={() => queueDir({ x: 0, y: -1 })} className="btn-press rounded-lg border flex items-center justify-center" style={{ borderColor: THEME.panel3, background: THEME.panel2 }}>
              <ChevronDown size={18} color={THEME.cream} style={{ transform: "rotate(180deg)" }} />
            </button>
            <div />
            <button onClick={() => queueDir({ x: -1, y: 0 })} className="btn-press rounded-lg border flex items-center justify-center" style={{ borderColor: THEME.panel3, background: THEME.panel2 }}>
              <ChevronLeft size={18} color={THEME.cream} />
            </button>
            <button onClick={() => queueDir({ x: 0, y: 1 })} className="btn-press rounded-lg border flex items-center justify-center" style={{ borderColor: THEME.panel3, background: THEME.panel2 }}>
              <ChevronDown size={18} color={THEME.cream} />
            </button>
            <button onClick={() => queueDir({ x: 1, y: 0 })} className="btn-press rounded-lg border flex items-center justify-center" style={{ borderColor: THEME.panel3, background: THEME.panel2 }}>
              <ChevronRight size={18} color={THEME.cream} />
            </button>
          </div>
        </>
      ) : (
        <GameOverPanel
          title="Game over"
          detail={isNewBest ? `New best! Length ${score + 1} · ${points} points.` : `Length ${score + 1} · ${points} points. Best: ${bestLength + 1} len, ${bestPoints} pts.`}
          onReplay={reset}
          onBack={() => onFinish({ score, result: "Won" })}
        />
      )}
    </div>
  );
}

const RIVAL_PALETTES = ["red", "amber", "teal"];

function CarRace({ onFinish }) {
  const LANES = 3;
  const ROWS = 9;
  const CAR_ROW = ROWS - 1;
  const BASE_SPEED = 3.2; // rows per second at the start
  const MAX_SPEED = 9.5; // rows per second cap at high scores

  const [lane, setLane] = useState(1);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const [tilt, setTilt] = useState(0); // -1 leaning left, 1 leaning right, 0 neutral
  const [crashShake, setCrashShake] = useState(false);
  const [crashFlash, setCrashFlash] = useState(false);
  const [trail, setTrail] = useState([]); // exhaust puffs behind the player car
  const [bestDistance, setBestDistance] = useState(0);

  const trailIdRef = useRef(0);
  const trailAccRef = useRef(0);

  const laneRef = useRef(lane);
  laneRef.current = lane;
  const scoreRef = useRef(0);
  const obstaclesRef = useRef([]);
  const overRef = useRef(false);
  const runningRef = useRef(false);
  const idRef = useRef(0);
  const spawnAccRef = useRef(0);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);
  const tiltTimeoutRef = useRef(null);

  const computeSpeed = useCallback((s) => Math.min(MAX_SPEED, BASE_SPEED + s * 0.09), []);
  const computeSpawnInterval = useCallback((s) => Math.max(0.42, 0.95 - s * 0.012), []);

  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem("car_best_distance_v1"));
      if (!Number.isNaN(stored) && stored > 0) setBestDistance(stored);
    } catch {
      /* localStorage unavailable — ignore */
    }
  }, []);

  const stopLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    lastTsRef.current = null;
  }, []);

  const step = useCallback((ts) => {
    if (!runningRef.current || overRef.current) { stopLoop(); return; }
    if (lastTsRef.current == null) lastTsRef.current = ts;
    let dt = (ts - lastTsRef.current) / 1000;
    lastTsRef.current = ts;
    dt = Math.min(dt, 0.05); // clamp so a dropped/backgrounded frame can't cause a big jump

    const speed = computeSpeed(scoreRef.current);
    let passed = 0;
    let arr = obstaclesRef.current.map((o) => ({ ...o, row: o.row + speed * dt }));
    arr = arr.filter((o) => {
      if (o.row >= ROWS + 0.5) { passed += 1; return false; }
      return true;
    });

    const hit = arr.some((o) => o.lane === laneRef.current && Math.abs(o.row - CAR_ROW) < 0.42);
    if (hit) {
      overRef.current = true;
      obstaclesRef.current = arr;
      setObstacles(arr);
      setOver(true);
      setRunning(false);
      setCrashShake(true);
      setCrashFlash(true);
      setTimeout(() => setCrashShake(false), 380);
      setTimeout(() => setCrashFlash(false), 260);
      setBestDistance((b) => {
        const next = Math.max(b, scoreRef.current);
        try { window.localStorage.setItem("car_best_distance_v1", String(next)); } catch { /* ignore */ }
        return next;
      });
      stopLoop();
      return;
    }

    spawnAccRef.current += dt;
    const interval = computeSpawnInterval(scoreRef.current);
    if (spawnAccRef.current >= interval) {
      spawnAccRef.current = 0;
      const blockedLanes = arr.filter((o) => o.row < 1.3).map((o) => o.lane);
      let newLane = Math.floor(Math.random() * LANES);
      let attempts = 0;
      while (blockedLanes.includes(newLane) && attempts < 4) { newLane = Math.floor(Math.random() * LANES); attempts++; }
      const palette = RIVAL_PALETTES[Math.floor(Math.random() * RIVAL_PALETTES.length)];
      arr.push({ id: ++idRef.current, lane: newLane, row: -0.4, palette });
    }

    if (passed > 0) {
      scoreRef.current += passed;
      setScore(scoreRef.current);
    }

    // Exhaust trail: puff a fading particle behind the player car every ~90ms while racing.
    trailAccRef.current += dt;
    if (trailAccRef.current >= 0.09) {
      trailAccRef.current = 0;
      const puffId = ++trailIdRef.current;
      setTrail((t) => {
        const next = [...t, { id: puffId, lane: laneRef.current, born: ts }].filter((p) => ts - p.born < 500);
        return next.slice(-10);
      });
    }

    obstaclesRef.current = arr;
    setObstacles(arr);
    rafRef.current = requestAnimationFrame(step);
  }, [computeSpeed, computeSpawnInterval, stopLoop]);

  useEffect(() => {
    if (running && !over) {
      runningRef.current = true;
      overRef.current = false;
      lastTsRef.current = null;
      rafRef.current = requestAnimationFrame(step);
    } else {
      runningRef.current = false;
    }
    return () => stopLoop();
  }, [running, over, step, stopLoop]);

  const moveLane = useCallback((dir) => {
    if (over) return;
    if (!runningRef.current) setRunning(true);
    setLane((l) => {
      const next = Math.max(0, Math.min(LANES - 1, l + dir));
      if (next !== l) {
        setTilt(dir);
        clearTimeout(tiltTimeoutRef.current);
        tiltTimeoutRef.current = setTimeout(() => setTilt(0), 220);
      }
      return next;
    });
  }, [over]);

  useEffect(() => {
    function onKey(e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      moveLane(e.key === "ArrowLeft" ? -1 : 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [moveLane]);

  function handleTrackTap(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    moveLane(x < rect.width / 2 ? -1 : 1);
  }

  function reset() {
    setLane(1);
    setObstacles([]);
    setScore(0);
    setOver(false);
    setRunning(false);
    setTilt(0);
    setCrashFlash(false);
    setTrail([]);
    scoreRef.current = 0;
    obstaclesRef.current = [];
    overRef.current = false;
    spawnAccRef.current = 0;
    trailAccRef.current = 0;
  }

  const speedNow = computeSpeed(score);
  const dashDuration = Math.max(0.12, 1.9 / speedNow); // road dashes scroll faster as speed ramps up
  const speedPct = Math.min(1, (speedNow - BASE_SPEED) / (MAX_SPEED - BASE_SPEED));
  const isNewBest = over && score > 0 && score >= bestDistance;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <ScorePanel score={score} label="Distance" />
        <div
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border"
          style={{ borderColor: THEME.panel3, background: `linear-gradient(180deg, ${THEME.panel2}, ${THEME.panel})` }}
        >
          <Zap size={13} color={THEME.gold} fill={speedPct > 0.05 ? THEME.gold : "none"} />
          <span className="text-xs uppercase tracking-wide" style={{ color: THEME.muted, letterSpacing: "0.06em" }}>Speed</span>
          <div className="rounded-full overflow-hidden" style={{ width: 46, height: 5, background: THEME.panel3 }}>
            <div className="speed-fill" style={{ width: `${8 + speedPct * 92}%`, height: "100%", background: `linear-gradient(90deg, ${THEME.violet}, ${THEME.pink})` }} />
          </div>
        </div>
      </div>
      {!over ? (
        <>
          <div
            onClick={handleTrackTap}
            className={`relative overflow-hidden rounded-xl border road-scroll ${crashShake ? "car-shake" : ""}`}
            style={{
              width: "min(78vw, 300px)",
              height: "min(96vw, 640px)",
              borderColor: THEME.panel3,
              background: `radial-gradient(120% 60% at 50% 0%, rgba(139,108,246,0.10), transparent 60%), linear-gradient(180deg, #171B2A 0%, #10121C 55%, #0B0D16 100%)`,
              cursor: "pointer",
              touchAction: "manipulation",
              boxShadow: `inset 0 0 40px rgba(0,0,0,0.55)`,
            }}
          >
            {/* rumble strips along the outer road edges, scroll speed matches the road */}
            <div className="absolute top-0 bottom-0 road-dash" style={{
              left: 0, width: "5px",
              backgroundImage: `repeating-linear-gradient(180deg, #F0553A 0px, #F0553A 9px, #EDEAE2 9px, #EDEAE2 18px)`,
              animationDuration: `${dashDuration}s`, opacity: 0.85,
            }} />
            <div className="absolute top-0 bottom-0 road-dash" style={{
              right: 0, width: "5px",
              backgroundImage: `repeating-linear-gradient(180deg, #F0553A 0px, #F0553A 9px, #EDEAE2 9px, #EDEAE2 18px)`,
              animationDuration: `${dashDuration}s`, opacity: 0.85,
            }} />

            {/* lane dividers */}
            {Array.from({ length: LANES - 1 }).map((_, i) => (
              <div key={i} className="absolute top-0 bottom-0" style={{ left: `${((i + 1) * 100) / LANES}%`, width: "1px", background: THEME.panel3 }} />
            ))}
            {/* scrolling road dashes per lane, speed follows current pace */}
            {Array.from({ length: LANES }).map((_, l) => (
              <div key={l} className="absolute top-0 bottom-0 road-dash" style={{
                left: `${(l * 100) / LANES + 100 / LANES / 2}%`,
                width: "2px",
                transform: "translateX(-50%)",
                backgroundImage: `repeating-linear-gradient(180deg, ${THEME.panel3} 0px, ${THEME.panel3} 14px, transparent 14px, transparent 28px)`,
                animationDuration: `${dashDuration}s`,
              }} />
            ))}

            {/* speed streaks that intensify as pace ramps up, selling the sense of acceleration */}
            {speedPct > 0.12 && (
              <div className="absolute inset-0 pointer-events-none road-dash" style={{
                backgroundImage: `repeating-linear-gradient(180deg, rgba(255,255,255,${0.02 + speedPct * 0.05}) 0px, transparent 2px, transparent 46px)`,
                animationDuration: `${Math.max(0.05, dashDuration * 0.4)}s`,
              }} />
            )}

            {/* exhaust trail puffs behind the player car */}
            {trail.map((p, i) => (
              <div
                key={p.id}
                className="absolute trail-puff"
                style={{
                  width: `${100 / LANES}%`,
                  left: `${(p.lane * 100) / LANES}%`,
                  top: `${(CAR_ROW * 100) / ROWS + 100 / ROWS * 0.32}%`,
                  opacity: (i + 1) / trail.length * 0.35,
                }}
              >
                <div className="mx-auto rounded-full" style={{ width: 10, height: 10, background: THEME.violet, filter: "blur(3px)" }} />
              </div>
            ))}

            {obstacles.map((o) => (
              <div
                key={o.id}
                className="absolute flex items-center justify-center car-obstacle"
                style={{
                  width: `${100 / LANES}%`,
                  height: `${100 / ROWS}%`,
                  left: `${(o.lane * 100) / LANES}%`,
                  top: `${(o.row * 100) / ROWS}%`,
                  padding: "3%",
                  filter: "drop-shadow(0 4px 8px rgba(240,85,58,0.5))",
                }}
              >
                <CarSVG id={`rival-${o.id}`} palette={o.palette || "red"} flipped />
              </div>
            ))}

            <div
              className="absolute flex items-center justify-center car-player"
              style={{
                width: `${100 / LANES}%`,
                height: `${100 / ROWS}%`,
                left: `${(lane * 100) / LANES}%`,
                top: `${(CAR_ROW * 100) / ROWS}%`,
                padding: "1.5%",
                filter: `drop-shadow(0 4px 8px rgba(139,108,246,0.55))`,
                transform: `rotate(${tilt * -8}deg)`,
              }}
            >
              <CarSVG id="car-player" palette="violet" />
            </div>

            {/* red flash burst on impact */}
            {crashFlash && <div className="absolute inset-0 pointer-events-none crash-flash" />}

            {/* pre-race overlay */}
            {!running && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none race-start-overlay">
                <div className="rounded-full p-4 race-start-pulse" style={{ background: "rgba(139,108,246,0.18)", border: `1px solid ${THEME.violet}` }}>
                  <Play size={22} color={THEME.cream} fill={THEME.cream} />
                </div>
                <p className="text-xs text-center px-6" style={{ color: THEME.cream }}>
                  Press <span style={{ color: THEME.gold }}>← / →</span> or tap either side to start
                </p>
              </div>
            )}
          </div>
          <p className="text-xs" style={{ color: THEME.muted }}>Best distance: {bestDistance}</p>
        </>
      ) : (
        <GameOverPanel
          title="Crashed"
          detail={isNewBest ? `New best! You made it ${score} obstacles down the road.` : `You made it ${score} obstacles down the road. Best: ${bestDistance}.`}
          onReplay={reset}
          onBack={() => onFinish({ score, result: "Won" })}
        />
      )}
    </div>
  );
}

const MOLE_HOLES = 9;
const WHACK_DURATION = 30;
const BEST_SCORE_KEY = "wam_best_score_v2";

function clampNum(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
function shuffleArr(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* Kind config: emoji, point value, hole ring color, relative up-time multiplier */
const MOLE_KINDS = {
  mole: { emoji: "🦫", points: 10, ring: null },
  golden: { emoji: "✨", points: 30, ring: "#FFB703" },
  bomb: { emoji: "💣", points: -15, ring: "#F0553A" },
};

function WhackAMole({ onFinish }) {
  const [phase, setPhase] = useState("idle"); // idle | countdown | playing | over
  const [countdownVal, setCountdownVal] = useState(3);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [timeLeft, setTimeLeft] = useState(WHACK_DURATION);
  const [holes, setHoles] = useState(() => Array(MOLE_HOLES).fill(null)); // {kind,bornId} | null
  const [markers, setMarkers] = useState([]); // floating +N / -N text
  const [missPop, setMissPop] = useState(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [hits, setHits] = useState(0);
  const [comboFlash, setComboFlash] = useState(false);
  const [shake, setShake] = useState(false);

  const comboRef = useRef(0);
  const timeLeftRef = useRef(WHACK_DURATION);
  const moleTimersRef = useRef({});
  const spawnTimeoutRef = useRef(null);
  const gameTimerRef = useRef(null);
  const moleIdRef = useRef(0);
  const markerIdRef = useRef(0);
  const audioCtxRef = useRef(null);

  // Load best score once.
  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(BEST_SCORE_KEY));
      if (!Number.isNaN(stored) && stored > 0) setBest(stored);
    } catch {
      /* localStorage unavailable — ignore */
    }
  }, []);

  const ensureAudio = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtxRef.current = new Ctx();
    } catch {
      /* audio unsupported — ignore */
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback((freq, dur = 0.1, type = "sine", vol = 0.05) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + dur);
    } catch {
      /* ignore */
    }
  }, []);

  const pushMarker = useCallback((hole, tone, label) => {
    const id = ++markerIdRef.current;
    setMarkers((m) => [...m, { id, hole, tone, label }]);
    setTimeout(() => setMarkers((m) => m.filter((x) => x.id !== id)), 600);
  }, []);

  const resetCombo = useCallback(() => {
    comboRef.current = 0;
    setCombo(0);
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 320);
  }, []);

  const clearAllTimers = useCallback(() => {
    clearTimeout(spawnTimeoutRef.current);
    clearInterval(gameTimerRef.current);
    Object.values(moleTimersRef.current).forEach(clearTimeout);
    moleTimersRef.current = {};
  }, []);

  const pickKind = useCallback((elapsed) => {
    const bombChance = clampNum(0.04 + elapsed * 0.006, 0.04, 0.22);
    const goldenChance = 0.14;
    const r = Math.random();
    if (r < bombChance) return "bomb";
    if (r < bombChance + goldenChance) return "golden";
    return "mole";
  }, []);

  const scheduleAutoHide = useCallback((idx, bornId, kind, elapsed) => {
    const base = clampNum(1000 - elapsed * 13, 480, 1000);
    const upTime = kind === "golden" ? base * 0.65 : kind === "bomb" ? base * 1.2 : base;
    moleTimersRef.current[idx] = setTimeout(() => {
      setHoles((prev) => {
        if (!prev[idx] || prev[idx].bornId !== bornId) return prev;
        const next = [...prev];
        next[idx] = null;
        return next;
      });
      delete moleTimersRef.current[idx];
      if (kind !== "bomb") resetCombo();
    }, upTime);
  }, [resetCombo]);

  const doSpawn = useCallback(() => {
    setHoles((prev) => {
      const empty = prev.map((h, i) => (h === null ? i : -1)).filter((i) => i !== -1);
      if (empty.length === 0) return prev;
      const elapsed = WHACK_DURATION - timeLeftRef.current;
      const multiChance = clampNum(elapsed / 42, 0, 0.4);
      let count = empty.length > 1 && Math.random() < multiChance ? 2 : 1;
      count = Math.min(count, empty.length);
      const chosen = shuffleArr(empty).slice(0, count);
      const next = [...prev];
      chosen.forEach((idx) => {
        const kind = pickKind(elapsed);
        const bornId = ++moleIdRef.current;
        next[idx] = { kind, bornId };
        scheduleAutoHide(idx, bornId, kind, elapsed);
      });
      return next;
    });
  }, [pickKind, scheduleAutoHide]);

  const endGame = useCallback((finalScore) => {
    clearAllTimers();
    setHoles(Array(MOLE_HOLES).fill(null));
    setPhase("over");
    setBest((b) => {
      if (finalScore > b) {
        try { window.localStorage.setItem(BEST_SCORE_KEY, String(finalScore)); } catch { /* ignore */ }
        return finalScore;
      }
      return b;
    });
  }, [clearAllTimers]);

  // Countdown ticker.
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdownVal === 0) {
      const t = setTimeout(() => setPhase("playing"), 420);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setCountdownVal((v) => v - 1), 620);
    return () => clearTimeout(t);
  }, [phase, countdownVal]);

  // Main game loop: spawn scheduler + 1s clock.
  useEffect(() => {
    if (phase !== "playing") return;
    timeLeftRef.current = WHACK_DURATION;

    function loop() {
      doSpawn();
      const elapsed = WHACK_DURATION - timeLeftRef.current;
      const delay = clampNum(800 - elapsed * 16, 340, 800);
      spawnTimeoutRef.current = setTimeout(loop, delay);
    }
    spawnTimeoutRef.current = setTimeout(loop, 150);

    gameTimerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        const nt = t - 1;
        timeLeftRef.current = Math.max(0, nt);
        if (nt <= 0) {
          setScore((s) => { endGame(s); return s; });
          return 0;
        }
        return nt;
      });
    }, 1000);

    return clearAllTimers;
  }, [phase, doSpawn, endGame, clearAllTimers]);

  function start() {
    ensureAudio();
    clearAllTimers();
    comboRef.current = 0;
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setHits(0);
    setTimeLeft(WHACK_DURATION);
    timeLeftRef.current = WHACK_DURATION;
    setHoles(Array(MOLE_HOLES).fill(null));
    setMarkers([]);
    setCountdownVal(3);
    setPhase("countdown");
  }

  function reset() {
    clearAllTimers();
    setPhase("idle");
    setHoles(Array(MOLE_HOLES).fill(null));
    setMarkers([]);
  }

  function whack(i) {
    const cell = holes[i];
    if (phase !== "playing" || !cell) return;
    if (moleTimersRef.current[i]) {
      clearTimeout(moleTimersRef.current[i]);
      delete moleTimersRef.current[i];
    }
    setHoles((prev) => {
      const next = [...prev];
      next[i] = null;
      return next;
    });

    if (cell.kind === "bomb") {
      resetCombo();
      setScore((s) => Math.max(0, s + MOLE_KINDS.bomb.points));
      pushMarker(i, "bomb", `${MOLE_KINDS.bomb.points}`);
      triggerShake();
      playTone(110, 0.2, "sawtooth", 0.07);
      return;
    }

    const nc = comboRef.current + 1;
    comboRef.current = nc;
    setCombo(nc);
    setMaxCombo((mc) => Math.max(mc, nc));
    setHits((h) => h + 1);

    const mult = Math.min(1 + Math.floor(nc / 5) * 0.5, 3);
    const gain = Math.round(MOLE_KINDS[cell.kind].points * mult);
    setScore((s) => s + gain);
    pushMarker(i, cell.kind, `+${gain}`);

    if (nc > 0 && nc % 5 === 0) {
      setComboFlash(true);
      playTone(660 + nc * 6, 0.14, "triangle", 0.055);
      setTimeout(() => setComboFlash(false), 550);
    } else {
      playTone(cell.kind === "golden" ? 920 : 540, 0.08, "square", 0.045);
    }
  }

  function missClick(i) {
    if (phase !== "playing" || holes[i]) return;
    setMissPop(i);
    playTone(160, 0.05, "sine", 0.02);
    setTimeout(() => setMissPop(null), 220);
  }

  const comboMult = Math.min(1 + Math.floor(combo / 5) * 0.5, 3);
  const timePct = (timeLeft / WHACK_DURATION) * 100;
  const timeColor = lerpColor(THEME.green || "#3ECF8E", "#F0553A", 1 - timeLeft / WHACK_DURATION);
  const isNewBest = phase === "over" && score >= best && score > 0;

  if (phase === "over") {
    return (
      <GameOverPanel
        title={`${hits} mole${hits === 1 ? "" : "s"} whacked`}
        detail={`Score ${score}${isNewBest ? " — new best!" : ` · Best ${best}`} · Top combo x${maxCombo ? Math.min(1 + Math.floor(maxCombo / 5) * 0.5, 3).toFixed(1) : "1.0"}`}
        onReplay={start}
        onBack={() => onFinish({ score, result: score > 0 ? "Won" : "Lost" })}
      />
    );
  }

  return (
    <div className={`flex flex-col items-center gap-4 w-full max-w-sm ${shake ? "wam-shake" : ""}`}>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <ScorePanel score={score} label="Score" />
        <div
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors"
          style={{
            borderColor: combo >= 5 ? THEME.gold : THEME.panel3,
            background: `linear-gradient(180deg, ${THEME.panel2}, ${THEME.panel})`,
          }}
        >
          <Flame size={14} color={combo > 0 ? THEME.gold : THEME.muted} className={combo >= 5 ? "float-anim" : ""} />
          <span className="text-xs" style={{ color: combo > 0 ? THEME.cream : THEME.muted, fontWeight: 600 }}>
            {combo > 0 ? `x${comboMult.toFixed(1)} combo` : "no combo"}
          </span>
        </div>
        {best > 0 && (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border" style={{ borderColor: THEME.panel3, background: THEME.panel }}>
            <Trophy size={13} color={THEME.gold} />
            <span className="text-xs" style={{ color: THEME.muted }}>Best {best}</span>
          </div>
        )}
      </div>

      {phase === "playing" && (
        <div className="w-full flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs" style={{ color: THEME.muted }}>
            <span className="uppercase tracking-wide" style={{ letterSpacing: "0.06em" }}>Time</span>
            <span style={{ fontFamily: "'Press Start 2P', monospace", color: timeLeft <= 5 ? "#F0553A" : THEME.cream, fontSize: "0.85rem" }}>
              {timeLeft}s
            </span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: THEME.panel3 }}>
            <div className="h-full wam-timebar" style={{ width: `${timePct}%`, background: timeColor }} />
          </div>
        </div>
      )}

      {comboFlash && (
        <div className="wam-combo-banner text-sm font-bold px-3 py-1 rounded-full" style={{ color: "#0D1120", background: THEME.gold }}>
          Combo x{comboMult.toFixed(1)}!
        </div>
      )}

      {phase === "idle" && (
        <>
          <div className="flex flex-col gap-2 w-full text-sm" style={{ color: THEME.muted }}>
            <p className="text-center">Whack the mole for points, golden moles for a big bonus, and never touch the bomb.</p>
            <div className="flex items-center justify-center gap-4 text-xs flex-wrap">
              <span className="inline-flex items-center gap-1.5"><span className="text-lg leading-none">🦫</span> +10</span>
              <span className="inline-flex items-center gap-1.5"><span className="text-lg leading-none">✨</span> +30</span>
              <span className="inline-flex items-center gap-1.5"><span className="text-lg leading-none">💣</span> avoid</span>
              <span className="inline-flex items-center gap-1.5"><Flame size={13} color={THEME.gold} /> chain hits to multiply</span>
            </div>
          </div>
          <button onClick={start} className="btn-press flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold"
            style={{ background: THEME.violet, color: "#fff" }}>
            <Play size={16} /> Start
          </button>
        </>
      )}

      {phase === "countdown" && (
        <div className="relative w-full flex items-center justify-center" style={{ height: "220px" }}>
          <span key={countdownVal} className="wam-countdown-pop" style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "3rem", color: THEME.gold }}>
            {countdownVal > 0 ? countdownVal : "GO!"}
          </span>
        </div>
      )}

      {phase === "playing" && (
        <div className="grid grid-cols-3 gap-3 w-full">
          {Array.from({ length: MOLE_HOLES }).map((_, i) => {
            const cell = holes[i];
            const kindCfg = cell ? MOLE_KINDS[cell.kind] : null;
            const marker = markers.filter((m) => m.hole === i).slice(-1)[0];
            return (
              <button
                key={i}
                onClick={() => (cell ? whack(i) : missClick(i))}
                aria-label={cell ? `${cell.kind} mole in hole ${i + 1}` : `empty hole ${i + 1}`}
                className={`mole-hole relative rounded-full overflow-hidden ${missPop === i ? "mole-miss" : ""}`}
                style={{
                  aspectRatio: "1 / 1",
                  background: `radial-gradient(circle at 50% 40%, ${THEME.panel3}, #0D1120 70%)`,
                  border: `1px solid ${kindCfg?.ring || THEME.panel3}`,
                  boxShadow: kindCfg?.ring
                    ? `0 0 0 1px ${kindCfg.ring}55, 0 0 16px ${kindCfg.ring}66`
                    : "none",
                }}
              >
                <div className="absolute inset-x-0 bottom-0" style={{ height: "38%", background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.55))" }} />
                {cell?.kind === "bomb" && <div className="absolute inset-0 wam-bomb-pulse" />}
                {cell && (
                  <span key={cell.bornId} className="mole-pop absolute inset-0 flex items-center justify-center text-4xl select-none">
                    {kindCfg.emoji}
                  </span>
                )}
                {marker && (
                  <span
                    key={marker.id}
                    className="wam-marker absolute inset-x-0 top-1/3 flex items-center justify-center text-sm font-bold select-none pointer-events-none"
                    style={{ color: marker.tone === "bomb" ? "#FF8A75" : marker.tone === "golden" ? THEME.gold : THEME.green || "#3ECF8E" }}
                  >
                    {marker.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===========================================================
   PAGES
=========================================================== */

function HomePage({ onNavigateGames, onNavigateLeaderboard, onPlay, coins }) {
  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <div className="relative rounded-3xl overflow-hidden border" style={{ borderColor: THEME.panel3 }}>
        <div className="absolute inset-0" style={{
          background: `radial-gradient(circle at 15% 30%, rgba(139,108,246,0.35), transparent 45%),
                       radial-gradient(circle at 85% 70%, rgba(245,71,140,0.28), transparent 45%),
                       linear-gradient(135deg, #14192E, #0A0E1A)`,
        }} />
        <div className="relative flex flex-col md:flex-row items-center gap-8 px-6 sm:px-10 py-10 sm:py-14">
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs tracking-wide mb-3" style={{ color: THEME.muted }}>
              Thousands of moves. Zero downloads.
            </p>
            <h1 className="leading-tight text-3xl sm:text-4xl font-extrabold" style={{ color: THEME.cream }}>
              Play. Explore.{" "}
              <span style={{
                background: `linear-gradient(90deg, ${THEME.violet}, ${THEME.pink})`,
                WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
              }}>
                Compete.
              </span>
            </h1>
            <p className="mt-4 max-w-md mx-auto md:mx-0" style={{ color: THEME.muted }}>
              Jump into a browser game, climb the leaderboard, and pick up achievements along the way.
            </p>
            <div className="mt-6 flex items-center justify-center md:justify-start gap-3">
              <button onClick={onNavigateGames} className="btn-press flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold"
                style={{ background: THEME.violet, color: "#fff" }}>
                Explore games <ChevronRight size={16} />
              </button>
              <button onClick={onNavigateLeaderboard} className="btn-press flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold border"
                style={{ borderColor: THEME.panel3, color: THEME.cream }}>
                <Trophy size={16} color={THEME.gold} /> Leaderboard
              </button>
            </div>
          </div>
          <div className="relative flex-shrink-0 w-40 h-40 sm:w-48 sm:h-48 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full blur-2xl opacity-50" style={{ background: THEME.violet }} />
            <span className="relative text-8xl float-anim">🎮</span>
            <span className="absolute -top-1 -left-3 text-2xl float-anim" style={{ animationDelay: "0.4s" }}>🕹️</span>
            <span className="absolute -bottom-2 -right-2 text-2xl float-anim" style={{ animationDelay: "0.8s" }}>🏆</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div>
        <h2 className="text-lg font-semibold mb-4" style={{ color: THEME.cream }}>Browse by category</h2>
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => {
            const count = GAMES.filter((g) => c === "All" || g.category === c).length;
            return (
              <button key={c} onClick={onNavigateGames} className="btn-press flex-shrink-0 flex flex-col items-center justify-center gap-1 px-6 py-4 rounded-xl border"
                style={{ borderColor: THEME.panel3, background: THEME.panel }}>
                <span className="text-sm font-medium" style={{ color: THEME.cream }}>{c}</span>
                <span className="text-[11px]" style={{ color: THEME.muted }}>{count} games</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured carousel */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: THEME.cream }}>
            <Sparkles size={18} color={THEME.gold} /> Featured games
          </h2>
          <button onClick={onNavigateGames} className="text-sm" style={{ color: THEME.violet }}>View all →</button>
        </div>
        <Carousel>
          {GAMES.map((g) => <GameCard key={g.id} game={g} onPlay={onPlay} wide />)}
        </Carousel>
      </div>

      {/* Coming soon carousel */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: THEME.cream }}>
          <Flame size={18} color={THEME.pink} /> Coming soon
        </h2>
        <Carousel>
          {COMING_SOON.map((g) => <ComingSoonCard key={g.id} game={g} />)}
        </Carousel>
      </div>

      {/* Promo banner */}
      <div className="rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
        style={{ background: `linear-gradient(90deg, ${THEME.violet}, ${THEME.pink})` }}>
        <div>
          <p className="font-semibold text-white text-lg">Compete on the leaderboard</p>
          <p className="text-sm text-white/80">Play games, bank points, and climb the ranks.</p>
        </div>
        <button onClick={onNavigateGames} className="btn-press px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2"
          style={{ background: "#fff", color: THEME.violet }}>
          View leaderboard <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function GamesPage({ onPlay, query, setQuery }) {
  const [category, setCategory] = useState("All");
  const [searchFocused, setSearchFocused] = useState(false);
  const filtered = GAMES.filter((g) => (category === "All" || g.category === category) && g.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold" style={{ color: THEME.cream }}>All games</h2>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 flex-1" onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
          style={{
            borderColor: searchFocused ? THEME.violet : THEME.panel3,
            background: `linear-gradient(180deg, ${THEME.panel2}, ${THEME.panel})`,
            boxShadow: searchFocused ? `0 0 0 3px color-mix(in srgb, ${THEME.violet} 30%, transparent), 0 4px 18px color-mix(in srgb, ${THEME.violet} 30%, transparent)` : "none",
            transition: "border-color 0.25s ease, box-shadow 0.25s ease",
          }}>
          <Search size={16} color={searchFocused ? THEME.violet : THEME.muted} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search games…"
            className="bg-transparent outline-none flex-1 text-sm" style={{ color: THEME.cream }} />
        </div>
        <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => {
            const count = GAMES.filter((g) => c === "All" || g.category === c).length;
            return (
              <button key={c} onClick={() => setCategory(c)} className="btn-press flex-shrink-0 flex flex-col items-center justify-center gap-1 px-6 py-4 rounded-xl border"
                style={{
                  borderColor: category === c ? THEME.violet : THEME.panel3,
                  background: category === c ? THEME.violet : THEME.panel,
                }}>
                <span className="text-sm font-medium" style={{ color: THEME.cream }}>{c}</span>
                <span className="text-[11px]" style={{ color: category === c ? THEME.cream : THEME.muted }}>{count} games</span>
              </button>
            );
          })}
        </div>
      </div>
      {filtered.length === 0 ? (
        <p style={{ color: THEME.muted }}>No games match that search.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((g) => <GameCard key={g.id} game={g} onPlay={onPlay} />)}
        </div>
      )}
    </div>
  );
}

function GamePage({ gameId, onFinish, onBack }) {
  const game = GAMES.find((g) => g.id === gameId);
  const componentMap = { chess: Chess, tictactoe: TicTacToe, rps: RPS, memory: Memory, quiz: Quiz, snake: Snake, carrace: CarRace, whackamole: WhackAMole };
  const GameComponent = componentMap[gameId];

  return (
    <div className="flex flex-col gap-6">
      <button onClick={onBack} className="btn-press flex items-center gap-2 text-sm w-fit transition-colors hover:text-white" style={{ color: THEME.muted }}>
        <ArrowLeft size={16} /> Back to games
      </button>
      <div className="flex items-center gap-3">
        {game?.image ? (
          <img src={game.image} alt={game.name} className="w-10 h-10 rounded-xl object-cover border shadow-sm" style={{ borderColor: THEME.panel3 }} />
        ) : (
          <span className="text-3xl">{game?.emoji}</span>
        )}
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2.5" style={{ color: THEME.cream }}>
            {game?.name}
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border" style={{ borderColor: THEME.panel3, color: THEME.muted }}>
              {game?.category}
            </span>
          </h2>
          <p className="text-xs" style={{ color: THEME.muted }}>{game?.blurb}</p>
        </div>
      </div>
      <div className="rounded-2xl border p-6 flex items-center justify-center" style={{ borderColor: THEME.panel3, background: THEME.panel, minHeight: "380px" }}>
        <GameComponent onFinish={(result) => onFinish(gameId, game?.name, result)} />
      </div>
    </div>
  );
}

function LeaderboardPage({ rows: initialRows, loading: initialLoading, currentUserId, onPlay }) {
  const [gameFilter, setGameFilter] = useState("all");
  const [rows, setRows] = useState(initialRows || []);
  const [loading, setLoading] = useState(false);

  // Fetch leaderboard whenever the game filter changes
  useEffect(() => {
    let active = true;
    setLoading(true);
    api.getLeaderboard({ gameId: gameFilter === "all" ? undefined : gameFilter, limit: 50 })
      .then((data) => {
        if (active) setRows(data || []);
      })
      .catch((err) => {
        console.error("Failed to load leaderboard:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [gameFilter]);

  // Sync initialRows if gameFilter is "all" and initialRows updates
  useEffect(() => {
    if (gameFilter === "all" && initialRows) {
      setRows(initialRows);
    }
  }, [initialRows, gameFilter]);

  const medals = ["🥇", "🥈", "🥉"];
  const activeGameObj = GAMES.find((g) => g.id === gameFilter);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2.5" style={{ color: THEME.cream }}>
            <span className="p-2 rounded-xl" style={{ background: "rgba(255,183,3,0.15)", border: "1px solid rgba(255,183,3,0.3)" }}>
              <Trophy size={22} color={THEME.gold} />
            </span>
            Leaderboard
          </h2>
          <p className="text-sm mt-1" style={{ color: THEME.muted }}>
            {gameFilter === "all"
              ? "Players ranked by total accumulated score across all games."
              : `Top players ranked by high score in ${activeGameObj?.name || "this game"}.`}
          </p>
        </div>

        {activeGameObj && onPlay && (
          <button
            onClick={() => onPlay(activeGameObj.id)}
            className="btn-press flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all self-start sm:self-auto"
            style={{
              background: `linear-gradient(135deg, ${THEME.violet}, #6D48E5)`,
              color: "#FFF",
              boxShadow: `0 0 20px ${THEME.violet}44`,
            }}
          >
            <Play size={14} fill="currentColor" /> Play {activeGameObj.name}
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap items-center">
        <button
          key="all"
          onClick={() => setGameFilter("all")}
          className="btn-press text-xs font-semibold px-3.5 py-2 rounded-xl border flex items-center gap-1.5 transition-all"
          style={{
            borderColor: gameFilter === "all" ? THEME.violet : THEME.panel3,
            color: gameFilter === "all" ? "#FFF" : THEME.muted,
            background: gameFilter === "all" ? THEME.violet : THEME.panel,
            boxShadow: gameFilter === "all" ? `0 0 16px ${THEME.violet}44` : "none",
          }}
        >
          <Sparkles size={13} color={gameFilter === "all" ? THEME.gold : THEME.muted} />
          All Players (Overall)
        </button>
        {GAMES.map((g) => (
          <button
            key={g.id}
            onClick={() => setGameFilter(g.id)}
            className="btn-press text-xs font-semibold px-3 py-2 rounded-xl border flex items-center gap-1.5 transition-all"
            style={{
              borderColor: gameFilter === g.id ? THEME.violet : THEME.panel3,
              color: gameFilter === g.id ? "#FFF" : THEME.muted,
              background: gameFilter === g.id ? THEME.violet : THEME.panel,
              boxShadow: gameFilter === g.id ? `0 0 16px ${THEME.violet}44` : "none",
            }}
          >
            <span>{g.emoji}</span>
            <span>{g.name}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 rounded-2xl border"
          style={{ borderColor: THEME.panel3, background: THEME.panel }}>
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: THEME.violet, borderTopColor: "transparent" }} />
          <p className="text-sm font-medium" style={{ color: THEME.muted }}>Loading player rankings…</p>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border"
          style={{ borderColor: THEME.panel3, background: THEME.panel }}>
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
            style={{ background: THEME.panel2, border: `1px solid ${THEME.panel3}` }}>
            🎮
          </div>
          <h3 className="text-base font-semibold" style={{ color: THEME.cream }}>No scores recorded yet</h3>
          <p className="text-sm mt-1 max-w-sm" style={{ color: THEME.muted }}>
            Be the first player to hit the leaderboard! Start a game and set the high score.
          </p>
          {activeGameObj && onPlay && (
            <button
              onClick={() => onPlay(activeGameObj.id)}
              className="btn-press mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
              style={{ background: THEME.violet, color: "#FFF" }}
            >
              <Play size={14} fill="currentColor" /> Play Now
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-2xl border overflow-hidden shadow-2xl" style={{ borderColor: THEME.panel3, background: THEME.panel }}>
          {/* Table column header */}
          <div className="grid grid-cols-12 px-5 py-3 text-xs font-semibold uppercase tracking-wider border-b"
            style={{ borderColor: THEME.panel3, color: THEME.muted, background: THEME.panel2 }}>
            <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
            <div className="col-span-6 sm:col-span-6">Player</div>
            <div className="hidden sm:block sm:col-span-3 text-right pr-4">Stats</div>
            <div className="col-span-4 sm:col-span-2 text-right">Score</div>
          </div>

          {/* User rows */}
          <div className="divide-y" style={{ borderColor: `${THEME.panel3}55` }}>
            {rows.map((row, i) => {
              const mine = row.user_id === currentUserId;
              const isTop3 = i < 3;
              const medal = medals[i];

              return (
                <div
                  key={row.user_id}
                  className="grid grid-cols-12 items-center px-5 py-3.5 text-sm transition-all hover:brightness-110"
                  style={{
                    background: mine
                      ? "linear-gradient(90deg, rgba(255,183,3,0.12) 0%, rgba(255,183,3,0.03) 100%)"
                      : i % 2 === 0
                      ? THEME.panel
                      : THEME.panel2,
                    borderLeft: mine ? `3px solid ${THEME.gold}` : "3px solid transparent",
                  }}
                >
                  {/* Rank */}
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                    {medal ? (
                      <span className="text-xl filter drop-shadow-md select-none">{medal}</span>
                    ) : (
                      <span
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold font-mono"
                        style={{
                          color: THEME.muted,
                          background: THEME.panel3,
                        }}
                      >
                        {i + 1}
                      </span>
                    )}
                  </div>

                  {/* Player info */}
                  <div className="col-span-6 sm:col-span-6 flex items-center gap-3 min-w-0">
                    <div className="relative flex-shrink-0">
                      {row.avatar_url ? (
                        <img
                          src={row.avatar_url}
                          alt={row.player}
                          className="w-9 h-9 rounded-full object-cover border"
                          style={{ borderColor: isTop3 ? THEME.gold : THEME.panel3 }}
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-base border"
                          style={{
                            background: THEME.panel3,
                            borderColor: isTop3 ? THEME.gold : "transparent",
                          }}
                        >
                          {row.avatar_emoji || "👤"}
                        </div>
                      )}
                      {mine && (
                        <span
                          className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2"
                          style={{ background: THEME.green, borderColor: THEME.panel }}
                          title="You"
                        />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-semibold truncate"
                          style={{ color: mine ? THEME.gold : THEME.cream }}
                        >
                          {row.player}
                        </span>
                        {mine && (
                          <span
                            className="px-1.5 py-0.2 rounded text-[10px] font-bold tracking-wider uppercase border"
                            style={{
                              background: "rgba(255,183,3,0.18)",
                              color: THEME.gold,
                              borderColor: "rgba(255,183,3,0.4)",
                            }}
                          >
                            YOU
                          </span>
                        )}
                      </div>
                      <span className="text-xs truncate" style={{ color: THEME.muted }}>
                        @{row.username}
                      </span>
                    </div>
                  </div>

                  {/* Stats (Games Played & Wins) */}
                  <div className="hidden sm:flex sm:col-span-3 items-center justify-end gap-3 text-xs pr-4" style={{ color: THEME.muted }}>
                    <span className="px-2 py-1 rounded-md" style={{ background: THEME.panel3 }}>
                      {row.games_played} {row.games_played === 1 ? "game" : "games"}
                    </span>
                    <span className="px-2 py-1 rounded-md" style={{ background: "rgba(95,217,138,0.12)", color: THEME.green }}>
                      {row.games_won} {row.games_won === 1 ? "win" : "wins"}
                    </span>
                  </div>

                  {/* Score */}
                  <div className="col-span-4 sm:col-span-2 flex flex-col items-end justify-center">
                    <span
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: "0.85rem",
                        color: isTop3 || mine ? THEME.gold : THEME.cream,
                        textShadow: isTop3 || mine ? "0 0 10px rgba(255,183,3,0.35)" : "none",
                      }}
                    >
                      {row.score.toLocaleString()}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: THEME.muted }}>
                      {gameFilter === "all" ? "TOTAL PTS" : "BEST SCORE"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfilePage({ user, stats, setStats, achievementsCatalog, earnedIds, history, loading }) {
  const { token, setUser } = useAuth();
  const avatarInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(user.display_name || user.username || "");
  const [savingName, setSavingName] = useState(false);
  const [nameError, setNameError] = useState(null);

  const [favoriteOverride, setFavoriteOverride] = useState(null);
  const [editingFavorite, setEditingFavorite] = useState(false);
  const [favoriteDraft, setFavoriteDraft] = useState("");
  const [savingFavorite, setSavingFavorite] = useState(false);

  // Best-effort local fallback so a rename / favorite-game pick sticks even if
  // the backend doesn't (yet) support persisting these fields.
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(`profile_overrides_${user.id}`) || "{}");
      if (raw.favourite_game) setFavoriteOverride(raw.favourite_game);
    } catch {
      /* localStorage unavailable — ignore */
    }
  }, [user.id]);

  if (loading || !stats) {
    return (
      <div className="flex flex-col gap-8">
        <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: THEME.cream }}>
          <UserIcon size={20} /> Profile
        </h2>
        <p className="text-sm" style={{ color: THEME.muted }}>Loading profile…</p>
      </div>
    );
  }

  const played = stats.games_played;
  const won = stats.games_won;
  const lost = stats.games_lost;
  const totalScore = stats.total_score;
  const favorite = favoriteOverride || stats.favourite_game || "—";

  function persistOverride(patch) {
    try {
      const raw = JSON.parse(localStorage.getItem(`profile_overrides_${user.id}`) || "{}");
      localStorage.setItem(`profile_overrides_${user.id}`, JSON.stringify({ ...raw, ...patch }));
    } catch {
      /* localStorage unavailable — ignore */
    }
  }

  const RENAME_COST = 60;

  async function saveName() {
    const trimmed = nameDraft.trim();
    if (!trimmed) { setNameError("Name can't be empty"); return; }
    if (trimmed.length > 24) { setNameError("Keep it under 24 characters"); return; }
    if (trimmed === (user.display_name || user.username)) { setEditingName(false); return; }
    const currentCoins = stats?.coins ?? user?.coins ?? 0;
    if (currentCoins < RENAME_COST) {
      setNameError(`Renaming costs ${RENAME_COST} coins — you only have ${currentCoins}`);
      return;
    }
    setSavingName(true);
    setNameError(null);
    try {
      const updated = await api.updateProfile(token, { display_name: trimmed });
      setUser(updated);
      if (typeof setStats === "function") {
        setStats((prev) => (prev ? { ...prev, coins: updated.coins, display_name: updated.display_name } : prev));
      }
      if (typeof refreshUser === "function") {
        refreshUser(token);
      }
      setEditingName(false);
    } catch (err) {
      setNameError(err.message || "Failed to update name");
    } finally {
      setSavingName(false);
    }
  }

  async function saveFavorite() {
    setSavingFavorite(true);
    try {
      setFavoriteOverride(favoriteDraft);
      persistOverride({ favourite_game: favoriteDraft });
    } finally {
      setSavingFavorite(false);
      setEditingFavorite(false);
    }
  }

  const distinctGamesPlayed = new Set(history.map((h) => h.game_name)).size;
  let bestWinStreak = 0, currentStreak = 0;
  for (const h of history) {
    if (h.result === "Won") { currentStreak += 1; bestWinStreak = Math.max(bestWinStreak, currentStreak); }
    else currentStreak = 0;
  }
  const bonusAchievements = [
    { id: "bonus-10games", icon: "🎮", name: "10 Games Played", has: played >= 10 },
    { id: "bonus-25games", icon: "🕹️", name: "25 Games Played", has: played >= 25 },
    { id: "bonus-allrounder", icon: "🌐", name: "All-Rounder", has: distinctGamesPlayed >= 5 },
    { id: "bonus-winstreak3", icon: "🔥", name: "3-Win Streak", has: bestWinStreak >= 3 },
    { id: "bonus-highroller", icon: "💰", name: "High Roller", has: (stats.coins || 0) >= 500 },
    { id: "bonus-score1000", icon: "🏅", name: "Score 1000+", has: totalScore >= 1000 },
    { id: "bonus-score5000", icon: "💎", name: "Score 5000+", has: totalScore >= 5000 },
    { id: "bonus-perfect", icon: "🎯", name: "Flawless Record", has: played > 0 && won === played },
  ];

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const updated = await api.uploadAvatar(token, file);
      // Optimistically update the user in context so UI refreshes immediately
      // (WebSocket broadcast will also trigger refreshUser for other tabs)
      setUser(updated);
    } catch (err) {
      setUploadError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      // Reset so selecting the same file again works
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: THEME.cream }}>
        <UserIcon size={20} /> Profile
      </h2>

      <div className="flex items-center gap-5">
        {/* ── Clickable avatar ── */}
        <div className="relative group flex-shrink-0">
          <button
            id="avatar-upload-btn"
            onClick={() => avatarInputRef.current?.click()}
            disabled={uploading}
            title="Change profile photo"
            className="w-20 h-20 rounded-full overflow-hidden border-2 flex items-center justify-center text-2xl relative"
            style={{
              borderColor: THEME.violet,
              background: THEME.panel,
              cursor: uploading ? "wait" : "pointer",
              boxShadow: `0 0 0 4px ${THEME.violet}22`,
            }}
          >
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt="Profile"
                className="w-full h-full object-cover"
                style={{ display: "block" }}
              />
            ) : (
              <span>{user.avatar_emoji || "👤"}</span>
            )}

            {/* hover overlay */}
            <span
              className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(0,0,0,0.62)", borderRadius: "50%" }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span style={{ color: "#fff", fontSize: "9px", fontWeight: 600 }}>
                {uploading ? "Uploading…" : "Change"}
              </span>
            </span>
          </button>

          {/* spinning ring while uploading */}
          {uploading && (
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                border: `3px solid ${THEME.violet}`,
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }}
            />
          )}

          <input
            ref={avatarInputRef}
            id="avatar-file-input"
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            style={{ display: "none" }}
            onChange={handleAvatarChange}
          />
        </div>

        <div>
          {editingName ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={nameDraft}
                onChange={(e) => setNameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") { setEditingName(false); setNameDraft(user.display_name || user.username || ""); setNameError(null); }
                }}
                maxLength={24}
                className="font-semibold text-lg bg-transparent outline-none border-b px-1"
                style={{ color: THEME.cream, borderColor: THEME.violet, width: "12ch" }}
              />
              <button onClick={saveName} disabled={savingName} className="btn-press w-6 h-6 rounded-md flex items-center justify-center" title="Save">
                <Check size={14} color={THEME.green} />
              </button>
              <button onClick={() => { setEditingName(false); setNameDraft(user.display_name || user.username || ""); setNameError(null); }}
                className="btn-press w-6 h-6 rounded-md flex items-center justify-center" title="Cancel">
                <X size={14} color={THEME.muted} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-lg" style={{ color: THEME.cream }}>{user.display_name || user.username}</p>
              <button onClick={() => { setNameDraft(user.display_name || user.username || ""); setEditingName(true); }}
                className="btn-press w-5 h-5 rounded-md flex items-center justify-center" title={`Rename (costs ${RENAME_COST} coins)`}>
                <Pencil size={12} color={THEME.muted} />
              </button>
            </div>
          )}
          {editingName && (
            <p className="text-xs mt-0.5" style={{ color: THEME.gold }}>Renaming costs {RENAME_COST} coins</p>
          )}
          {nameError && <p className="text-xs mt-0.5" style={{ color: THEME.pink }}>{nameError}</p>}

          {editingFavorite ? (
            <div className="flex items-center gap-1.5 mt-1">
              <select
                autoFocus
                value={favoriteDraft}
                onChange={(e) => setFavoriteDraft(e.target.value)}
                className="text-sm rounded-md border px-2 py-1 outline-none"
                style={{ background: THEME.panel, borderColor: THEME.panel3, color: THEME.cream }}
              >
                <option value="">No favorite</option>
                {GAMES.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
              </select>
              <button onClick={saveFavorite} disabled={savingFavorite} className="btn-press w-6 h-6 rounded-md flex items-center justify-center" title="Save">
                <Check size={14} color={THEME.green} />
              </button>
              <button onClick={() => setEditingFavorite(false)} className="btn-press w-6 h-6 rounded-md flex items-center justify-center" title="Cancel">
                <X size={14} color={THEME.muted} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-sm" style={{ color: THEME.muted }}>Favorite game: {favorite}</p>
              <button onClick={() => { setFavoriteDraft(favorite === "—" ? "" : favorite); setEditingFavorite(true); }}
                className="btn-press w-5 h-5 rounded-md flex items-center justify-center" title="Set favorite game">
                <Pencil size={11} color={THEME.muted} />
              </button>
            </div>
          )}

          <p className="text-sm flex items-center gap-1 mt-1" style={{ color: THEME.gold }}><Coins size={14} /> {stats.coins} coins</p>
          {uploadError && (
            <p className="text-xs mt-1" style={{ color: THEME.pink }}>{uploadError}</p>
          )}
          <p className="text-xs mt-1" style={{ color: THEME.muted }}>
            Click avatar to upload a photo (JPEG, PNG, GIF, WebP)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[["Games played", played], ["Games won", won], ["Games lost", lost], ["Total score", totalScore]].map(([label, value]) => (
          <div key={label} className="rounded-xl border p-4 text-center" style={{ borderColor: THEME.panel3, background: THEME.panel }}>
            <p style={{ fontFamily: "'Press Start 2P', monospace", color: THEME.gold, fontSize: "1.1rem" }}>{value}</p>
            <p className="text-xs mt-2" style={{ color: THEME.muted }}>{label}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold mb-3 flex items-center gap-2" style={{ color: THEME.cream }}><Award size={16} /> Achievements</h3>
        <div className="flex gap-3 flex-wrap">
          {achievementsCatalog.map((a) => {
            const has = earnedIds.has(a.id);
            return (
              <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm" title={a.description}
                style={{ borderColor: has ? THEME.gold : THEME.panel3, background: THEME.panel, color: has ? THEME.cream : THEME.muted, opacity: has ? 1 : 0.5 }}>
                <span>{a.icon}</span> {a.name}
              </div>
            );
          })}
          {bonusAchievements.map((a) => (
            <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm" title={a.has ? "Unlocked" : "Locked"}
              style={{ borderColor: a.has ? THEME.gold : THEME.panel3, background: THEME.panel, color: a.has ? THEME.cream : THEME.muted, opacity: a.has ? 1 : 0.5 }}>
              <span>{a.icon}</span> {a.name}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3" style={{ color: THEME.cream }}>Game history</h3>
        {history.length === 0 ? (
          <p className="text-sm" style={{ color: THEME.muted }}>No games played yet — head to the games page to get on the board.</p>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: THEME.panel3 }}>
            {history.map((s, i) => (
              <div key={s.id ?? i} className="grid items-center px-4 py-3 text-sm gap-2" style={{ gridTemplateColumns: "2fr 1fr 1fr 0.6fr", background: i % 2 === 0 ? THEME.panel : THEME.panel2, color: THEME.cream }}>
                <span className="text-left truncate">{s.game_name}</span>
                <span className="text-center" style={{ color: THEME.muted }}>{new Date(s.played_at).toLocaleDateString()}</span>
                <span className="text-center" style={{ color: s.result === "Won" ? THEME.green : s.result === "Lost" ? THEME.pink : THEME.muted }}>{s.result}</span>
                <span className="text-right" style={{ color: THEME.gold }}>{s.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===========================================================
   SHELL: sidebar + topbar
=========================================================== */

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: HomeIcon },
  { id: "games", label: "Browse games", icon: Gamepad2 },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "profile", label: "Profile", icon: UserIcon },
];

function Sidebar({ view, setView, mobileOpen, setMobileOpen, achievementsCount }) {
  return (
    <>
      {mobileOpen && (
        <div className="anim-fadein fixed inset-0 bg-black/60 z-20 sm:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className="fixed sm:sticky top-0 left-0 h-screen w-64 flex-shrink-0 border-r flex flex-col z-30 -translate-x-full sm:translate-x-0"
        style={{
          background: THEME.panel,
          borderColor: THEME.panel3,
          transform: mobileOpen ? "translateX(0)" : undefined,
          transition: "transform 0.4s var(--ease-smooth)",
        }}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between px-5 py-5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎮</span>
              <div>
                <p className="font-bold leading-none" style={{ color: THEME.cream }}>GAMING</p>
                <p className="text-xs tracking-wide" style={{ color: THEME.violet }}>PORTAL</p>
              </div>
            </div>
            <button className="sm:hidden" onClick={() => setMobileOpen(false)}>
              <X size={18} color={THEME.muted} />
            </button>
          </div>

          <nav className="relative flex-1 px-3 flex flex-col gap-1 mt-2">
            <div
              className="absolute left-3 right-3 h-11 rounded-xl pointer-events-none"
              style={{
                background: THEME.violet,
                top: `${NAV_ITEMS.findIndex((n) => n.id === view) * 3}rem`,
                transition: "top 0.4s var(--ease-smooth)",
                boxShadow: "0 6px 16px rgba(139,108,246,0.35)",
              }}
            />
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = view === id;
              return (
                <button
                  key={id}
                  onClick={() => { setView(id); setMobileOpen(false); }}
                  className="nav-item relative z-10 flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium"
                  style={{ color: active ? "#fff" : THEME.muted }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = THEME.cream; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = THEME.muted; }}
                >
                  <Icon size={18} />
                  {label}
                  {id === "profile" && achievementsCount > 0 && (
                    <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: THEME.gold, color: THEME.bg }}>
                      {achievementsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4">
            <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: `linear-gradient(135deg, ${THEME.violet}, ${THEME.pink})` }}>
              <p className="text-white font-semibold text-sm">Level up your skills</p>
              <p className="text-white/80 text-xs">Play, win, earn achievements.</p>
              <button onClick={() => { setView("games"); setMobileOpen(false); }} className="btn-press mt-1 bg-white/95 text-xs font-semibold rounded-lg py-2" style={{ color: THEME.violet }}>
                Start playing
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function TopBar({ setMobileOpen, query, setQuery, onSearchFocus, coins, recentScores, user, onViewProfile, onLogout }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 4); }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="topbar-shadow sticky top-0 z-10 flex items-center gap-3 px-4 sm:px-6 py-3 border-b backdrop-blur-md"
      style={{
        borderColor: THEME.panel3,
        background: "rgba(10,14,26,0.85)",
        boxShadow: scrolled ? "0 8px 24px rgba(0,0,0,0.35)" : "none",
      }}>
      <button className="sm:hidden" onClick={() => setMobileOpen(true)}>
        <Menu size={20} color={THEME.cream} />
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative">
          <button onClick={() => { setNotifOpen((v) => !v); setAvatarOpen(false); }}
            className="btn-press relative w-9 h-9 rounded-full flex items-center justify-center border"
            style={{ borderColor: THEME.panel3, background: THEME.panel }}>
            <Bell size={16} color={THEME.cream} />
            {recentScores.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: THEME.pink }} />
            )}
          </button>
          {notifOpen && (
            <div className="anim-popin absolute right-0 mt-2 w-64 rounded-xl border shadow-xl p-2 z-20"
              style={{ borderColor: THEME.panel3, background: THEME.panel2 }}>
              <p className="text-xs px-2 py-1" style={{ color: THEME.muted }}>Recent activity</p>
              {recentScores.length === 0 ? (
                <p className="text-sm px-2 py-2" style={{ color: THEME.muted }}>No games played yet.</p>
              ) : (
                recentScores.slice(0, 3).map((s, i) => (
                  <div key={s.id ?? i} className="px-2 py-1.5 text-sm rounded-lg" style={{ color: THEME.cream }}>
                    {s.game_name} — <span style={{ color: THEME.gold }}>{s.result}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border" style={{ borderColor: THEME.panel3, background: THEME.panel }}>
          <Coins size={14} color={THEME.gold} />
          <span className="text-sm font-semibold" style={{ color: THEME.gold }}>{coins}</span>
        </div>

        <div className="relative">
          <button onClick={() => { setAvatarOpen((v) => !v); setNotifOpen(false); }} className="btn-press flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border"
            style={{ borderColor: THEME.panel3, background: THEME.panel }}>
            <span className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-sm flex-shrink-0" style={{ background: THEME.violet }}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" style={{ display: "block" }} />
              ) : (
                user?.avatar_emoji || "👤"
              )}
            </span>
            <span className="hidden sm:inline text-sm" style={{ color: THEME.cream }}>{user?.display_name || user?.username || "Player"}</span>
            <ChevronDown size={14} color={THEME.muted} />
          </button>
          {avatarOpen && (
            <div className="anim-popin absolute right-0 mt-2 w-44 rounded-xl border shadow-xl p-1 z-20" style={{ borderColor: THEME.panel3, background: THEME.panel2 }}>
              <button onClick={() => { onViewProfile(); setAvatarOpen(false); }} className="btn-press w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/5" style={{ color: THEME.cream }}>
                <UserIcon size={14} /> View profile
              </button>
              <button onClick={onLogout} className="btn-press w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/5" style={{ color: THEME.muted }}>
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ===========================================================
   APP
=========================================================== */

export default function GamingPortal() {
  const { user, token, logout, refreshUser } = useAuth();

  const [view, setView] = useState("home");
  const [activeGame, setActiveGame] = useState(null);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // ─── WebSocket – live profile updates ──────────────────────────────────────
  const wsRef = useRef(null);
  useEffect(() => {
    if (!token) return;
    const WS_BASE = (import.meta.env.VITE_API_URL || "http://localhost:8000")
      .replace(/^http/, "ws");
    const ws = new WebSocket(`${WS_BASE}/ws/profile`);
    wsRef.current = ws;

    ws.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === "profile_update") {
          // Re-fetch profile and /auth/me so user object and stats reflect new avatar, name, and coins
          refreshUser(token);
          if (user?.id) {
            api.getUserStats(user.id, token).then(setStats).catch(() => {});
          }
        }
      } catch { /* ignore bad frames */ }
    };

    ws.onerror = () => {};  // swallow — server might not be running in dev

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [token, refreshUser, user?.id]);

  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [achievementsCatalog, setAchievementsCatalog] = useState([]);
  const [earnedIds, setEarnedIds] = useState(() => new Set());
  const [profileLoading, setProfileLoading] = useState(true);

  // ─── Leaderboard data ───────────────────────────────────────────────────────
  const [leaderboardRows, setLeaderboardRows] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!user || !token) return;
    setProfileLoading(true);
    try {
      // Remove any legacy localStorage adjustment key so backend DB is the sole source of truth
      try { localStorage.removeItem(`coin_adjustment_${user.id}`); } catch {}

      const [statsRes, historyRes, earnedRes] = await Promise.all([
        api.getUserStats(user.id, token),
        api.getMyScores(token),
        api.getMyAchievements(token),
      ]);
      setStats(statsRes);
      setHistory(historyRes);
      setEarnedIds(new Set(earnedRes.map((a) => a.achievement_id)));
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setProfileLoading(false);
    }
  }, [user, token]);

  const loadLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const rows = await api.getLeaderboard({ limit: 50 });
      setLeaderboardRows(rows);
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLeaderboardLoading(false);
    }
  }, []);

  useEffect(() => {
    api.getAchievementsCatalog().then(setAchievementsCatalog).catch((err) => console.error(err));
    loadProfile();
    loadLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const coins = stats?.coins ?? user?.coins ?? 0;
  const achievementsCount = earnedIds.size;

  function goPlay(gameId) {
    setActiveGame(gameId);
    setView("play");
  }

  async function finishGame(gameId, gameName, result) {
    try {
      await api.submitScore(token, {
        game_id: gameId,
        game_name: gameName,
        score: result.score,
        result: result.result,
      });
    } catch (err) {
      console.error("Failed to submit score:", err);
    }

    // Backend DB handles score coins + strategy win bonus (+20 coins) directly in DB
    await Promise.all([loadProfile(), loadLeaderboard(), refreshUser(token)]);
    setView("games");
    setActiveGame(null);
  }

  function goSearch() {
    if (view !== "games") setView("games");
  }

  return (
    <div className="min-h-screen w-full flex" style={{ background: THEME.bg, fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@400;500;600;700;800&display=swap');

        :root { --ease-smooth: cubic-bezier(0.22, 1, 0.36, 1); --ease-quick: cubic-bezier(0.4, 0, 0.2, 1); }
        html { scroll-behavior: smooth; }
        * { scrollbar-width: thin; scrollbar-color: ${THEME.panel3} transparent; }
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${THEME.panel3}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${THEME.violet}; }
        .no-scrollbar { scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }

        button { -webkit-tap-highlight-color: transparent; }

        .btn-press {
          transition: transform 0.35s var(--ease-smooth), box-shadow 0.35s var(--ease-smooth),
            background-color 0.25s var(--ease-quick), border-color 0.25s var(--ease-quick), opacity 0.25s var(--ease-quick);
          will-change: transform;
        }
        .btn-press:hover { transform: translateY(-1.5px); filter: brightness(1.06); }
        .btn-press:active { transform: scale(0.94) translateY(0); transition-duration: 0.1s; }

        .game-card {
          transition: transform 0.45s var(--ease-smooth), box-shadow 0.45s var(--ease-smooth), border-color 0.35s var(--ease-smooth);
          will-change: transform;
        }
        .game-card:hover { transform: translateY(-6px) scale(1.015); box-shadow: 0 18px 34px rgba(0,0,0,0.4); border-color: ${THEME.violet}; }
        .game-card:active { transform: translateY(-2px) scale(0.99); transition-duration: 0.12s; }

        .nav-item {
          transition: color 0.35s var(--ease-smooth), transform 0.3s var(--ease-smooth);
        }
        .nav-item:hover { transform: translateX(2px); }

        .carousel-track { scroll-behavior: smooth; transition: scroll-position 0.5s var(--ease-smooth); }

        .float-anim { display: inline-block; animation: floaty 3.2s var(--ease-smooth) infinite; }
        @keyframes floaty { 0%,100% { transform: translateY(0px);} 50% { transform: translateY(-10px);} }

        .anim-fadein { animation: fadein 0.5s var(--ease-smooth) both; }
        @keyframes fadein { from { opacity: 0; transform: translateY(14px) scale(0.99);} to { opacity: 1; transform: translateY(0) scale(1);} }

        .anim-popin { animation: popin 0.28s var(--ease-smooth) both; transform-origin: top right; }
        @keyframes popin { from { opacity: 0; transform: scale(0.92) translateY(-6px);} to { opacity: 1; transform: scale(1) translateY(0);} }

        .topbar-shadow { transition: box-shadow 0.4s var(--ease-smooth), background-color 0.4s var(--ease-smooth); }

        input, select, textarea { transition: border-color 0.25s var(--ease-quick), box-shadow 0.25s var(--ease-quick); }
        input::placeholder { color: ${THEME.muted}; }

        .flip-card { transition: transform 0.35s var(--ease-smooth), background-color 0.35s var(--ease-smooth); }

        /* ---- score / game-over ---- */
        .score-bump { animation: scoreBump 0.32s var(--ease-smooth) both; }
        @keyframes scoreBump { 0% { transform: scale(1); } 40% { transform: scale(1.35); } 100% { transform: scale(1); } }

        .anim-gameover { animation: gameOverIn 0.5s var(--ease-smooth) both; }
        @keyframes gameOverIn { from { opacity: 0; transform: translateY(10px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .trophy-pop { display: inline-block; animation: trophyPop 0.6s var(--ease-smooth) both 0.1s; }
        @keyframes trophyPop { 0% { transform: scale(0) rotate(-20deg); opacity: 0; } 60% { transform: scale(1.25) rotate(8deg); opacity: 1; } 100% { transform: scale(1) rotate(0); } }
        .confetti-piece { position: absolute; top: -10%; font-size: 1.1rem; animation: confettiFall 1.6s var(--ease-quick) both; opacity: 0; }
        @keyframes confettiFall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 0; } 15% { opacity: 1; } 100% { transform: translateY(160px) rotate(280deg); opacity: 0; } }

        /* ---- tic tac toe ---- */
        .ttt-cell { transition: transform 0.3s var(--ease-smooth), background-color 0.3s var(--ease-smooth), border-color 0.3s var(--ease-smooth), box-shadow 0.3s var(--ease-smooth); }
        .ttt-cell:not(:disabled):hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(0,0,0,0.35); }
        .mark-pop { display: inline-block; animation: markPop 0.32s var(--ease-smooth) both; }
        @keyframes markPop { 0% { transform: scale(0) rotate(-15deg); opacity: 0; } 70% { transform: scale(1.2) rotate(5deg); opacity: 1; } 100% { transform: scale(1) rotate(0); } }
        .turn-dot { position: absolute; top: -4px; right: -4px; width: 9px; height: 9px; border-radius: 50%; animation: turnPulse 1.3s ease-in-out infinite; box-shadow: 0 0 8px currentColor; }
        @keyframes turnPulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }
        .win-strike-wrap { position: absolute; height: 4px; pointer-events: none; }
        .win-strike-bar { display: block; width: 100%; height: 100%; border-radius: 4px; transform-origin: center; animation: strikeIn 0.4s var(--ease-smooth) both; box-shadow: 0 0 10px currentColor; }
        .ttt-board { transition: opacity 0.25s var(--ease-smooth), filter 0.25s var(--ease-smooth); }
        .ttt-board-thinking { opacity: 0.92; }
        .ttt-thinking-dots span { display: inline-block; animation: tttDotBounce 1.1s ease-in-out infinite; }
        .ttt-thinking-dots span:nth-child(2) { animation-delay: 0.15s; }
        .ttt-thinking-dots span:nth-child(3) { animation-delay: 0.3s; }
        @keyframes tttDotBounce { 0%,80%,100% { opacity: 0.3; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-2px); } }
        @keyframes strikeIn { from { transform: scaleX(0); opacity: 0; } to { transform: scaleX(1); opacity: 1; } }

        /* ---- rock paper scissors ---- */
        .rps-choice { transition: transform 0.25s var(--ease-smooth), border-color 0.25s var(--ease-smooth), background-color 0.25s var(--ease-smooth), opacity 0.25s var(--ease-smooth); }
        .rps-choice:not(:disabled):hover { transform: translateY(-3px) scale(1.06); }
        .rps-pump { display: inline-block; animation: rpsPump 0.25s ease-in-out infinite; }
        @keyframes rpsPump { 0%,100% { transform: scale(1) translateY(0); } 50% { transform: scale(1.18) translateY(-8px); } }
        .rps-reveal { display: inline-block; animation: rpsReveal 0.4s var(--ease-smooth) both; }
        @keyframes rpsReveal { 0% { transform: scale(0.4) rotate(-25deg); opacity: 0; } 60% { transform: scale(1.15) rotate(5deg); opacity: 1; } 100% { transform: scale(1) rotate(0); } }
        .rps-zap { animation: rpsZap 0.3s var(--ease-smooth) both; }
        @keyframes rpsZap { 0% { transform: scale(0.5) rotate(-10deg); opacity: 0; } 50% { transform: scale(1.4) rotate(8deg); opacity: 1; } 100% { transform: scale(1.1) rotate(0); opacity: 1; } }
        .rps-chant { animation: rpsChantPop 0.22s var(--ease-smooth) both; }
        @keyframes rpsChantPop { from { opacity: 0; transform: translateY(3px) scale(0.85); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .rps-pip { display: inline-block; transition: background-color 0.25s var(--ease-smooth), border-color 0.25s var(--ease-smooth), transform 0.25s var(--ease-smooth); animation: rpsPipIn 0.3s var(--ease-smooth) both; }
        @keyframes rpsPipIn { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        /* ---- memory match ---- */
        .memory-card-outer { animation: memoryIn 0.4s var(--ease-smooth) both; perspective: 600px; }
        @keyframes memoryIn { from { opacity: 0; transform: translateY(8px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .memory-card-flip { position: relative; transform-style: preserve-3d; transition: transform 0.45s var(--ease-smooth); }
        .memory-card-flip:not(:disabled):hover { transform: rotateY(0deg) translateY(-2px) !important; }
        .memory-face { position: absolute; inset: 0; border-radius: 0.6rem; border: 1px solid; display: flex; align-items: center; justify-content: center; backface-visibility: hidden; transition: box-shadow 0.3s var(--ease-smooth); }
        .memory-face-back { }
        .memory-face-dot { width: 10px; height: 10px; border-radius: 50%; }
        .memory-face-front { transform: rotateY(180deg); }
        .memory-mismatch { animation: memoryMismatch 0.32s var(--ease-smooth); }
        @keyframes memoryMismatch { 0%,100% { transform: rotateY(180deg) translateX(0); } 25% { transform: rotateY(180deg) translateX(-5px); } 75% { transform: rotateY(180deg) translateX(5px); } }
        .memory-match-burst .memory-face-front { animation: memoryMatchBurst 0.5s var(--ease-smooth); }
        @keyframes memoryMatchBurst { 0% { transform: scale(1); } 40% { transform: scale(1.18); } 100% { transform: scale(1); } }

        /* ---- quiz ---- */
        .quiz-progress { transition: width 0.4s var(--ease-smooth); }
        .quiz-slide { animation: quizSlide 0.35s var(--ease-smooth) both; }
        @keyframes quizSlide { from { opacity: 0; transform: translateX(14px); } to { opacity: 1; transform: translateX(0); } }
        .quiz-option { transition: transform 0.2s var(--ease-smooth), border-color 0.25s var(--ease-smooth), background-color 0.25s var(--ease-smooth); }
        .quiz-option:not(:disabled):hover { transform: translateX(3px); }
        .check-pop { display: inline-block; animation: markPop 0.3s var(--ease-smooth) both; font-weight: 800; }

        /* ---- snake ---- */
        .snake-segment { transition: left 0.15s linear, top 0.15s linear; }
        .snake-board { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.03); }
        .snake-head { transition: transform 0.12s linear; }
        .snake-eye { position: absolute; width: 15%; height: 15%; background: #1a1f33; border-radius: 50%; box-shadow: 0 0 0 2px rgba(255,255,255,0.92); }
        .snake-eye-white { position: absolute; width: 24%; height: 24%; background: #fff; border-radius: 50%; box-shadow: 0 1px 2px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(0,0,0,0.06); }
        .snake-pupil { position: absolute; width: 46%; height: 46%; left: 27%; top: 42%; background: #1a1f33; border-radius: 50%; }
        .snake-glint { position: absolute; width: 16%; height: 16%; left: 20%; top: 18%; background: #fff; border-radius: 50%; opacity: 0.9; }
        .snake-nostril { position: absolute; width: 6%; height: 6%; background: rgba(122,74,0,0.55); border-radius: 50%; }
        .snake-smile { position: absolute; left: 32%; top: 46%; width: 36%; height: 18%; border: 2px solid rgba(122,74,0,0.55); border-top: none; border-left: none; border-right: none; border-bottom-left-radius: 60%; border-bottom-right-radius: 60%; }
        .snake-blush { position: absolute; width: 12%; height: 8%; background: radial-gradient(circle, rgba(255,110,110,0.55), transparent 70%); border-radius: 50%; }
        .snake-blink { animation: snakeBlink 4.6s ease-in-out infinite; transform-origin: center; }
        @keyframes snakeBlink { 0%, 92%, 100% { transform: scaleY(1); } 95% { transform: scaleY(0.12); } }
        .snake-chomp { animation: snakeChomp 0.22s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes snakeChomp { 0% { transform: scale(1); } 45% { transform: scale(1.22, 0.82); } 100% { transform: scale(1); } }
        .snake-wiggle { animation: snakeWiggle 0.7s ease-in-out infinite; }
        @keyframes snakeWiggle { 0%, 100% { transform: rotate(-6deg); } 50% { transform: rotate(6deg); } }
        .snake-scale { position: relative; background-blend-mode: overlay; }
        .snake-scale::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background-image: radial-gradient(circle at 28% 22%, rgba(255,255,255,0.35) 0 22%, transparent 24%), radial-gradient(circle at 72% 62%, rgba(0,0,0,0.22) 0 24%, transparent 26%); pointer-events: none; }
        .snake-tongue { position: absolute; left: 50%; top: -16%; width: 7%; height: 20%; transform: translateX(-50%); border-radius: 2px; animation: tongueFlick 0.45s ease-in-out infinite; }
        @keyframes tongueFlick { 0%,100% { transform: translateX(-50%) scaleY(0.55); opacity: 0.7; } 50% { transform: translateX(-50%) scaleY(1); opacity: 1; } }
        .snake-idle-glow { position: absolute; inset: -22%; border-radius: 50%; background: radial-gradient(circle, rgba(63,199,111,0.35), transparent 70%); animation: snakeIdlePulse 1.4s ease-in-out infinite; pointer-events: none; }
        @keyframes snakeIdlePulse { 0%,100% { opacity: 0.4; transform: scale(0.9); } 50% { opacity: 0.85; transform: scale(1.15); } }
        .food-ring { position: absolute; inset: -18%; border-radius: 50%; border: 1.5px solid rgba(63,199,111,0.55); animation: foodRingPulse 1.1s ease-out infinite; }
        @keyframes foodRingPulse { 0% { opacity: 0.7; transform: scale(0.7); } 100% { opacity: 0; transform: scale(1.5); } }
        .food-pop { animation: foodPop 0.9s var(--ease-smooth) infinite; }
        @keyframes foodPop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.18); } }

        /* ---- car race ---- */
        .car-obstacle { will-change: top; }
        .car-player { transition: left 0.18s var(--ease-smooth), transform 0.18s var(--ease-smooth); will-change: left, transform; }
        .road-dash { animation-name: roadDash; animation-timing-function: linear; animation-iteration-count: infinite; will-change: background-position; }
        @keyframes roadDash { from { background-position-y: 0; } to { background-position-y: 28px; } }
        .car-shake { animation: carShake 0.38s var(--ease-smooth); }
        @keyframes carShake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }
        .crash-flash { background: radial-gradient(circle at 50% 85%, rgba(240,85,58,0.55), transparent 65%); animation: crashFlash 0.26s ease-out both; }
        @keyframes crashFlash { 0% { opacity: 0; } 30% { opacity: 1; } 100% { opacity: 0; } }
        .trail-puff { animation: trailFade 0.5s ease-out both; }
        @keyframes trailFade { from { opacity: 0.35; transform: scale(1) translateY(0); } to { opacity: 0; transform: scale(0.4) translateY(10px); } }
        .speed-fill { transition: width 0.25s var(--ease-smooth); }
        .race-start-overlay { animation: raceOverlayIn 0.3s var(--ease-smooth) both; }
        @keyframes raceOverlayIn { from { opacity: 0; } to { opacity: 1; } }
        .race-start-pulse { animation: raceStartPulse 1.4s ease-in-out infinite; }
        @keyframes raceStartPulse { 0%,100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139,108,246,0.35); } 50% { transform: scale(1.08); box-shadow: 0 0 0 10px rgba(139,108,246,0); } }

        /* ---- avatar upload spinner ---- */
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ---- whack-a-mole ---- */
        .mole-hole { transition: transform 0.15s var(--ease-smooth), border-color 0.2s var(--ease-smooth), box-shadow 0.2s var(--ease-smooth); cursor: pointer; }
        .mole-hole:hover { transform: translateY(-1px); }
        .mole-hole:active { transform: scale(0.94); }
        .mole-pop { animation: molePop 0.16s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes molePop { from { opacity: 0; transform: scale(0.3) translateY(35%); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .mole-miss { animation: moleMiss 0.22s var(--ease-smooth); }
        @keyframes moleMiss { 0%,100% { transform: scale(1); } 50% { transform: scale(0.95); } }

        .wam-marker { animation: wamMarkerFloat 0.6s var(--ease-smooth) both; text-shadow: 0 1px 4px rgba(0,0,0,0.6); }
        @keyframes wamMarkerFloat { 0% { opacity: 0; transform: translateY(6px) scale(0.8); } 25% { opacity: 1; transform: translateY(-4px) scale(1.1); } 100% { opacity: 0; transform: translateY(-26px) scale(1); } }

        .wam-bomb-pulse { border-radius: 9999px; animation: wamBombPulse 0.8s ease-in-out infinite; pointer-events: none; }
        @keyframes wamBombPulse { 0%,100% { box-shadow: inset 0 0 0 2px rgba(240,85,58,0.15); } 50% { box-shadow: inset 0 0 0 2px rgba(240,85,58,0.55); } }

        .wam-timebar { transition: width 1s linear, background-color 0.6s var(--ease-smooth); border-radius: 9999px; }

        .wam-countdown-pop { display: inline-block; animation: wamCountdownPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        @keyframes wamCountdownPop { 0% { opacity: 0; transform: scale(0.4); } 60% { opacity: 1; transform: scale(1.15); } 100% { opacity: 1; transform: scale(1); } }

        .wam-combo-banner { animation: wamComboBanner 0.55s var(--ease-smooth) both; box-shadow: 0 4px 14px rgba(255,183,3,0.35); }
        @keyframes wamComboBanner { 0% { opacity: 0; transform: translateY(6px) scale(0.85); } 40% { opacity: 1; transform: translateY(0) scale(1.05); } 100% { opacity: 1; transform: translateY(0) scale(1); } }

        .wam-shake { animation: wamShake 0.32s var(--ease-smooth); }
        @keyframes wamShake { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-6px); } 40% { transform: translateX(5px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(3px); } }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .btn-press, .game-card, .nav-item, .anim-fadein, .anim-popin, .float-anim, .flip-card,
          .score-bump, .anim-gameover, .trophy-pop, .confetti-piece, .ttt-cell, .mark-pop, .turn-dot, .win-strike,
          .rps-choice, .rps-pump, .rps-reveal, .rps-zap, .rps-chant, .rps-pip, .memory-card-outer, .memory-card-flip,
          .memory-mismatch, .memory-match-burst, .quiz-progress, .quiz-slide,
          .quiz-option, .check-pop, .snake-segment, .snake-head, .snake-tongue, .food-pop, .car-obstacle, .car-player, .road-dash,
          .mole-hole, .mole-pop, .mole-miss, .wam-marker, .wam-bomb-pulse, .wam-timebar, .car-shake,
          .wam-countdown-pop, .wam-combo-banner, .wam-shake, .ttt-board, .ttt-thinking-dots span,
          .crash-flash, .trail-puff, .speed-fill, .race-start-overlay, .race-start-pulse,
          .snake-idle-glow, .food-ring, .snake-blink, .snake-chomp, .snake-wiggle { animation: none !important; transition: none !important; }
        }
      `}</style>

      <Sidebar view={view === "play" ? "games" : view} setView={setView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} achievementsCount={achievementsCount} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          setMobileOpen={setMobileOpen}
          query={query}
          setQuery={setQuery}
          onSearchFocus={goSearch}
          coins={coins}
          recentScores={history}
          user={user}
          onViewProfile={() => setView("profile")}
          onLogout={logout}
        />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8">
          <FadeIn viewKey={view + (activeGame || "")}>
            {view === "home" && <HomePage onNavigateGames={() => setView("games")} onNavigateLeaderboard={() => setView("leaderboard")} onPlay={goPlay} coins={coins} />}
            {view === "games" && <GamesPage onPlay={goPlay} query={query} setQuery={setQuery} />}
            {view === "play" && activeGame && <GamePage gameId={activeGame} onFinish={finishGame} onBack={() => setView("games")} />}
            {view === "leaderboard" && <LeaderboardPage rows={leaderboardRows} loading={leaderboardLoading} currentUserId={user?.id} onPlay={goPlay} />}
            {view === "profile" && (
              <ProfilePage
                user={user}
                stats={stats}
                setStats={setStats}
                achievementsCatalog={achievementsCatalog}
                earnedIds={earnedIds}
                history={history}
                loading={profileLoading}
              />
            )}
          </FadeIn>
        </main>
      </div>
    </div>
  );
}
