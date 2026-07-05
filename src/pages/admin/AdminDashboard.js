import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="rounded-3xl border border-slate-200/70 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur p-6 lg:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">System Overview</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Admin control center and live content pulse.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full px-4 py-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
              Welcome {user?.username}
            </div>
            <Link
              to={`/profile/${user?.username}`}
              className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              &larr; Back to Profile
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 rounded-full border-[3px] border-tide-100 dark:border-tide-900/30 border-t-tide-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border-2 border-red-200 dark:border-red-900/50 mt-8 py-12 text-center bg-red-50/50 dark:bg-red-900/10">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-8">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-200/70 dark:border-zinc-800">
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Users</div>
              <div className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">{stats?.total_users ?? 0}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-200/70 dark:border-zinc-800">
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Posts</div>
              <div className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{stats?.total_posts ?? 0}</div>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-200/70 dark:border-zinc-800">
              <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Total Comments</div>
              <div className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats?.total_comments ?? 0}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-200/70 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-slate-200/70 dark:border-zinc-800 pb-2">Categories Performance</h3>
              {categories.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No stats available yet.</p>
              ) : (
                <div className="space-y-4">
                  {categories.map((c) => (
                    <div key={c.category} className="flex items-center justify-between group">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{c.category}</span>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(c.count * 10, 100)}%` }} />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">{c.count} posts</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-slate-200/70 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-slate-200/70 dark:border-zinc-800 pb-2">Trending Tags</h3>
              {tags.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No tags used yet.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {tags.map((t) => (
                    <div key={t.tag} className="flex items-center bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full px-3 py-1.5">
                      <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">#{t.tag}</span>
                      <span className="ml-2 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full">{t.count}</span>
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
