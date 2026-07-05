import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function CreatorHub() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const res = await api.get(`/users/${user.username}/creator-hub`);
        const stats = res.data.data.stats;
        setPosts(stats);
        setTotals({
          views: stats.reduce((acc, p) => acc + (p.post?.view_count || 0), 0),
          likes: stats.reduce((acc, p) => acc + (p.likes_count || 0), 0),
          comments: stats.reduce((acc, p) => acc + (p.comments_count || 0), 0),
          reach: stats.reduce((acc, p) => acc + (p.seed_count || 0), 0),
          rippled: stats.reduce((acc, p) => acc + (p.rippled_count || 0), 0),
        });
        setLoading(false);
      } catch (err) {
        setError(err?.response?.data?.error || err?.message || "Failed to load creator hub");
        setLoading(false);
      }
    })();
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6">
      <div className="rounded-3xl overflow-hidden border border-slate-200/60 dark:border-zinc-800 bg-gradient-to-br from-white via-slate-50 to-tide-50/60 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900/60">
        <div className="p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <Link
              to={`/profile/${user.username}`}
              className="text-xs text-flow-600 dark:text-flow-400 hover:underline"
            >
              &larr; Back to profile
            </Link>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mt-2">
              Creator Hub
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Track how your posts ripple through the network.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/80 dark:bg-zinc-800/70 border border-slate-200 dark:border-zinc-700 rounded-2xl px-4 py-3 shadow-sm">
            <img
              src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=0d9488&color=fff&bold=true`}
              alt=""
              className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-zinc-700"
            />
            <div>
              <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                {user.username}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Creator dashboard</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-24">
          <div className="w-10 h-10 rounded-full border-[3px] border-tide-100 dark:border-tide-900/30 border-t-tide-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="rounded-3xl border-2 border-coral-200 dark:border-coral-900/50 mt-8 py-12 text-center bg-coral-50/50 dark:bg-coral-900/10">
          <p className="text-coral-600 dark:text-coral-400 text-sm font-medium">{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
            {[
              { label: "Views", value: totals?.views || 0, color: "text-flow-600 dark:text-flow-400" },
              { label: "Likes", value: totals?.likes || 0, color: "text-coral-600 dark:text-coral-400" },
              { label: "Comments", value: totals?.comments || 0, color: "text-tide-600 dark:text-tide-400" },
              { label: "Reach", value: totals?.reach || 0, color: "text-sun-600 dark:text-sun-400" },
              { label: "Rippled", value: totals?.rippled || 0, color: "text-flow-600 dark:text-flow-400" },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
                <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{m.label}</div>
                <div className={`text-2xl font-bold mt-2 ${m.color}`}>{m.value.toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Post Trail</h2>

            {posts.length === 0 ? (
              <div className="text-sm text-gray-500 dark:text-gray-400">No posts yet.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {posts.map((p) => (
                  <div key={p.post?.id} className="rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {p.post?.title || "Untitled Post"}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {p.post?.inserted_at ? new Date(p.post.inserted_at).toLocaleDateString() : ""}
                        </p>
                      </div>
                      <Link
                        to={`/posts/${p.post?.uuid}`}
                        className="text-xs text-flow-600 dark:text-flow-400 hover:underline shrink-0"
                      >
                        View
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="rounded-xl bg-slate-50 dark:bg-zinc-800 p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Views</div>
                        <div className="font-bold text-gray-900 dark:text-white">{p.post?.view_count || 0}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 dark:bg-zinc-800 p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Likes</div>
                        <div className="font-bold text-gray-900 dark:text-white">{p.likes_count || 0}</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 dark:bg-zinc-800 p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Comments</div>
                        <div className="font-bold text-gray-900 dark:text-white">{p.comments_count || 0}</div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-3">
                      <div className="rounded-xl border border-slate-200 dark:border-zinc-700 p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Seeded</div>
                        <div className="font-bold text-gray-900 dark:text-white">{p.seed_count || 0}</div>
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-zinc-700 p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Rippled</div>
                        <div className="font-bold text-gray-900 dark:text-white">{p.rippled_count || 0}</div>
                      </div>
                      <div className="rounded-xl border border-slate-200 dark:border-zinc-700 p-3 text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Stopped At</div>
                        <div className="font-bold text-gray-900 dark:text-white">{p.frontier_count || 0}</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                        Ripple Trail (Who Shared)
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {p.ripplers?.length > 0 ? (
                          p.ripplers.map((rippler) => (
                            <Link
                              key={rippler.id || rippler.username}
                              to={`/profile/${rippler.username}`}
                              className="text-xs px-2.5 py-1 rounded-full bg-tide-50 text-tide-700 dark:bg-tide-900/40 dark:text-tide-300 border border-tide-100 dark:border-tide-800"
                            >
                              {rippler.username}
                            </Link>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No ripples yet</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}