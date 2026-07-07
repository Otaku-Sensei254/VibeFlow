import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiZap, FiGlobe, FiLock, FiMessageCircle, FiTrendingUp, FiUsers, FiArrowRight } from "react-icons/fi";

const words = ["Connect", "Create", "Share", "Inspire"];
const floatingIcons = [
  { icon: "💬", x: "10%", y: "20%", size: "text-xl", delay: "0s", duration: "6s" },
  { icon: "🌊", x: "80%", y: "15%", size: "text-2xl", delay: "1s", duration: "7s" },
  { icon: "⚡", x: "15%", y: "70%", size: "text-lg", delay: "2s", duration: "5s" },
  { icon: "🎵", x: "75%", y: "75%", size: "text-xl", delay: "0.5s", duration: "8s" },
  { icon: "✨", x: "50%", y: "10%", size: "text-sm", delay: "1.5s", duration: "6s" },
  { icon: "🔥", x: "85%", y: "50%", size: "text-lg", delay: "3s", duration: "7s" },
  { icon: "💫", x: "5%", y: "45%", size: "text-base", delay: "2.5s", duration: "5s" },
  { icon: "🎨", x: "45%", y: "85%", size: "text-lg", delay: "0.8s", duration: "6s" },
];

function AnimatedText() {
  const [index, setIndex] = useState(0);
  const [display, setDisplay] = useState(words[0]);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setFade(true);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDisplay(words[index]);
  }, [index]);

  return (
    <span
      className={`inline-block transition-all duration-500 ${
        fade ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      }`}
    >
      {display}
    </span>
  );
}

function FloatingIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {floatingIcons.map((item, i) => (
        <span
          key={i}
          className={`absolute ${item.size} animate-float`}
          style={{
            left: item.x,
            top: item.y,
            animationDelay: item.delay,
            animationDuration: item.duration,
            opacity: 0.35,
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
    <div className="relative w-full max-w-sm mx-auto lg:mx-0">
      <div className="absolute -inset-4 bg-gradient-to-r from-tide-500/20 via-flow-500/20 to-coral-500/20 rounded-3xl blur-3xl" />
      <div className="relative space-y-3">
        {cards.map((card, i) => (
          <div
            key={i}
            className="group bg-white/80 dark:bg-zinc-800/80 backdrop-blur-xl rounded-2xl border border-white/40 dark:border-zinc-700/40 p-4 shadow-xl shadow-black/5 hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tide-400 to-flow-500 flex items-center justify-center text-sm shadow-lg">
                {card.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-800 dark:text-white truncate">@{card.name}</p>
              </div>
              <span className="text-[10px] text-zinc-400">{card.time}</span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">{card.text}</p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-400">
              <FiTrendingUp size={12} className="text-coral-400" />
              <span>{card.likes} likes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-tide-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900 overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(3deg); }
          66% { transform: translateY(6px) rotate(-2deg); }
        }
        .animate-float { animation: float var(--dur, 6s) ease-in-out infinite; }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up { animation: slideUp 0.6s ease-out forwards; opacity: 0; }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient { background-size: 200% 200%; animation: gradientShift 4s ease infinite; }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99,102,241,0.15); }
          50% { box-shadow: 0 0 40px rgba(236,72,153,0.25); }
        }
        .animate-glow { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      <FloatingIcons />

      <div className="relative max-w-6xl mx-auto px-4 pt-16 sm:pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left animate-slide-up" style={{animationDelay: "0.1s"}}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-tide-500/10 to-flow-500/10 dark:from-tide-400/10 dark:to-flow-400/10 rounded-full text-xs font-semibold text-tide-600 dark:text-tide-400 border border-tide-200/50 dark:border-tide-700/50 mb-8 animate-glow">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Live — {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4">
              <span className="bg-gradient-to-r from-tide-600 via-flow-500 to-coral-500 bg-clip-text text-transparent animate-gradient">
                <AnimatedText />
              </span>
              <br />
              <span className="text-zinc-800 dark:text-white">Your World,</span>
              <br />
              <span className="bg-gradient-to-r from-coral-500 via-flow-500 to-tide-600 bg-clip-text text-transparent animate-gradient">
                Real-Time
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
              Vibeflow is where moments become waves. Share what moves you, connect with voices that matter, and ride the current of real conversation.
            </p>

            {user ? (
              <Link
                to="/feed"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-tide-600 to-flow-600 text-white px-8 py-3.5 rounded-xl font-bold hover:from-tide-700 hover:to-flow-700 transition-all duration-200 shadow-xl shadow-tide-500/25 hover:shadow-tide-500/40 animate-glow"
              >
                View Feed
                <FiArrowRight size={18} />
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-tide-600 to-flow-600 text-white px-8 py-3.5 rounded-xl font-bold hover:from-tide-700 hover:to-flow-700 transition-all duration-200 shadow-xl shadow-tide-500/25 hover:shadow-tide-500/40 animate-glow"
                >
                  Join Vibeflow
                  <FiZap size={18} />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 border-2 border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 px-8 py-3.5 rounded-xl font-semibold hover:border-tide-400 dark:hover:border-tide-500 hover:text-tide-600 dark:hover:text-tide-400 transition-all duration-200 bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm"
                >
                  Sign In
                </Link>
              </div>
            )}

            <div className="flex items-center gap-6 mt-8 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {["🎨", "🎵", "🌍", "⚡"].map((e, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-tide-200 to-flow-200 dark:from-zinc-700 dark:to-zinc-600 flex items-center justify-center text-xs border-2 border-white dark:border-zinc-800 shadow-sm">
                    {e}
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-400">
                <span className="font-semibold text-zinc-600 dark:text-zinc-300">12k+</span> creators active
              </p>
            </div>
          </div>

          <div className="animate-slide-up" style={{animationDelay: "0.3s"}}>
            <MockupCards />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-20 max-w-4xl mx-auto animate-slide-up" style={{animationDelay: "0.5s"}}>
          {[
            { icon: FiGlobe, label: "Global Reach", desc: "Connect worldwide", color: "from-tide-500 to-flow-500" },
            { icon: FiZap, label: "Real-Time", desc: "Instant updates", color: "from-flow-500 to-coral-500" },
            { icon: FiMessageCircle, label: "Chat", desc: "Live conversations", color: "from-coral-500 to-sun-500" },
            { icon: FiUsers, label: "Community", desc: "Find your people", color: "from-sun-500 to-tide-500" },
          ].map((item, i) => (
            <div
              key={i}
              className="group p-4 sm:p-5 rounded-2xl bg-white/60 dark:bg-zinc-800/60 backdrop-blur border border-zinc-100 dark:border-zinc-700/50 hover:border-tide-200 dark:hover:border-tide-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center"
            >
              <div className={`w-10 h-10 mx-auto mb-3 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg shadow-black/5 group-hover:scale-110 transition-transform duration-300`}>
                <item.icon className="text-white" size={18} />
              </div>
              <h3 className="text-sm font-bold text-zinc-800 dark:text-white mb-0.5">{item.label}</h3>
              <p className="text-[11px] text-zinc-400">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center animate-slide-up" style={{animationDelay: "0.7s"}}>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            By using Vibeflow, you agree to our{" "}
            <Link to="/terms" className="text-tide-600 hover:underline font-medium">Terms of Service</Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-tide-600 hover:underline font-medium">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}