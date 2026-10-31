import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import pumpkinHat from "../../components/images/pumkin-hat.png";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { halloweenEnabled, halloweenThemeLoading, setHalloweenEnabled } = useTheme();
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [themeSaving, setThemeSaving] = useState(false);
  const [themeError, setThemeError] = useState("");

  const toggleHalloweenTheme = async () => {
    setThemeSaving(true);
    setThemeError("");
    try {
      await setHalloweenEnabled(!halloweenEnabled);
    } catch (err) {
      setThemeError(err?.response?.data?.error || "Could not update the seasonal theme.");
    } finally {
      setThemeSaving(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/admin/stats");
        setStats(res.data.data.stats);
        setCategories(res.data.data.categories || []);
        setTags(res.data.data.tags || []);
        setLoading(false);
      } catch (err) {
        console.error("Admin dashboard fetch failed:", err);
        setError(err?.response?.data?.error || err?.message || "Failed to load stats");
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">System Overview</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Admin control center and live content pulse.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200">
              Welcome, {user?.username}
            </div>
            <Link
              to={`/profile/${user?.username}`}
              className="text-xs font-semibold text-tide-600 dark:text-tide-400 hover:underline"
            >
              &larr; Back to Profile
            </Link>
          </div>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-orange-200/80 dark:border-orange-900/40 bg-gradient-to-r from-orange-50 via-white to-violet-50 dark:from-orange-950/20 dark:via-zinc-900 dark:to-violet-950/20 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <img src={pumpkinHat} alt="" aria-hidden="true" className="h-12 w-12 shrink-0 object-contain" />
            <div>
              <h2 className="font-bold text-gray-900 dark:text-gray-100">Halloween atmosphere</h2>
              <p className="mt-1 max-w-xl text-sm text-gray-600 dark:text-gray-400">
                {halloweenEnabled
                  ? "Bats, cobwebs, and seasonal ember glow are showing across VibeFlow."
                  : "The seasonal decorations are currently hidden for everyone."}
              </p>
              {themeError && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{themeError}</p>}
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={halloweenEnabled}
            onClick={toggleHalloweenTheme}
            disabled={halloweenThemeLoading || themeSaving}
            className={`inline-flex min-w-40 items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
              halloweenEnabled
                ? "bg-orange-600 text-white hover:bg-orange-700"
                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700"
            }`}
          >
            <span>{themeSaving ? "Saving…" : halloweenEnabled ? "Theme on" : "Theme off"}</span>
            <span className={`relative h-5 w-9 rounded-full transition ${halloweenEnabled ? "bg-orange-300/50" : "bg-gray-300 dark:bg-zinc-600"}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${halloweenEnabled ? "translate-x-4" : "translate-x-0.5"}`} />
            </span>
          </button>
        </div>
      </section>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 rounded-full border-[3px] border-tide-100 dark:border-tide-900/30 border-t-tide-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-200 dark:border-red-900/50 mt-8 py-12 text-center bg-red-50/50 dark:bg-red-900/10">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-200/80 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase font-semibold tracking-wider text-gray-500 dark:text-gray-400">Total Users</div>
                <div className="w-8 h-8 rounded-lg bg-tide-50 dark:bg-tide-900/30 text-tide-600 dark:text-tide-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-gray-100">{stats?.total_users ?? 0}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-200/80 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase font-semibold tracking-wider text-gray-500 dark:text-gray-400">Total Posts</div>
                <div className="w-8 h-8 rounded-lg bg-flow-50 dark:bg-flow-900/30 text-flow-600 dark:text-flow-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-flow-600 dark:text-flow-400">{stats?.total_posts ?? 0}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-200/80 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase font-semibold tracking-wider text-gray-500 dark:text-gray-400">Total Comments</div>
                <div className="w-8 h-8 rounded-lg bg-tide-50 dark:bg-tide-900/30 text-tide-600 dark:text-tide-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>
              <div className="mt-3 text-3xl font-extrabold text-tide-600 dark:text-tide-400">{stats?.total_comments ?? 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-200/80 dark:border-zinc-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Categories Performance</h3>
              {categories.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No stats available yet.</p>
              ) : (
                <div className="space-y-4">
                  {categories.map((c) => (
                    <div key={c.category} className="flex items-center justify-between group">
                      <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{c.category}</span>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-tide-500 rounded-full transition-all duration-300" style={{ width: `${Math.min(c.count * 10, 100)}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-16 text-right font-medium">{c.count} posts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-200/80 dark:border-zinc-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-zinc-800 pb-3">Trending Tags</h3>
              {tags.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No tags used yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2.5">
                  {tags.map((t) => (
                    <div key={t.tag} className="flex items-center bg-gray-50 dark:bg-zinc-800/80 border border-gray-200/80 dark:border-zinc-700 rounded-full px-3 py-1">
                      <span className="text-gray-700 dark:text-gray-300 font-medium text-xs">#{t.tag}</span>
                      <span className="ml-1.5 bg-tide-100 text-tide-700 dark:bg-tide-900/40 dark:text-tide-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{t.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
