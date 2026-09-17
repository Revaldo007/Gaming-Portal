import React, { useState, useEffect, useRef, useCallback } from "react";
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
  ArrowUp,
  ArrowDown,
  AlertCircle,
} from "lucide-react";

/* ===========================================================
   THEME
=========================================================== */

const THEME = {
  bg: "#0A0E1A",
  panel: "#12172A",
  panel2: "#1A2138",
  panel3: "#232C4A",
  gold: "#FFB703",
  violet: "#8B6CF6",
  pink: "#F5478C",
  cream: "#F1EFFB",
  muted: "#8892B3",
  green: "#5FD98A",
};

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

/* ===========================================================
   STATIC DATA
=========================================================== */

const GAMES = [
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
  },
  {
    id: "whackamole",
    name: "Whack-a-Mole",
    emoji: "🔨",
    category: "Arcade",
    difficulty: "Medium",
    rating: 4.5,
    badge: "New",
    blurb: "Moles pop up fast — tap them before they duck back down. 30 seconds on the clock.",
    gradient: "linear-gradient(135deg,#4A3B1F,#1B1710)",
  },
];

const COMING_SOON = [
  { id: "cs1", name: "Math Challenge", emoji: "🔢", category: "Puzzle" },
  { id: "cs2", name: "Simple Pong", emoji: "🏓", category: "Arcade" },
  { id: "cs3", name: "Word Scramble", emoji: "🔤", category: "Quiz" },
  { id: "cs4", name: "2048 Merge", emoji: "🟨", category: "Puzzle" },
];

const CATEGORIES = ["All", "Arcade", "Puzzle", "Quiz", "Strategy", "Casual"];

const SEED_LEADERBOARD = [
  { player: "Rahul", game: "snake", score: 950 },
  { player: "Arun", game: "snake", score: 870 },
  { player: "Akhil", game: "snake", score: 820 },
  { player: "Meera", game: "tictactoe", score: 6 },
  { player: "John", game: "tictactoe", score: 5 },
  { player: "Divya", game: "memory", score: 780 },
  { player: "Alex", game: "memory", score: 640 },
  { player: "Sara", game: "quiz", score: 5 },
  { player: "Kiran", game: "quiz", score: 4 },
  { player: "Priya", game: "rps", score: 3 },
];

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

const ACHIEVEMENT_DEFS = [
  { id: "first_game", name: "First Game", icon: "🏆", test: (s) => s.length >= 1 },
  { id: "first_win", name: "First Win", icon: "⭐", test: (s) => s.some((r) => r.result === "Won") },
  { id: "five_games", name: "5 Games Played", icon: "🔥", test: (s) => s.length >= 5 },
  { id: "high_scorer", name: "Score 500+", icon: "💯", test: (s) => s.some((r) => r.score >= 500) },
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
  return (
    <button
      onClick={() => onPlay(game.id)}
      className="game-card group text-left rounded-2xl overflow-hidden border flex-shrink-0"
      style={{
        borderColor: THEME.panel3,
        background: THEME.panel,
        width: wide ? "min(88vw, 260px)" : "100%",
      }}
    >
      <div
        className="relative flex items-center justify-center h-32"
        style={{ background: game.gradient }}
      >
        <span className="text-5xl transition-transform duration-300 group-hover:scale-110">{game.emoji}</span>
        {game.badge && (
          <span
            className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full"
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
          className="mt-1 text-center text-xs font-medium rounded-lg py-1.5 transition-colors"
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

function TicTacToe({ onFinish }) {
  const empty = Array(9).fill(null);
  const [board, setBoard] = useState(empty);
  const [turn, setTurn] = useState("X");
  const [winner, setWinner] = useState(null);
  const [winLine, setWinLine] = useState(null);
  const [wins, setWins] = useState({ X: 0, O: 0 });

  const LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  function checkWinner(b) {
    for (const line of LINES) {
      const [a, c, d] = line;
      if (b[a] && b[a] === b[c] && b[a] === b[d]) return { who: b[a], line };
    }
    if (b.every(Boolean)) return { who: "draw", line: null };
    return null;
  }

  function place(i) {
    if (board[i] || winner) return;
    const next = [...board];
    next[i] = turn;
    setBoard(next);
    const result = checkWinner(next);
    if (result) {
      setWinLine(result.line);
      setTimeout(() => setWinner(result.who), result.line ? 550 : 0);
      if (result.who !== "draw") setWins((w) => ({ ...w, [result.who]: w[result.who] + 1 }));
    } else {
      setTurn(turn === "X" ? "O" : "X");
    }
  }

  function reset() {
    setBoard(empty);
    setTurn("X");
    setWinner(null);
    setWinLine(null);
  }

  function finishSession() {
    onFinish({
      score: wins.X + wins.O === 0 ? 0 : Math.max(wins.X, wins.O),
      result: wins.X === wins.O ? "Draw" : wins.X > wins.O ? "Won" : "Lost",
    });
  }

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

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4">
        <div className="relative">
          <ScorePanel score={wins.X} label="Player X" />
          {!winner && turn === "X" && <span className="turn-dot" style={{ background: THEME.pink }} />}
        </div>
        <div className="relative">
          <ScorePanel score={wins.O} label="Player O" />
          {!winner && turn === "O" && <span className="turn-dot" style={{ background: THEME.gold }} />}
        </div>
      </div>
      {!winner ? (
        <>
          <p style={{ color: THEME.muted }}>
            Turn: <span style={{ color: turn === "X" ? THEME.pink : THEME.gold, fontWeight: 600 }}>{turn}</span>
          </p>
          <div className="relative grid grid-cols-3 gap-2 p-2 rounded-2xl" style={{ background: THEME.panel, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)" }}>
            {board.map((cell, i) => {
              const onWinLine = winLine && winLine.includes(i);
              return (
                <button key={i} onClick={() => place(i)} disabled={!!cell || !!winner}
                  className="ttt-cell btn-press w-20 h-20 sm:w-24 sm:h-24 rounded-xl border text-4xl font-bold flex items-center justify-center"
                  style={{
                    borderColor: onWinLine ? THEME.gold : THEME.panel3,
                    background: onWinLine ? "rgba(255,183,3,0.12)" : THEME.panel2,
                    color: cell === "X" ? THEME.pink : THEME.gold,
                    cursor: cell || winner ? "default" : "pointer",
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
        <GameOverPanel title={winner === "draw" ? "Draw" : `${winner} wins the round`}
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

function RPS({ onFinish }) {
  const CHOICES = [
    { id: "rock", emoji: "🪨" },
    { id: "paper", emoji: "📄" },
    { id: "scissors", emoji: "✂️" },
  ];
  const [player, setPlayer] = useState(null);
  const [cpu, setCpu] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [score, setScore] = useState({ w: 0, l: 0, d: 0 });
  const [over, setOver] = useState(false);
  const [clashing, setClashing] = useState(false);
  const [picked, setPicked] = useState(null);

  function beats(a, b) {
    return (a === "rock" && b === "scissors") || (a === "paper" && b === "rock") || (a === "scissors" && b === "paper");
  }

  function play(choiceId) {
    if (over || clashing) return;
    setPicked(choiceId);
    setOutcome(null);
    setClashing(true);
    const cpuChoice = CHOICES[Math.floor(Math.random() * 3)].id;
    setTimeout(() => {
      setPlayer(choiceId);
      setCpu(cpuChoice);
      let result;
      if (choiceId === cpuChoice) result = "draw";
      else if (beats(choiceId, cpuChoice)) result = "win";
      else result = "lose";
      setOutcome(result);
      setClashing(false);
      setPicked(null);
      setScore((s) => {
        const next = {
          w: s.w + (result === "win" ? 1 : 0),
          l: s.l + (result === "lose" ? 1 : 0),
          d: s.d + (result === "draw" ? 1 : 0),
        };
        if (next.w === 3 || next.l === 3) setOver(true);
        return next;
      });
    }, 500);
  }

  function reset() {
    setPlayer(null); setCpu(null); setOutcome(null); setScore({ w: 0, l: 0, d: 0 }); setOver(false); setClashing(false); setPicked(null);
  }

  function finishSession() {
    onFinish({ score: score.w, result: score.w > score.l ? "Won" : score.w < score.l ? "Lost" : "Draw" });
  }

  const resultColor = outcome === "win" ? THEME.green : outcome === "lose" ? THEME.pink : THEME.muted;

  return (
    <div className="flex flex-col items-center gap-6">
      <ScorePanel score={`${score.w} – ${score.l} – ${score.d}`} label="Win – Lose – Draw" />
      {!over ? (
        <>
          <div className="flex items-center gap-6 text-5xl h-16">
            <span
              className={clashing ? "rps-shake" : outcome ? "rps-reveal" : ""}
              style={{ filter: outcome === "win" ? `drop-shadow(0 0 14px ${THEME.green})` : "none" }}
            >
              {clashing ? "✊" : player ? CHOICES.find((c) => c.id === player).emoji : "❓"}
            </span>
            <span style={{ color: THEME.muted, fontSize: "1.1rem" }}>vs</span>
            <span
              className={clashing ? "rps-shake" : outcome ? "rps-reveal" : ""}
              style={{
                animationDelay: clashing ? "0.08s" : "0.08s",
                filter: outcome === "lose" ? `drop-shadow(0 0 14px ${THEME.pink})` : "none",
              }}
            >
              {clashing ? "✊" : cpu ? CHOICES.find((c) => c.id === cpu).emoji : "❓"}
            </span>
          </div>
          <p className="text-sm h-5" style={{ color: resultColor, fontWeight: 600 }}>
            {clashing ? "Shoot…" : outcome === "win" ? "You won that round!" : outcome === "lose" ? "House takes it." : outcome === "draw" ? "Draw — go again." : "\u00A0"}
          </p>
          <div className="flex gap-4">
            {CHOICES.map((c) => (
              <button key={c.id} onClick={() => play(c.id)} disabled={clashing}
                className="rps-choice btn-press w-16 h-16 rounded-full text-3xl flex items-center justify-center border"
                style={{
                  borderColor: picked === c.id ? THEME.pink : THEME.gold,
                  background: picked === c.id ? "rgba(245,71,140,0.15)" : THEME.panel2,
                  opacity: clashing && picked !== c.id ? 0.4 : 1,
                }}>
                {c.emoji}
              </button>
            ))}
          </div>
          <p className="text-xs" style={{ color: THEME.muted }}>First to 3 wins ends the match.</p>
        </>
      ) : (
        <GameOverPanel title={score.w > score.l ? "You beat the house" : "House wins this time"}
          detail={`Final tally — ${score.w} wins, ${score.l} losses, ${score.d} draws.`} onReplay={reset} onBack={finishSession} />
      )}
    </div>
  );
}

function Memory({ onFinish }) {
  const ICONS = ["🍎", "🍋", "🍇", "🍒", "🍉", "🍓"];
  const buildDeck = () =>
    [...ICONS, ...ICONS].map((icon, i) => ({ id: i, icon, flipped: false, matched: false })).sort(() => Math.random() - 0.5);

  const [deck, setDeck] = useState(buildDeck);
  const [selected, setSelected] = useState([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  const allMatched = deck.every((c) => c.matched);
  const score = allMatched ? Math.max(1000 - moves * 40, 100) : 0;

  function flip(i) {
    if (locked || deck[i].flipped || deck[i].matched || selected.length === 2) return;
    const next = [...deck];
    next[i].flipped = true;
    setDeck(next);
    const nextSelected = [...selected, i];
    setSelected(nextSelected);
    if (nextSelected.length === 2) {
      setLocked(true);
      setMoves((m) => m + 1);
      const [a, b] = nextSelected;
      setTimeout(() => {
        setDeck((cur) => {
          const copy = [...cur];
          if (copy[a].icon === copy[b].icon) { copy[a].matched = true; copy[b].matched = true; }
          else { copy[a].flipped = false; copy[b].flipped = false; }
          return copy;
        });
        setSelected([]);
        setLocked(false);
      }, 700);
    }
  }

  function reset() {
    setDeck(buildDeck()); setSelected([]); setMoves(0); setLocked(false);
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4">
        <ScorePanel score={moves} label="Moves" />
        {allMatched && <ScorePanel score={score} label="Score" />}
      </div>
      {!allMatched ? (
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {deck.map((card, i) => {
            const shown = card.flipped || card.matched;
            return (
              <div key={card.id} className="memory-card-outer" style={{ animationDelay: `${i * 0.035}s` }}>
                <button
                  onClick={() => flip(i)}
                  disabled={shown}
                  className="btn-press w-14 h-14 sm:w-16 sm:h-16 memory-card-flip"
                  style={{ transform: shown ? "rotateY(180deg)" : "rotateY(0deg)", background: "transparent", border: "none", padding: 0, cursor: shown ? "default" : "pointer" }}
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
      ) : (
        <GameOverPanel title="All matched" detail={`Cleared the board in ${moves} moves.`} onReplay={reset}
          onBack={() => onFinish({ score, result: "Won" })} />
      )}
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
  const [snake, setSnake] = useState(START);
  const [food, setFood] = useState({ x: 9, y: 6 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const dirRef = useRef(dir);
  dirRef.current = dir;
  const score = snake.length - 1;

  const placeFood = useCallback((body) => {
    let pos;
    do { pos = { x: Math.floor(Math.random() * SIZE), y: Math.floor(Math.random() * SIZE) }; }
    while (body.some((s) => s.x === pos.x && s.y === pos.y));
    return pos;
  }, []);

  useEffect(() => {
    function onKey(e) {
      const map = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
      const next = map[e.key];
      if (!next) return;
      e.preventDefault();
      const cur = dirRef.current;
      if (cur.x + next.x === 0 && cur.y + next.y === 0) return;
      setDir(next);
      if (!running && !over) setRunning(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, over]);

  useEffect(() => {
    if (!running || over) return;
    const id = setInterval(() => {
      setSnake((cur) => {
        const head = { x: cur[0].x + dirRef.current.x, y: cur[0].y + dirRef.current.y };
        const hitWall = head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE;
        const hitSelf = cur.some((s) => s.x === head.x && s.y === head.y);
        if (hitWall || hitSelf) { setOver(true); setRunning(false); return cur; }
        const ateFood = head.x === food.x && head.y === food.y;
        const newBody = [head, ...cur];
        if (ateFood) setFood(placeFood(newBody)); else newBody.pop();
        return newBody;
      });
    }, 160);
    return () => clearInterval(id);
  }, [running, over, food, placeFood]);

  function reset() { setSnake(START); setFood({ x: 9, y: 6 }); setDir({ x: 1, y: 0 }); setOver(false); setRunning(false); }

  return (
    <div className="flex flex-col items-center gap-4">
      <ScorePanel score={score} label="Length" />
      {!over ? (
        <>
          <div className="relative border rounded-xl overflow-hidden snake-board" style={{
            width: "min(90vw, 380px)", aspectRatio: "1 / 1",
            borderColor: THEME.panel3,
            background: `${THEME.panel2}`,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)`,
            backgroundSize: `${100 / SIZE}% ${100 / SIZE}%`,
          }}>
            {snake.map((s, i) => {
              const isHead = i === 0;
              const t = snake.length > 1 ? i / (snake.length - 1) : 0;
              const bodyColor = lerpColor(THEME.gold, THEME.green, Math.min(1, t * 1.3));
              const scale = isHead ? 1 : Math.max(0.72, 1 - (i / snake.length) * 0.4);
              return (
                <div
                  key={i}
                  className="absolute snake-segment"
                  style={{
                    width: `${100 / SIZE}%`,
                    height: `${100 / SIZE}%`,
                    left: `${(s.x * 100) / SIZE}%`,
                    top: `${(s.y * 100) / SIZE}%`,
                    padding: "1.5px",
                    zIndex: isHead ? snake.length + 1 : snake.length - i,
                  }}
                >
                  {isHead ? (
                    <div
                      className="snake-head"
                      style={{
                        width: "100%", height: "100%",
                        transform: `rotate(${dir.x === 1 ? 90 : dir.x === -1 ? -90 : dir.y === 1 ? 180 : 0}deg)`,
                      }}
                    >
                      <div style={{
                        position: "relative", width: "100%", height: "100%", borderRadius: "45% 45% 30% 30%",
                        background: `linear-gradient(180deg, #FFD873, ${THEME.gold})`,
                        boxShadow: `0 0 10px ${THEME.gold}`,
                      }}>
                        <span className="snake-eye" style={{ left: "20%", top: "22%" }} />
                        <span className="snake-eye" style={{ right: "20%", top: "22%" }} />
                        {running && <span className="snake-tongue" style={{ background: THEME.pink }} />}
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      width: "100%", height: "100%",
                      transform: `scale(${scale})`,
                      borderRadius: "32%",
                      background: bodyColor,
                      boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.15)",
                    }} />
                  )}
                </div>
              );
            })}
            <div
              key={`${food.x}-${food.y}`}
              className="absolute food-pop"
              style={{
                width: `${100 / SIZE}%`,
                height: `${100 / SIZE}%`,
                left: `${(food.x * 100) / SIZE}%`,
                top: `${(food.y * 100) / SIZE}%`,
                padding: "3px",
              }}
            >
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: THEME.green, boxShadow: `0 0 8px ${THEME.green}` }} />
            </div>
          </div>
          {!running && <p className="text-sm" style={{ color: THEME.muted }}>Press an arrow key to start moving.</p>}
        </>
      ) : (
        <GameOverPanel title="Game over" detail={`You grew the snake to a length of ${score + 1}.`} onReplay={reset}
          onBack={() => onFinish({ score, result: "Won" })} />
      )}
    </div>
  );
}

function CarRace({ onFinish }) {
  const LANES = 3;
  const ROWS = 9;
  const CAR_ROW = ROWS - 1;
  const [lane, setLane] = useState(1);
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const laneRef = useRef(lane);
  laneRef.current = lane;
  const tickRef = useRef(0);

  useEffect(() => {
    function onKey(e) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      if (!running && !over) setRunning(true);
      setLane((l) => {
        if (e.key === "ArrowLeft") return Math.max(0, l - 1);
        return Math.min(LANES - 1, l + 1);
      });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, over]);

  useEffect(() => {
    if (!running || over) return;
    const speed = Math.max(150, 340 - Math.floor(score / 5) * 20);
    const id = setInterval(() => {
      tickRef.current += 1;
      setObstacles((cur) => {
        const moved = cur.map((o) => ({ ...o, row: o.row + 1 }));
        const survived = moved.filter((o) => o.row < ROWS);
        const passed = moved.length - survived.length;
        if (passed > 0) setScore((s) => s + passed);

        const hit = survived.some((o) => o.row === CAR_ROW && o.lane === laneRef.current);
        if (hit) {
          setOver(true);
          setRunning(false);
          return survived;
        }

        if (tickRef.current % 2 === 0 && Math.random() < 0.75) {
          const newLane = Math.floor(Math.random() * LANES);
          survived.push({ id: Math.random(), lane: newLane, row: 0 });
        }
        return survived;
      });
    }, speed);
    return () => clearInterval(id);
  }, [running, over, score]);

  function reset() {
    setLane(1);
    setObstacles([]);
    setScore(0);
    setOver(false);
    setRunning(false);
    tickRef.current = 0;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <ScorePanel score={score} label="Distance" />
      {!over ? (
        <>
          <div
            className="relative overflow-hidden rounded-xl border road-scroll"
            style={{
              width: "min(78vw, 300px)",
              height: "min(96vw, 640px)",
              borderColor: THEME.panel3,
              background: THEME.panel,
            }}
          >
            {/* lane dividers */}
            {Array.from({ length: LANES - 1 }).map((_, i) => (
              <div key={i} className="absolute top-0 bottom-0" style={{ left: `${((i + 1) * 100) / LANES}%`, width: "1px", background: THEME.panel3 }} />
            ))}
            {/* scrolling road dashes per lane */}
            {Array.from({ length: LANES }).map((_, l) => (
              <div key={l} className="absolute top-0 bottom-0 road-dash" style={{
                left: `${(l * 100) / LANES + 100 / LANES / 2}%`,
                width: "2px",
                transform: "translateX(-50%)",
                backgroundImage: `repeating-linear-gradient(180deg, ${THEME.panel3} 0px, ${THEME.panel3} 14px, transparent 14px, transparent 28px)`,
              }} />
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
                <CarSVG id={`rival-${o.id}`} palette="red" flipped />
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
              }}
            >
              <CarSVG id="car-player" palette="violet" />
            </div>
          </div>
          {!running && <p className="text-sm" style={{ color: THEME.muted }}>Press ← or → to start racing.</p>}
        </>
      ) : (
        <GameOverPanel title="Crashed" detail={`You made it ${score} obstacles down the road.`} onReplay={reset}
          onBack={() => onFinish({ score, result: "Won" })} />
      )}
    </div>
  );
}

const MOLE_HOLES = 9;
const WHACK_DURATION = 30;

function WhackAMole({ onFinish }) {
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(WHACK_DURATION);
  const [activeHole, setActiveHole] = useState(null);
  const [whacked, setWhacked] = useState(null);
  const [missPop, setMissPop] = useState(null);
  const moleTimerRef = useRef(null);
  const countdownRef = useRef(null);

  const spawnMole = useCallback(() => {
    setActiveHole((prev) => {
      let next = Math.floor(Math.random() * MOLE_HOLES);
      if (MOLE_HOLES > 1 && next === prev) next = (next + 1) % MOLE_HOLES;
      return next;
    });
    setWhacked(null);
  }, []);

  useEffect(() => {
    if (!running) return;
    // Moles get a bit faster as time runs out.
    const speed = Math.max(500, 950 - (WHACK_DURATION - timeLeft) * 15);
    spawnMole();
    moleTimerRef.current = setInterval(spawnMole, speed);
    return () => clearInterval(moleTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  useEffect(() => {
    if (!running) return;
    countdownRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(countdownRef.current);
          clearInterval(moleTimerRef.current);
          setRunning(false);
          setActiveHole(null);
          setOver(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [running]);

  function start() {
    setScore(0);
    setTimeLeft(WHACK_DURATION);
    setOver(false);
    setActiveHole(null);
    setWhacked(null);
    setRunning(true);
  }

  function reset() {
    clearInterval(moleTimerRef.current);
    clearInterval(countdownRef.current);
    setScore(0);
    setTimeLeft(WHACK_DURATION);
    setOver(false);
    setRunning(false);
    setActiveHole(null);
    setWhacked(null);
  }

  function whack(i) {
    if (!running || i !== activeHole) return;
    setScore((s) => s + 10);
    setWhacked(i);
    setActiveHole(null);
  }

  function missClick(i) {
    if (!running || i === activeHole) return;
    setMissPop(i);
    setTimeout(() => setMissPop(null), 220);
  }

  if (over) {
    return (
      <GameOverPanel
        title={`Whacked ${score / 10} mole${score / 10 === 1 ? "" : "s"}`}
        detail={`Final score: ${score} points.`}
        onReplay={reset}
        onBack={() => onFinish({ score, result: score > 0 ? "Won" : "Lost" })}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm">
      <div className="flex items-center gap-3">
        <ScorePanel score={score} label="Score" />
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border"
          style={{ borderColor: THEME.panel3, background: `linear-gradient(180deg, ${THEME.panel2}, ${THEME.panel})` }}
        >
          <span className="text-xs uppercase tracking-wide" style={{ color: THEME.muted, letterSpacing: "0.06em" }}>
            Time
          </span>
          <span style={{ fontFamily: "'Press Start 2P', monospace", color: timeLeft <= 5 ? THEME.pink : THEME.cream, fontSize: "1rem" }}>
            {timeLeft}s
          </span>
        </div>
      </div>

      {!running ? (
        <>
          <p className="text-center text-sm" style={{ color: THEME.muted }}>
            Tap a mole the instant it pops up. Miss holes cost nothing, but hesitate and it ducks.
          </p>
          <button onClick={start} className="btn-press flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold"
            style={{ background: THEME.violet, color: "#fff" }}>
            <Play size={16} /> Start
          </button>
        </>
      ) : (
        <div className="grid grid-cols-3 gap-3 w-full">
          {Array.from({ length: MOLE_HOLES }).map((_, i) => {
            const isUp = i === activeHole;
            const justWhacked = i === whacked;
            return (
              <button
                key={i}
                onClick={() => (isUp ? whack(i) : missClick(i))}
                className={`mole-hole relative rounded-full overflow-hidden ${missPop === i ? "mole-miss" : ""}`}
                style={{
                  aspectRatio: "1 / 1",
                  background: `radial-gradient(circle at 50% 40%, ${THEME.panel3}, #0D1120 70%)`,
                  border: `1px solid ${THEME.panel3}`,
                }}
              >
                <div className="absolute inset-x-0 bottom-0" style={{ height: "38%", background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.55))" }} />
                {isUp && (
                  <span className="mole-pop absolute inset-0 flex items-center justify-center text-4xl select-none">
                    🐹
                  </span>
                )}
                {justWhacked && (
                  <span className="mole-whacked-mark absolute inset-0 flex items-center justify-center text-3xl select-none">
                    💥
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
        <button onClick={onNavigateLeaderboard} className="btn-press px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2"
          style={{ background: "#fff", color: THEME.violet }}>
          View leaderboard <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

function GamesPage({ onPlay, query, setQuery }) {
  const [category, setCategory] = useState("All");
  const filtered = GAMES.filter((g) => (category === "All" || g.category === category) && g.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold" style={{ color: THEME.cream }}>All games</h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 flex-1" style={{ borderColor: THEME.panel3, background: THEME.panel }}>
          <Search size={16} color={THEME.muted} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search games…"
            className="bg-transparent outline-none flex-1 text-sm" style={{ color: THEME.cream }} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className="btn-press text-xs px-3 py-2 rounded-lg border"
              style={{
                borderColor: category === c ? THEME.violet : THEME.panel3,
                color: category === c ? THEME.cream : THEME.muted,
                background: category === c ? THEME.violet : THEME.panel,
              }}>
              {c}
            </button>
          ))}
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
  const componentMap = { tictactoe: TicTacToe, rps: RPS, memory: Memory, quiz: Quiz, snake: Snake, carrace: CarRace, whackamole: WhackAMole };
  const GameComponent = componentMap[gameId];

  return (
    <div className="flex flex-col gap-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm w-fit" style={{ color: THEME.muted }}>
        <ArrowLeft size={16} /> Back to games
      </button>
      <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: THEME.cream }}>
        <span className="text-2xl">{game.emoji}</span> {game.name}
      </h2>
      <div className="rounded-2xl border p-6 flex items-center justify-center" style={{ borderColor: THEME.panel3, background: THEME.panel, minHeight: "380px" }}>
        <GameComponent onFinish={(result) => onFinish(gameId, game.name, result)} />
      </div>
    </div>
  );
}

function LeaderboardPage({ scores }) {
  const [gameFilter, setGameFilter] = useState("all");
  const combined = [
    ...SEED_LEADERBOARD.map((r) => ({ ...r, mine: false })),
    ...scores.map((r) => ({ player: "You", game: r.game, score: r.score, mine: true })),
  ];
  const filtered = combined.filter((r) => gameFilter === "all" || r.game === gameFilter).sort((a, b) => b.score - a.score).slice(0, 10);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: THEME.cream }}>
        <Trophy size={20} color={THEME.gold} /> Leaderboard
      </h2>
      <div className="flex gap-2 flex-wrap">
        {["all", ...GAMES.map((g) => g.id)].map((id) => (
          <button key={id} onClick={() => setGameFilter(id)} className="btn-press text-xs px-3 py-2 rounded-lg border"
            style={{
              borderColor: gameFilter === id ? THEME.violet : THEME.panel3,
              color: gameFilter === id ? THEME.cream : THEME.muted,
              background: gameFilter === id ? THEME.violet : THEME.panel,
            }}>
            {id === "all" ? "All games" : GAMES.find((g) => g.id === id).name}
          </button>
        ))}
      </div>
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: THEME.panel3 }}>
        {filtered.map((row, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 text-sm transition-colors"
            style={{ background: row.mine ? "rgba(255,183,3,0.08)" : i % 2 === 0 ? THEME.panel : THEME.panel2, color: THEME.cream }}>
            <div className="flex items-center gap-3">
              <span className="w-6 text-center">{medals[i] || i + 1}</span>
              <span style={{ color: row.mine ? THEME.gold : THEME.cream }}>{row.player}</span>
              <span className="text-xs" style={{ color: THEME.muted }}>{GAMES.find((g) => g.id === row.game)?.name}</span>
            </div>
            <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: "0.8rem", color: THEME.gold }}>{row.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage({ scores, coins }) {
  const played = scores.length;
  const won = scores.filter((s) => s.result === "Won").length;
  const lost = scores.filter((s) => s.result === "Lost").length;
  const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
  const favorite = played === 0 ? "—" : Object.entries(
    scores.reduce((acc, s) => { acc[s.gameName] = (acc[s.gameName] || 0) + 1; return acc; }, {})
  ).sort((a, b) => b[1] - a[1])[0][0];
  const earned = ACHIEVEMENT_DEFS.filter((a) => a.test(scores));

  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: THEME.cream }}>
        <UserIcon size={20} /> Profile
      </h2>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2" style={{ borderColor: THEME.violet, background: THEME.panel }}>👤</div>
        <div>
          <p className="font-semibold" style={{ color: THEME.cream }}>Player One</p>
          <p className="text-sm" style={{ color: THEME.muted }}>Favorite game: {favorite}</p>
          <p className="text-sm flex items-center gap-1 mt-1" style={{ color: THEME.gold }}><Coins size={14} /> {coins} coins</p>
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
          {ACHIEVEMENT_DEFS.map((a) => {
            const has = earned.includes(a);
            return (
              <div key={a.id} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm"
                style={{ borderColor: has ? THEME.gold : THEME.panel3, background: THEME.panel, color: has ? THEME.cream : THEME.muted, opacity: has ? 1 : 0.5 }}>
                <span>{a.icon}</span> {a.name}
              </div>
            );
          })}
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3" style={{ color: THEME.cream }}>Game history</h3>
        {played === 0 ? (
          <p className="text-sm" style={{ color: THEME.muted }}>No games played yet — head to the games page to get on the board.</p>
        ) : (
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: THEME.panel3 }}>
            {scores.slice().reverse().map((s, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 text-sm" style={{ background: i % 2 === 0 ? THEME.panel : THEME.panel2, color: THEME.cream }}>
                <span>{s.gameName}</span>
                <span style={{ color: THEME.muted }}>{s.date}</span>
                <span style={{ color: s.result === "Won" ? THEME.green : s.result === "Lost" ? THEME.pink : THEME.muted }}>{s.result}</span>
                <span style={{ color: THEME.gold }}>{s.score}</span>
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

function TopBar({ setMobileOpen, query, setQuery, onSearchFocus, coins, recentScores }) {
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

      <div className="flex items-center gap-2 rounded-xl border px-3 py-2 flex-1 max-w-md"
        style={{ borderColor: THEME.panel3, background: THEME.panel }}>
        <Search size={16} color={THEME.muted} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={onSearchFocus}
          placeholder="Search games, categories…"
          className="bg-transparent outline-none flex-1 text-sm"
          style={{ color: THEME.cream }}
        />
      </div>

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
                recentScores.slice(-3).reverse().map((s, i) => (
                  <div key={i} className="px-2 py-1.5 text-sm rounded-lg" style={{ color: THEME.cream }}>
                    {s.gameName} — <span style={{ color: THEME.gold }}>{s.result}</span>
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
            <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{ background: THEME.violet }}>👤</span>
            <span className="hidden sm:inline text-sm" style={{ color: THEME.cream }}>Player One</span>
            <ChevronDown size={14} color={THEME.muted} />
          </button>
          {avatarOpen && (
            <div className="anim-popin absolute right-0 mt-2 w-44 rounded-xl border shadow-xl p-1 z-20" style={{ borderColor: THEME.panel3, background: THEME.panel2 }}>
              <button className="btn-press w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/5" style={{ color: THEME.cream }}>
                <UserIcon size={14} /> View profile
              </button>
              <button className="btn-press w-full text-left flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-white/5" style={{ color: THEME.muted }}>
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
  const [view, setView] = useState("home");
  const [activeGame, setActiveGame] = useState(null);
  const [scores, setScores] = useState([]);
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const coins = 120 + scores.reduce((sum, s) => sum + Math.round(s.score / 5), 0);
  const achievementsCount = ACHIEVEMENT_DEFS.filter((a) => a.test(scores)).length;

  function goPlay(gameId) {
    setActiveGame(gameId);
    setView("play");
  }

  function finishGame(gameId, gameName, result) {
    setScores((prev) => [...prev, { game: gameId, gameName, score: result.score, result: result.result, date: new Date().toLocaleDateString() }]);
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
        @keyframes strikeIn { from { transform: scaleX(0); opacity: 0; } to { transform: scaleX(1); opacity: 1; } }

        /* ---- rock paper scissors ---- */
        .rps-choice { transition: transform 0.25s var(--ease-smooth), border-color 0.25s var(--ease-smooth), background-color 0.25s var(--ease-smooth), opacity 0.25s var(--ease-smooth); }
        .rps-choice:not(:disabled):hover { transform: translateY(-3px) scale(1.06); }
        .rps-shake { display: inline-block; animation: rpsShake 0.5s var(--ease-smooth) infinite; }
        @keyframes rpsShake { 0%,100% { transform: rotate(0deg) translateY(0); } 25% { transform: rotate(-12deg) translateY(-4px); } 75% { transform: rotate(12deg) translateY(-4px); } }
        .rps-reveal { display: inline-block; animation: rpsReveal 0.4s var(--ease-smooth) both; }
        @keyframes rpsReveal { 0% { transform: scale(0.4) rotate(-25deg); opacity: 0; } 60% { transform: scale(1.15) rotate(5deg); opacity: 1; } 100% { transform: scale(1) rotate(0); } }

        /* ---- memory match ---- */
        .memory-card-outer { animation: memoryIn 0.4s var(--ease-smooth) both; perspective: 600px; }
        @keyframes memoryIn { from { opacity: 0; transform: translateY(8px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .memory-card-flip { position: relative; transform-style: preserve-3d; transition: transform 0.45s var(--ease-smooth); }
        .memory-card-flip:not(:disabled):hover { transform: rotateY(0deg) translateY(-2px) !important; }
        .memory-face { position: absolute; inset: 0; border-radius: 0.6rem; border: 1px solid; display: flex; align-items: center; justify-content: center; backface-visibility: hidden; transition: box-shadow 0.3s var(--ease-smooth); }
        .memory-face-back { }
        .memory-face-dot { width: 10px; height: 10px; border-radius: 50%; }
        .memory-face-front { transform: rotateY(180deg); }

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
        .snake-tongue { position: absolute; left: 50%; top: -16%; width: 7%; height: 20%; transform: translateX(-50%); border-radius: 2px; animation: tongueFlick 0.45s ease-in-out infinite; }
        @keyframes tongueFlick { 0%,100% { transform: translateX(-50%) scaleY(0.55); opacity: 0.7; } 50% { transform: translateX(-50%) scaleY(1); opacity: 1; } }
        .food-pop { animation: foodPop 0.9s var(--ease-smooth) infinite; }
        @keyframes foodPop { 0%,100% { transform: scale(1); } 50% { transform: scale(1.18); } }

        /* ---- car race ---- */
        .car-obstacle { transition: left 0.16s linear, top 0.16s linear; }
        .car-player { transition: left 0.16s var(--ease-smooth); }
        .road-dash { animation: roadDash 0.5s linear infinite; }
        @keyframes roadDash { from { background-position-y: 0; } to { background-position-y: 28px; } }

        /* ---- whack-a-mole ---- */
        .mole-hole { transition: transform 0.15s var(--ease-smooth), border-color 0.2s var(--ease-smooth); cursor: pointer; }
        .mole-hole:hover { transform: translateY(-1px); }
        .mole-hole:active { transform: scale(0.96); }
        .mole-pop { animation: molePop 0.18s var(--ease-smooth) both; }
        @keyframes molePop { from { opacity: 0; transform: scale(0.4) translateY(30%); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .mole-whacked-mark { animation: moleWhack 0.35s var(--ease-smooth) both; }
        @keyframes moleWhack { 0% { opacity: 0; transform: scale(0.5) rotate(-10deg); } 50% { opacity: 1; transform: scale(1.3) rotate(6deg); } 100% { opacity: 0; transform: scale(1) rotate(0); } }
        .mole-miss { animation: moleMiss 0.22s var(--ease-smooth); }
        @keyframes moleMiss { 0%,100% { transform: scale(1); } 50% { transform: scale(0.95); } }

        @media (prefers-reduced-motion: reduce) {
          html { scroll-behavior: auto; }
          .btn-press, .game-card, .nav-item, .anim-fadein, .anim-popin, .float-anim, .flip-card,
          .score-bump, .anim-gameover, .trophy-pop, .confetti-piece, .ttt-cell, .mark-pop, .turn-dot, .win-strike,
          .rps-choice, .rps-shake, .rps-reveal, .memory-card-outer, .memory-card-flip, .quiz-progress, .quiz-slide,
          .quiz-option, .check-pop, .snake-segment, .snake-head, .snake-tongue, .food-pop, .car-obstacle, .car-player, .road-dash,
          .mole-hole, .mole-pop, .mole-whacked-mark, .mole-miss { animation: none !important; transition: none !important; }
        }
      `}</style>

      <Sidebar view={view === "play" ? "games" : view} setView={setView} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} achievementsCount={achievementsCount} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar setMobileOpen={setMobileOpen} query={query} setQuery={setQuery} onSearchFocus={goSearch} coins={coins} recentScores={scores} />
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8">
          <FadeIn viewKey={view + (activeGame || "")}>
            {view === "home" && <HomePage onNavigateGames={() => setView("games")} onNavigateLeaderboard={() => setView("leaderboard")} onPlay={goPlay} coins={coins} />}
            {view === "games" && <GamesPage onPlay={goPlay} query={query} setQuery={setQuery} />}
            {view === "play" && activeGame && <GamePage gameId={activeGame} onFinish={finishGame} onBack={() => setView("games")} />}
            {view === "leaderboard" && <LeaderboardPage scores={scores} />}
            {view === "profile" && <ProfilePage scores={scores} coins={coins} />}
          </FadeIn>
        </main>
      </div>
    </div>
  );
}
