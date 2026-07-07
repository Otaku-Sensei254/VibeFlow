import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiGlobe, FiZap, FiMessageCircle, FiUsers } from "react-icons/fi";

const phrases = [
  "where conversation flows",
  "where voices meet",
  "where moments ripple",
  "where trends are born",
];

const letters = "VIBEFLOW";

const floatingIcons = [
  { icon: "💬", x: "5%", y: "15%", delay: "0s", dur: "6s" },
  { icon: "🌊", x: "90%", y: "20%", delay: "1s", dur: "7s" },
  { icon: "⚡", x: "10%", y: "75%", delay: "2s", dur: "5s" },
  { icon: "🎵", x: "85%", y: "80%", delay: "0.5s", dur: "8s" },
  { icon: "✨", x: "50%", y: "5%", delay: "1.5s", dur: "6s" },
  { icon: "🔥", x: "95%", y: "50%", delay: "3s", dur: "7s" },
  { icon: "💫", x: "3%", y: "50%", delay: "2.5s", dur: "5s" },
  { icon: "🎨", x: "40%", y: "92%", delay: "0.8s", dur: "6s" },
];

function LetterReveal() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    if (visible < letters.length) {
      const t = setTimeout(() => setVisible((v) => v + 1), 80);
      return () => clearTimeout(t);
    }
  }, [visible]);

  return (
    <span className="inline-block">
      {letters.split("").map((l, i) => (
        <span
          key={i}
          className="inline-block transition-all duration-300"
          style={{
            opacity: i < visible ? 1 : 0,
            transform: i < visible ? "translateY(0)" : "translateY(20px)",
            filter: i < visible ? "blur(0)" : "blur(6px)",
          }}
        >
          {l}
        </span>
      ))}
    </span>
  );
}

function BlinkingBar() {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(t);
  }, []);
  return <span className="inline-block w-[3px] h-[0.8em] bg-white/70 ml-1 align-middle" style={{ opacity: on ? 1 : 0 }} />;
}

function MarqueePhrases() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % phrases.length);
        setFade(true);
      }, 500);
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  return (
    <span
      className="inline-block transition-all duration-500"
      style={{
        opacity: fade ? 1 : 0,
        transform: fade ? "translateY(0)" : "translateY(8px)",
      }}
    >
      {phrases[idx]}
    </span>
  );
}

function FloatingIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingIcons.map((item, i) => (
        <span
          key={i}
          className="absolute text-lg select-none"
          style={{
            left: item.x,
            top: item.y,
            opacity: 0.15,
            animation: `drift ${item.dur} ease-in-out infinite`,
            animationDelay: item.delay,
          }}
        >
          {item.icon}
        </span>
      ))}
    </div>
  );
}

function MockupCards() {
  const cards = [
    { emoji: "🌍", name: "alex", text: "Just landed in Tokyo! The energy here is unreal 🔥", likes: "1.2k", time: "2m" },
    { emoji: "🎨", name: "maya", text: "New mural finished downtown. Art is freedom ✨", likes: "3.4k", time: "8m" },
    { emoji: "🎵", name: "kaito", text: "Dropping a new beat tonight. Stay tuned 🎧", likes: "892", time: "15m" },
  ];

  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div className="absolute -inset-4 bg-gradient-to-r from-tide-500/10 via-flow-500/10 to-coral-500/10 rounded-3xl blur-3xl" />
      <div className="relative space-y-3">
        {cards.map((card, i) => (
          <div
            key={i}
            className="group bg-white/[0.04] backdrop-blur-xl rounded-2xl border border-white/[0.06] p-4 hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-300"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tide-500/40 to-flow-500/40 flex items-center justify-center text-sm">
                {card.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white/80 truncate">@{card.name}</p>
              </div>
              <span className="text-[10px] text-zinc-600">{card.time}</span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">{card.text}</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-600">
              <span>{card.likes} likes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GlowOrb() {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div className="w-[600px] h-[600px] rounded-full bg-gradient-to-br from-tide-500/15 via-flow-500/10 to-transparent blur-[120px]" />
    </div>
  );
}

function GridBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

function useMouseGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = useCallback((e) => {
    setPos({ x: e.clientX, y: e.clientY });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [handleMove]);

  return pos;
}

const features = [
  { icon: FiGlobe, label: "Global", desc: "Connect worldwide" },
  { icon: FiZap, label: "Real-Time", desc: "Instant updates" },
  { icon: FiMessageCircle, label: "Chat", desc: "Live conversations" },
  { icon: FiUsers, label: "Community", desc: "Find your people" },
];

export default function Home() {
  const { user } = useAuth();
  const mouse = useMouseGlow();

  return (
    <div className="min-h-screen bg-zinc-950 overflow-hidden relative selection:bg-tide-500/30">
      <style>{`
        @keyframes drift {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(10px, -15px) rotate(2deg); }
          50% { transform: translate(-5px, -25px) rotate(-1deg); }
          75% { transform: translate(-15px, -10px) rotate(1deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.1); }
          50% { box-shadow: 0 0 60px rgba(236,72,153,0.2); }
        }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
      `}</style>

      <GridBg />
      <FloatingIcons />

      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-tide-500/10 blur-[100px] pointer-events-none transition-all duration-700"
        style={{
          left: `calc(50% + ${(mouse.x - window.innerWidth / 2) * 0.02}px)`,
          top: `calc(50% + ${(mouse.y - window.innerHeight / 2) * 0.02}px)`,
        }}
      />

      <GlowOrb />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-20 sm:pt-28 pb-16 min-h-screen flex flex-col justify-center">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] font-mono text-zinc-500 tracking-widest uppercase mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/70 animate-pulse" />
              <span>now live &mdash; v2.0</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none mb-4 select-none">
              <LetterReveal />
              <BlinkingBar />
            </h1>

            <p className="text-base sm:text-lg text-zinc-500 font-light mb-8 h-7">
              <MarqueePhrases />
            </p>

            {user ? (
              <Link
                to="/feed"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-200 transition-all duration-300 tracking-wide animate-pulse-glow"
              >
                enter feed
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link
                  to="/feed"
                  className="px-7 py-3 rounded-xl bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-200 transition-all duration-300 tracking-wide animate-pulse-glow"
                >
                  join the current
                </Link>
                <Link
                  to="/login"
                  className="px-7 py-3 rounded-xl border border-white/20 text-white/80 text-sm font-medium hover:bg-white/10 hover:border-white/40 transition-all duration-300 tracking-wide"
                >
                  sign in
                </Link>
              </div>
            )}

            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                {["🎨", "🎵", "🌍", "⚡"].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs border-2 border-zinc-950 shadow-sm">
                    {e}
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-600">
                <span className="font-semibold text-zinc-400">12k+</span> creators active
              </p>
            </div>
          </div>

          <div className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <MockupCards />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-20 max-w-3xl mx-auto w-full animate-slide-up" style={{ animationDelay: "0.5s" }}>
          {features.map((item, i) => (
            <div
              key={i}
              className="group p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-300 text-center"
            >
              <div className="w-9 h-9 mx-auto mb-2.5 rounded-xl bg-white/[0.06] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <item.icon className="text-white/50" size={16} />
              </div>
              <h3 className="text-xs font-semibold text-white/70 mb-0.5">{item.label}</h3>
              <p className="text-[10px] text-zinc-600">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center animate-slide-up" style={{ animationDelay: "0.7s" }}>
          <p className="text-[11px] text-zinc-600 font-mono tracking-wider uppercase">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-zinc-600" />
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <span className="mx-4">|</span>
            <Link to="/terms" className="hover:text-zinc-400 transition-colors">terms</Link>
            <span className="mx-3">·</span>
            <Link to="/privacy" className="hover:text-zinc-400 transition-colors">privacy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}