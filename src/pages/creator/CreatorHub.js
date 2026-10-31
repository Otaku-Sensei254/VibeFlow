import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import {
  FiEye,
  FiHeart,
  FiMessageSquare,
  FiActivity,
  FiRepeat,
  FiArrowLeft,
  FiExternalLink,
  FiSearch,
  FiPlus,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";

export default function CreatorHub() {
  const { username: paramUsername } = useParams();
  const { user } = useAuth();
  const username = paramUsername || user?.username;

  const [posts, setPosts] = useState([]);
  const [totals, setTotals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("ripples_desc");

  useEffect(() => {
    if (!username) return;
    (async () => {
      try {
        const res = await api.get(`/users/${username}/creator-hub`);
        const stats = res.data.data.stats || [];
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
  }, [username]);

  // Filtered & sorted posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) =>
        (p.post?.title || "").toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      if (sortBy === "ripples_desc") return (b.rippled_count || 0) - (a.rippled_count || 0);
      if (sortBy === "views_desc") return (b.post?.view_count || 0) - (a.post?.view_count || 0);
      if (sortBy === "likes_desc") return (b.likes_count || 0) - (a.likes_count || 0);
      if (sortBy === "comments_desc") return (b.comments_count || 0) - (a.comments_count || 0);
      if (sortBy === "newest") {
        return new Date(b.post?.inserted_at || 0) - new Date(a.post?.inserted_at || 0);
      }
      if (sortBy === "oldest") {
        return new Date(a.post?.inserted_at || 0) - new Date(b.post?.inserted_at || 0);
      }
      return 0;
    });

    return result;
  }, [posts, searchQuery, sortBy]);

  if (!user) return null;

  // Key ratios
  const rippleRate = totals?.reach > 0 ? ((totals.rippled / totals.reach) * 100).toFixed(1) : "0.0";
  const totalEngagement = (totals?.likes || 0) + (totals?.comments || 0);
  const engagementRate = totals?.views > 0 ? ((totalEngagement / totals.views) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 space-y-6">

        {/* ── Header Card ── */}
        <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <Link
                to={`/profile/${user.username}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-tide-600 dark:text-tide-400 hover:text-tide-700 dark:hover:text-tide-300 transition-colors"
              >
                <FiArrowLeft size={14} /> Back to Profile
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mt-2">
                Creator Hub
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-xl">
                Monitor your network reach, audience engagement, and how your ideas ripple across VibeFlow.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start lg:self-center">
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800/80 border border-gray-200/80 dark:border-zinc-700/80 rounded-2xl px-4 py-2.5">
                <img
                  src={user.avatar_url || `https://ui-avatars.com/api/?name=${user.username}&background=0d9488&color=fff&bold=true`}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-zinc-700"
                />
                <div>
                  <div className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1">
                    {user.username}
                  </div>
                  <div className="text-[11px] text-gray-500 dark:text-gray-400">Creator Analytics</div>
                </div>
              </div>

              <Link
                to="/posts/new"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-tide-600 hover:bg-tide-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                <FiPlus size={15} /> Create Post
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-10 h-10 rounded-full border-[3px] border-tide-100 dark:border-tide-900/30 border-t-tide-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-coral-200 dark:border-coral-900/50 py-12 text-center bg-coral-50/50 dark:bg-coral-900/10">
            <p className="text-coral-600 dark:text-coral-400 text-sm font-medium">{error}</p>
          </div>
        ) : (
          <>
            {/* ── Key Metrics Grid ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {[
                {
                  label: "Total Views",
                  value: totals?.views || 0,
                  icon: FiEye,
                  color: "text-flow-600 dark:text-flow-400",
                  bg: "bg-flow-50 dark:bg-flow-900/20",
                  border: "border-flow-200/50 dark:border-flow-800/30",
                },
                {
                  label: "Total Likes",
                  value: totals?.likes || 0,
                  icon: FiHeart,
                  color: "text-coral-500",
                  bg: "bg-coral-50 dark:bg-coral-900/20",
                  border: "border-coral-200/50 dark:border-coral-800/30",
                },
                {
                  label: "Comments",
                  value: totals?.comments || 0,
                  icon: FiMessageSquare,
                  color: "text-tide-600 dark:text-tide-400",
                  bg: "bg-tide-50 dark:bg-tide-900/20",
                  border: "border-tide-200/50 dark:border-tide-800/30",
                },
                {
                  label: "Network Reach",
                  value: totals?.reach || 0,
                  icon: FiActivity,
                  color: "text-sun-600 dark:text-sun-400",
                  bg: "bg-sun-50 dark:bg-sun-900/20",
                  border: "border-sun-200/50 dark:border-sun-800/30",
                },
                {
                  label: "Total Ripples",
                  value: totals?.rippled || 0,
                  icon: FiRepeat,
                  color: "text-tide-600 dark:text-tide-400",
                  bg: "bg-tide-50 dark:bg-tide-900/20",
                  border: "border-tide-200/50 dark:border-tide-800/30",
                },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <div
                    key={m.label}
                    className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 sm:p-5 shadow-sm transition-all hover:border-gray-300 dark:hover:border-zinc-700"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase font-semibold tracking-wider text-gray-500 dark:text-gray-400">
                        {m.label}
                      </span>
                      <div className={`w-8 h-8 rounded-xl ${m.bg} ${m.color} flex items-center justify-center`}>
                        <Icon size={16} />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight mt-3">
                      {m.value.toLocaleString()}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Insights & Efficiency Banner ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FiRepeat className="text-tide-600 dark:text-tide-400" size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Ripple Efficiency
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-tide-600 dark:text-tide-400">
                    {rippleRate}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Ratio of viewers who reposted your thoughts into their own networks.
                </p>
                <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-tide-500 to-flow-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(parseFloat(rippleRate) || 0, 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FiTrendingUp className="text-flow-600 dark:text-flow-400" size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Engagement Ratio
                    </span>
                  </div>
                  <span className="text-sm font-extrabold text-flow-600 dark:text-flow-400">
                    {engagementRate}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Active interactions (likes & comments) per 100 total impressions.
                </p>
                <div className="h-2 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-flow-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(parseFloat(engagementRate) * 5 || 0, 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <FiZap className="text-sun-500" size={16} />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Active Posts
                    </span>
                  </div>
                  <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">
                    {posts.length} <span className="text-xs font-normal text-gray-500">published posts</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Keep seeding fresh content to grow your ripple network across categories.
                </p>
              </div>
            </div>

            {/* ── Search & Sort Filter Bar ── */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div className="relative flex-1 max-w-md">
                <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  placeholder="Search your posts by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tide-500/40"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">
                  Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-tide-500/40"
                >
                  <option value="ripples_desc">Most Ripples</option>
                  <option value="views_desc">Most Views</option>
                  <option value="likes_desc">Most Likes</option>
                  <option value="comments_desc">Most Comments</option>
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>

            {/* ── Post Trail Section ── */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Post Trail ({filteredPosts.length})
                </h2>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center">
                  <FiActivity size={36} className="mx-auto text-gray-400 mb-3 opacity-60" />
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    {posts.length === 0 ? "No posts published yet" : "No matching posts found"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
                    {posts.length === 0
                      ? "Create and seed posts into the feed to begin tracking how your audience shares them."
                      : "Try tweaking your search term to see other published posts."}
                  </p>
                  {posts.length === 0 && (
                    <Link
                      to="/posts/new"
                      className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-tide-600 hover:bg-tide-700 text-white rounded-xl text-xs font-semibold transition-colors"
                    >
                      <FiPlus size={14} /> Create Post
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {filteredPosts.map((p) => {
                    const postSeed = p.seed_count || 0;
                    const postRippled = p.rippled_count || 0;
                    const ripplePct = postSeed > 0 ? Math.min((postRippled / postSeed) * 100, 100).toFixed(0) : 0;

                    return (
                      <div
                        key={p.post?.id || p.post?.uuid}
                        className="rounded-2xl border border-gray-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm hover:border-tide-400/60 dark:hover:border-tide-600/50 transition-all duration-200"
                      >
                        {/* Post Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <Link
                              to={`/posts/${p.post?.uuid}`}
                              className="font-bold text-base text-gray-900 dark:text-white hover:text-tide-600 dark:hover:text-tide-400 transition-colors line-clamp-1"
                            >
                              {p.post?.title || "Untitled Post"}
                            </Link>
                            <p className="text-xs text-gray-400 dark:text-zinc-500 mt-1">
                              {p.post?.inserted_at ? new Date(p.post.inserted_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ""}
                            </p>
                          </div>

                          <Link
                            to={`/posts/${p.post?.uuid}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-tide-600 dark:text-tide-400 hover:text-tide-700 dark:hover:text-tide-300 transition-colors shrink-0 bg-tide-50 dark:bg-tide-900/20 px-2.5 py-1 rounded-lg"
                          >
                            <span>View</span>
                            <FiExternalLink size={12} />
                          </Link>
                        </div>

                        {/* Ripple Progress Bar */}
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80">
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="font-semibold text-gray-600 dark:text-gray-300">
                              Ripple Trajectory
                            </span>
                            <span className="font-bold text-tide-600 dark:text-tide-400">
                              {postRippled} / {postSeed} ({ripplePct}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-tide-500 to-flow-500 rounded-full transition-all duration-300"
                              style={{ width: `${ripplePct}%` }}
                            />
                          </div>
                        </div>

                        {/* Engagement & Dynamics Metrics */}
                        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 mt-4">
                          <div className="rounded-xl bg-gray-50 dark:bg-zinc-800/70 p-2.5 text-center border border-gray-100 dark:border-zinc-800/60">
                            <div className="flex items-center justify-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
                              <FiEye size={12} className="text-flow-500" /> Views
                            </div>
                            <div className="font-bold text-sm text-gray-900 dark:text-white">
                              {p.post?.view_count || 0}
                            </div>
                          </div>

                          <div className="rounded-xl bg-gray-50 dark:bg-zinc-800/70 p-2.5 text-center border border-gray-100 dark:border-zinc-800/60">
                            <div className="flex items-center justify-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
                              <FiHeart size={12} className="text-coral-500" /> Likes
                            </div>
                            <div className="font-bold text-sm text-gray-900 dark:text-white">
                              {p.likes_count || 0}
                            </div>
                          </div>

                          <div className="rounded-xl bg-gray-50 dark:bg-zinc-800/70 p-2.5 text-center border border-gray-100 dark:border-zinc-800/60">
                            <div className="flex items-center justify-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
                              <FiMessageSquare size={12} className="text-tide-500" /> Comments
                            </div>
                            <div className="font-bold text-sm text-gray-900 dark:text-white">
                              {p.comments_count || 0}
                            </div>
                          </div>

                          <div className="rounded-xl bg-gray-50 dark:bg-zinc-800/70 p-2.5 text-center border border-gray-100 dark:border-zinc-800/60">
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">Seeded</div>
                            <div className="font-bold text-sm text-gray-900 dark:text-white">
                              {postSeed}
                            </div>
                          </div>

                          <div className="rounded-xl bg-gray-50 dark:bg-zinc-800/70 p-2.5 text-center border border-gray-100 dark:border-zinc-800/60">
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">Rippled</div>
                            <div className="font-bold text-sm text-tide-600 dark:text-tide-400">
                              {postRippled}
                            </div>
                          </div>

                          <div className="rounded-xl bg-gray-50 dark:bg-zinc-800/70 p-2.5 text-center border border-gray-100 dark:border-zinc-800/60">
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">Frontier</div>
                            <div className="font-bold text-sm text-gray-900 dark:text-white">
                              {p.frontier_count || 0}
                            </div>
                          </div>
                        </div>

                        {/* Who Rippled Section */}
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80">
                          <div className="text-[11px] uppercase tracking-wider font-semibold text-gray-400 dark:text-zinc-500 mb-2">
                            Reshared By
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {p.ripplers?.length > 0 ? (
                              p.ripplers.map((rippler) => (
                                <Link
                                  key={rippler.id || rippler.username}
                                  to={`/profile/${rippler.username}`}
                                  className="text-xs px-2.5 py-1 rounded-full bg-tide-50 text-tide-700 dark:bg-tide-900/30 dark:text-tide-300 border border-tide-200/50 dark:border-tide-800/40 hover:bg-tide-100 dark:hover:bg-tide-900/50 transition-colors font-medium"
                                >
                                  @{rippler.username}
                                </Link>
                              ))
                            ) : (
                              <span className="text-xs text-gray-400 dark:text-zinc-500 italic">
                                No ripples recorded yet
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
