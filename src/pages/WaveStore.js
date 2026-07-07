import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { FiX, FiZap, FiAward, FiClock, FiStar, FiShoppingBag, FiTrendingUp, FiDroplet, FiHexagon, FiMoon, FiSun, FiShield, FiCheck } from "react-icons/fi";
import { StoreCardSkeleton, StorePowerUpSkeleton } from "../components/Skeleton";

function formatPoints(p) {
  const n = parseInt(p) || 0;
  return n.toLocaleString();
}

function timeRemaining(expiresAt) {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

const previews = {
  glassmorphism: {
    icon: FiDroplet,
    gradient: "from-white/30 to-white/5",
    border: "border-white/40",
    bg: "backdrop-blur-xl",
  },
  matrix: {
    icon: FiHexagon,
    gradient: "from-green-400/20 to-black/60",
    border: "border-green-500/40",
    bg: "bg-black/80",
  },
  holographic: {
    icon: FiStar,
    gradient: "from-pink-300/30 via-purple-300/30 to-cyan-300/30",
    border: "border-purple-300/50",
    bg: "animate-pulse",
  },
  vantablack: {
    icon: FiMoon,
    gradient: "from-zinc-900 to-black",
    border: "border-zinc-800",
    bg: "bg-black",
  },
};

function ItemPreview({ slug }) {
  const matched = Object.keys(previews).find((k) => slug?.includes(k));
  const p = previews[matched];
  const Icon = p?.icon || FiZap;

  if (slug?.includes("frame")) {
    const isRed = slug?.includes("red");
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className={`w-14 h-14 rounded-full border-[3px] ${isRed ? "border-amber-400" : "border-blue-400"} bg-gradient-to-br from-slate-100 to-slate-200 dark:from-zinc-600 dark:to-zinc-700 flex items-center justify-center`}
          style={{ boxShadow: isRed ? "0 0 20px rgba(250,204,21,0.4)" : "0 0 20px rgba(59,130,246,0.4)" }}
        >
          <FiAward className={`${isRed ? "text-amber-400" : "text-blue-400"}`} size={20} />
        </div>
      </div>
    );
  }

  if (slug === "profile-glow") {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-purple-500/30">
          ✦ Glow ✦
        </div>
      </div>
    );
  }

  if (p) {
    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient} ${p.bg} ${p.border} border rounded-xl flex items-center justify-center`}>
        <Icon className="text-white/70" size={28} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{slug}</span>
    </div>
  );
}

const rarityConfig = {
  common: { label: "Common", cls: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
  rare: { label: "Rare", cls: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300" },
  epic: { label: "Epic", cls: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  legendary: { label: "Legendary", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  mythic: { label: "Mythic", cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" },
};

function detectRarity(slug) {
  if (slug?.includes("glassmorphism")) return rarityConfig.rare;
  if (slug?.includes("matrix")) return rarityConfig.epic;
  if (slug?.includes("holographic")) return rarityConfig.legendary;
  if (slug?.includes("vantablack")) return rarityConfig.mythic;
  return rarityConfig.common;
}

function RarityBadge({ slug }) {
  const r = detectRarity(slug);
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider ${r.cls}`}>
      <FiStar size={10} />
      {r.label}
    </span>
  );
}

const categoryConfig = {
  social_glows: {
    label: "Social Glows",
    tag: "Chat Skins",
    gradient: "from-rose-500 to-pink-600",
    lightBg: "bg-rose-50 dark:bg-rose-950/30",
    accent: "border-l-rose-400 dark:border-l-rose-600",
    icon: FiSun,
    cardBorder: "hover:border-rose-300 dark:hover:border-rose-700",
  },
  digital_flex: {
    label: "Digital Flex",
    tag: "Profile",
    gradient: "from-slate-700 to-slate-900",
    lightBg: "bg-slate-50 dark:bg-slate-900/30",
    accent: "border-l-slate-400 dark:border-l-slate-600",
    icon: FiTrendingUp,
    cardBorder: "hover:border-slate-300 dark:hover:border-slate-600",
  },
  power_ups: {
    label: "Power-Ups",
    tag: "Utility",
    gradient: "from-emerald-500 to-teal-600",
    lightBg: "bg-emerald-50 dark:bg-emerald-950/30",
    accent: "border-l-emerald-400 dark:border-l-emerald-600",
    icon: FiZap,
    cardBorder: "hover:border-emerald-300 dark:hover:border-emerald-700",
  },
  message_skins: {
    label: "Message Skins",
    tag: "Chat",
    gradient: "from-teal-500 to-cyan-600",
    lightBg: "bg-teal-50 dark:bg-teal-950/30",
    accent: "border-l-teal-400 dark:border-l-teal-600",
    icon: FiShield,
    cardBorder: "hover:border-teal-300 dark:hover:border-teal-700",
  },
};

function PointsCard({ balance }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-400/10 dark:to-amber-500/5 border border-amber-200/60 dark:border-amber-700/30 p-5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 dark:bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <p className="text-[11px] uppercase tracking-widest font-semibold text-amber-600/70 dark:text-amber-400/70 mb-1">Balance</p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-black text-amber-700 dark:text-amber-300">{formatPoints(balance)}</span>
        <span className="text-lg">🌊</span>
      </div>
      <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-600/60 dark:text-amber-400/60">
        <FiTrendingUp size={12} />
        <span>Earn more by creating</span>
      </div>
    </div>
  );
}

function FlipCard({ item, category, onPurchase, purchasing }) {
  const cat = categoryConfig[category] || {};
  const isPowerUp = category === "power_ups";
  const owned = item.owned;
  const remaining = timeRemaining(item.expires_at);
  const isPermanent = owned && !item.expires_at;

  if (isPowerUp) {
    return (
      <div className={`group relative overflow-hidden rounded-2xl border ${owned ? "border-emerald-400/60 dark:border-emerald-500/40 bg-gradient-to-br from-emerald-100/80 to-emerald-50/80 dark:from-emerald-900/30 dark:to-emerald-950/30" : "border-emerald-200/60 dark:border-emerald-800/40 bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-zinc-800/80"} p-5 transition-all duration-300 hover:shadow-lg ${cat.cardBorder}`}>
        <div className="flex gap-4 items-start">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${owned ? "from-emerald-300 to-emerald-500" : "from-emerald-400 to-emerald-600"} flex items-center justify-center text-white shadow-lg shrink-0`}>
            {item.item_slug?.includes("bottle") ? "🍾" : "🚀"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-emerald-900 dark:text-emerald-100 text-sm">{item.item_name}</h3>
              {owned && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                  <FiCheck size={9} /> Owned
                </span>
              )}
            </div>
            <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
              <FiClock size={11} />
              {item.duration || "Instant"}
            </p>
            {owned && !isPermanent && remaining && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
                Expires in {remaining}
              </p>
            )}
            <p className="text-xs text-emerald-500/70 dark:text-emerald-400/70 mt-1 line-clamp-2">{item.description}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-lg font-black text-emerald-700 dark:text-emerald-300">{owned ? "—" : item.worth} {!owned && <span className="text-sm">🌊</span>}</div>
            {!owned && (
              <button
                onClick={() => onPurchase(item)}
                disabled={purchasing === item.id}
                className="mt-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all"
              >
                {purchasing === item.id ? "..." : "Buy"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative overflow-hidden rounded-2xl border ${owned ? "border-emerald-300/60 dark:border-emerald-600/50 bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-900/20 dark:to-zinc-800/60" : "border-zinc-200/60 dark:border-zinc-700/60 bg-white dark:bg-zinc-800/80"} transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${cat.cardBorder}`}>
      <div className={`relative h-32 ${owned ? "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-950/30" : "bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900"} border-b ${owned ? "border-emerald-200/50 dark:border-emerald-700/30" : "border-zinc-100 dark:border-zinc-700/50"} overflow-hidden`}>
        {owned && (
          <div className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-400/5 z-10 flex items-center justify-center">
            <div className="bg-emerald-500/20 dark:bg-emerald-400/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border border-emerald-400/30 dark:border-emerald-500/30">
              <FiCheck className="text-emerald-600 dark:text-emerald-400" size={18} />
              <span className="text-emerald-700 dark:text-emerald-300 font-bold text-sm uppercase tracking-wider">Owned</span>
            </div>
          </div>
        )}
        <ItemPreview slug={item.item_slug} name={item.item_name} />
        <div className="absolute top-2 right-2 z-20">
          <RarityBadge slug={item.item_slug} />
        </div>
        <div className="absolute bottom-2 left-3 z-20">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider bg-white/60 dark:bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-sm">
            {item.item_slug?.replace(/-/g, " ")}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-zinc-800 dark:text-white text-sm truncate">{item.item_name}</h3>
        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
          <FiClock size={11} />
          <span>{isPermanent ? "Permanent" : item.duration || "Permanent"}</span>
        </div>

        {owned && !isPermanent && remaining && (
          <div className="mt-2 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-700/30 rounded-lg">
            <p className="text-[10px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <FiClock size={10} />
              Expires in {remaining}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-700/50">
          <div className="flex items-baseline gap-1">
            {owned ? (
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Owned</span>
            ) : (
              <>
                <span className="text-lg font-black text-zinc-800 dark:text-white">{item.worth}</span>
                <span className="text-xs text-zinc-400">🌊</span>
              </>
            )}
          </div>
          {!owned && (
            <button
              onClick={() => onPurchase(item)}
              disabled={purchasing === item.id}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                category === "digital_flex"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100"
                  : "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 shadow-md shadow-rose-200/50 dark:shadow-rose-900/20"
              }`}
            >
              {purchasing === item.id ? (
                <span className="flex items-center gap-1"><span className="animate-spin">⟳</span>Buying</span>
              ) : (
                <span className="flex items-center gap-1.5"><FiShoppingBag size={13} /> Buy</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function WaveStore() {
  const { user } = useAuth();
  const [, setItems] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [pointsBalance, setPointsBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);
  const [flash, setFlash] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/store/items");
        const d = res.data.data;
        setItems(d.items);
        setPointsBalance(d.points_balance);
        const g = {};
        (d.items || []).forEach((item) => {
          const cat = item.category || "other";
          if (!g[cat]) g[cat] = [];
          g[cat].push(item);
        });
        setGrouped(g);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handlePurchase = async (item) => {
    setPurchasing(item.id);
    setFlash(null);
    try {
      const res = await api.post("/store/purchase", { id: item.id });
      const d = res.data.data;
      setPointsBalance(d.points_balance);
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, owned: true } : i)));
      setGrouped((prev) => {
        const next = {};
        Object.entries(prev).forEach(([cat, catItems]) => {
          next[cat] = catItems.map((i) => (i.id === item.id ? { ...i, owned: true } : i));
        });
        return next;
      });
      setFlash({ type: "success", message: d.message || "Item purchased!" });
      if (item.item_slug === "profile-glow") {
        window.location.href = "/settings?glow=1";
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Purchase failed. Try again.";
      setFlash({ type: "error", message: msg });
    }
    setPurchasing(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-12 mb-5 animate-pulse" />
          <div className="h-44 bg-gray-200 dark:bg-gray-700 rounded-3xl mb-8 animate-pulse" />
          <div className="space-y-6">
            {[1, 2, 3].map((section) => (
              <div key={section}>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4 animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((i) => (
                    section === 2 ? <StorePowerUpSkeleton key={i} /> : <StoreCardSkeleton key={i} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8">
        <Link
          to={user ? `/profile/${user.username}` : "/feed"}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors group mb-5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 dark:from-black dark:via-zinc-900 dark:to-black mb-8">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="relative px-6 sm:px-10 py-8 sm:py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                  <FiShoppingBag className="text-white" size={16} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Wave Store</h1>
              </div>
              <p className="text-zinc-400 text-sm max-w-xs">
                Exchange your energy for exclusive items and profile upgrades.
              </p>
            </div>
            <PointsCard balance={pointsBalance} />
          </div>
        </div>

        {flash && (
          <div className={`mb-6 px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-3 ${
            flash.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
          }`}>
            <span className="flex-1">{flash.message}</span>
            <button onClick={() => setFlash(null)} className="shrink-0 opacity-60 hover:opacity-100">
              <FiX size={16} />
            </button>
          </div>
        )}

        {Object.entries(grouped).length === 0 && !loading && (
          <div className="text-center py-20">
            <FiShoppingBag className="mx-auto text-zinc-300 dark:text-zinc-600 mb-4" size={40} />
            <p className="text-zinc-400 text-lg font-medium">No items available yet</p>
            <p className="text-zinc-400/60 text-sm mt-1">Check back soon for new drops.</p>
          </div>
        )}

        <div className="space-y-10">
          {Object.entries(grouped).map(([cat, catItems]) => {
            const meta = categoryConfig[cat] || { label: cat, tag: "", lightBg: "", accent: "border-l-zinc-300", icon: FiZap };

            return (
              <section key={cat}>
                <div className={`flex items-center gap-3 mb-5 px-4 py-3 rounded-xl ${meta.lightBg} border-l-4 ${meta.accent}`}>
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-sm`}>
                    <meta.icon className="text-white" size={15} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-zinc-800 dark:text-white">{meta.label}</h2>
                    {meta.tag && (
                      <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{meta.tag}</span>
                    )}
                  </div>
                </div>

                <div className={`grid gap-4 ${cat === "power_ups" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
                  {catItems.map((item) => (
                    <FlipCard
                      key={item.id}
                      item={item}
                      category={cat}
                      onPurchase={handlePurchase}
                      purchasing={purchasing}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
