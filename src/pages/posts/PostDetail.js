import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { useFollow } from "../../context/FollowContext";
import { showToast } from "../../utils/toast";
import { joinChannel, onChannel } from "../../utils/realtime";
import {
  FiHeart, FiRepeat, FiBookmark, FiSend,
  FiArrowLeft, FiSearch, FiX
} from "react-icons/fi";
import MediaCarousel from "../../components/MediaCarousel";
import CommentSection from "../../components/comments/CommentSection";

function formatTime(dateStr) {
  if (!dateStr) return "";
  const normalized = dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : dateStr + "Z";
  const d = new Date(normalized);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

export default function PostDetail() {
  const { uuid } = useParams();
  const { user } = useAuth();
  const { followedUsers, setFollowing: setFollowState } = useFollow();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareRecipients, setShareRecipients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [following, setFollowing] = useState([]);
  const [sharing, setSharing] = useState(false);

  const [followLoading, setFollowLoading] = useState(false);

  const authorId = post?.user?.id;
  const isFollowing = authorId ? (followedUsers[authorId] !== undefined ? followedUsers[authorId] : false) : false;

  const loadPost = useCallback(async () => {
    try {
      const res = await api.get(`/posts/${uuid}`);
      const p = res.data.data.post;
      setPost(p);
      if (p.user?.id) {
        setFollowState(p.user.id, p.is_following || false);
      }
      api.post(`/posts/${uuid}/view`).catch(() => {});
    } catch (err) {
      if (err.response?.status === 401) setErrorType("auth");
      else setErrorType("not_found");
    }
    setLoading(false);
  }, [uuid, setFollowState]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  useEffect(() => {
    if (!post) return;
    joinChannel(`relay:post:${uuid}`, {});

    const onLike = (p) => {
      if (p.user_id === user?.id) return;
      setPost((prev) => prev ? { ...prev, likes_count: prev.likes_count + 1 } : prev);
    };
    const onUnlike = (p) => {
      if (p.user_id === user?.id) return;
      setPost((prev) => prev ? { ...prev, likes_count: Math.max(0, prev.likes_count - 1) } : prev);
    };
    const onRepost = (p) => {
      if (p.user_id === user?.id) return;
      setPost((prev) => prev ? { ...prev, reposts_count: prev.reposts_count + 1 } : prev);
    };
    const onUnrepost = (p) => {
      setPost((prev) => prev ? { ...prev, reposts_count: Math.max(0, prev.reposts_count - 1) } : prev);
    };
    const onSave = (p) => {
      if (p.user_id === user?.id) return;
      setPost((prev) => prev ? { ...prev, saves_count: prev.saves_count + 1 } : prev);
    };
    const onUnsave = (p) => {
      if (p.user_id === user?.id) return;
      setPost((prev) => prev ? { ...prev, saves_count: Math.max(0, prev.saves_count - 1) } : prev);
    };

    onChannel(`relay:post:${uuid}`, "post_liked", onLike);
    onChannel(`relay:post:${uuid}`, "post_unliked", onUnlike);
    onChannel(`relay:post:${uuid}`, "repost_added", onRepost);
    onChannel(`relay:post:${uuid}`, "unreposted", onUnrepost);
    onChannel(`relay:post:${uuid}`, "post_saved", onSave);
    onChannel(`relay:post:${uuid}`, "post_unsaved", onUnsave);
  }, [uuid, user?.id, post]);

  const toggleLike = async () => {
    if (!user) { navigate("/login"); return; }
    const was = post.is_liked;
    setPost((prev) => ({
      ...prev,
      is_liked: !was,
      likes_count: was ? prev.likes_count - 1 : prev.likes_count + 1,
    }));
    try {
      await api.post(`/posts/${uuid}/like`);
    } catch {
      setPost((prev) => ({
        ...prev,
        is_liked: was,
        likes_count: was ? prev.likes_count + 1 : prev.likes_count - 1,
      }));
    }
  };

  const toggleRepost = async () => {
    if (!user) { navigate("/login"); return; }
    const was = post.is_reposted;
    setPost((prev) => ({
      ...prev,
      is_reposted: !was,
      reposts_count: was ? prev.reposts_count - 1 : prev.reposts_count + 1,
    }));
    try {
      const res = await api.post(`/posts/${uuid}/repost`);
      const isReposted = res.data?.data?.reposted;
      if (isReposted !== !was) {
        setPost((prev) => ({
          ...prev,
          is_reposted: isReposted,
          reposts_count: isReposted ? prev.reposts_count + 1 : prev.reposts_count - 1,
        }));
      }
    } catch {
      setPost((prev) => ({
        ...prev,
        is_reposted: was,
        reposts_count: was ? prev.reposts_count + 1 : prev.reposts_count - 1,
      }));
    }
  };

  const toggleSave = async () => {
    if (!user) { navigate("/login"); return; }
    const was = post.is_saved;
    setPost((prev) => ({
      ...prev,
      is_saved: !was,
      saves_count: was ? prev.saves_count - 1 : prev.saves_count + 1,
    }));
    try {
      const res = await api.post(`/posts/${uuid}/save`);
      const isSaved = res.data?.data?.saved;
      if (isSaved !== !was) {
        setPost((prev) => ({
          ...prev,
          is_saved: isSaved,
          saves_count: isSaved ? prev.saves_count + 1 : prev.saves_count - 1,
        }));
      }
    } catch {
      setPost((prev) => ({
        ...prev,
        is_saved: was,
        saves_count: was ? prev.saves_count + 1 : prev.saves_count - 1,
      }));
    }
  };

  const handleFollow = async () => {
    if (!user) {
      showToast({ type: "error", title: "Login Required", message: `You need to be logged in to follow @${post.user?.username}` });
      navigate("/login");
      return;
    }
    if (followLoading) return;
    setFollowLoading(true);
    const username = post.user?.username;
    try {
      if (isFollowing) {
        await api.delete(`/users/${username}/follow`);
        setFollowState(authorId, false);
      } else {
        await api.post(`/users/${username}/follow`);
        setFollowState(authorId, true);
      }
    } catch {}
    setFollowLoading(false);
  };

  const openShareModal = async () => {
    if (!user) { navigate("/login"); return; }
    setShowShareModal(true);
    setSearchQuery("");
    setShareRecipients([]);
    setSearchResults([]);
    try {
      const res = await api.get(`/users/${user.username}/following`);
      setFollowing((res.data.data?.users || []).filter((u) => u.id !== user?.id));
    } catch { setFollowing([]); }
  };

  const handleShareSearch = async (q) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    try {
      const res = await api.get("/users/search", { params: { q: q.trim() } });
      setSearchResults((res.data.data?.users || []).filter((u) => u.id !== user?.id));
    } catch { setSearchResults([]); }
  };

  const toggleRecipient = (u) => {
    setShareRecipients((prev) =>
      prev.some((r) => r.id === u.id) ? prev.filter((r) => r.id !== u.id) : [...prev, u]
    );
  };

  const handleShare = async () => {
    if (shareRecipients.length === 0) return;
    setSharing(true);
    try {
      await api.post(`/posts/${uuid}/share`, {
        recipient_ids: shareRecipients.map((r) => r.id),
      });
      setShowShareModal(false);
      setShareRecipients([]);
      setSearchQuery("");
      setFollowing([]);
    } catch {}
    setSharing(false);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 animate-pulse">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-16 mb-6" />
        <div className="bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 p-4 sm:p-5 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="space-y-1.5 flex-1">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-32" />
              <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-20" />
            </div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full w-full" />
            <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full w-5/6" />
            <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-2/3" />
          </div>
          <div className="h-56 bg-gray-100 dark:bg-gray-700/50 rounded-xl mb-4" />
          <div className="flex gap-4">
            <div className="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-3 w-14 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        </div>
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-24 mb-4" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 mb-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/4" />
              <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-16 px-4">
        {errorType === "auth" ? (
          <>
            <p className="text-gray-500 text-lg mb-2">Please log in to view this post</p>
            <button onClick={() => navigate("/login")} className="text-tide-600 hover:underline text-sm font-medium">
              Log in
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-500 text-lg mb-2">Post not found</p>
            <Link to="/feed" className="text-tide-600 hover:underline text-sm">Back to feed</Link>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white dark:bg-gray-900 px-4 py-3 flex items-center border-b border-gray-200 dark:border-gray-800 sticky top-0 z-20">
        <Link to="/feed" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mr-3">
          <FiArrowLeft size={20} />
        </Link>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Post</span>
      </div>

      <div className="max-w-3xl mx-auto px-0 lg:px-6 py-0 lg:py-8">
        {/* Back Button (Desktop) */}
        <Link to="/feed" className="hidden lg:inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors">
          <FiArrowLeft size={16} /> Back to feed
        </Link>

        {/* Post Card */}
        <div className="bg-white dark:bg-gray-900 lg:rounded-3xl lg:shadow-lg lg:border border-gray-100 dark:border-gray-800 overflow-hidden">
          {/* Gradient accent */}
          <div className="h-1 bg-gradient-to-r from-tide-500 via-flow-500 to-coral-500" />

          {/* Media */}
          {post.media_files?.length > 0 && (
            <div className="bg-black">
              <MediaCarousel files={post.media_files} />
            </div>
          )}

          <div className="p-5 sm:p-7 lg:p-8">
            {/* User Header */}
            <div className="flex items-center justify-between mb-6">
              <Link to={`/profile/${post.user?.username}`} className="flex items-center gap-3 group">
                <div className="relative">
                  <img
                    src={post.user?.avatar_url || `https://ui-avatars.com/api/?name=${post.user?.username || "?"}&background=6366F1&color=fff&bold=true`}
                    alt={post.user?.username}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white dark:ring-gray-800 group-hover:ring-tide-300 transition-all"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-900 dark:text-white group-hover:text-tide-600 dark:group-hover:text-tide-400 transition-colors">
                      {post.user?.username}
                    </span>
                    {post.user?.is_verified && (
                      <img src="/images/vibeflow_verified2.png" alt="Verified" className="inline w-4 h-4" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{formatTime(post.inserted_at)}</p>
                </div>
              </Link>
              {user?.id !== post.user?.id && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    isFollowing
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-coral-50 hover:text-coral-500 dark:hover:bg-coral-900/20 dark:hover:text-coral-400 border border-gray-200 dark:border-gray-700"
                      : "bg-tide-600 text-white hover:bg-tide-700 shadow-sm shadow-tide-200 dark:shadow-tide-900/30"
                  }`}
                  onMouseEnter={(e) => { if (isFollowing) e.target.textContent = "Unfollow"; }}
                  onMouseLeave={(e) => { if (isFollowing) e.target.textContent = "Following"; }}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight text-gray-900 dark:text-gray-100">
              {post.title}
            </h1>

            {/* Tags */}
            {post.tags?.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    to={`/tags/${tag}`}
                    className="text-xs font-semibold text-tide-600 dark:text-tide-400 bg-tide-50 dark:bg-tide-900/20 hover:bg-tide-100 dark:hover:bg-tide-900/40 px-2.5 py-1 rounded-full transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
              {post.content}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    onClick={toggleLike}
                    className={`flex items-center gap-1.5 text-sm font-medium px-3 sm:px-4 py-2 rounded-xl transition-all ${
                      post.is_liked
                        ? "text-coral-500 bg-coral-50 dark:bg-coral-900/20"
                              : "text-gray-500 dark:text-gray-400 hover:text-coral-500 hover:bg-coral-50 dark:hover:bg-coral-900/10"
                    }`}
                  >
                    <FiHeart className={post.is_liked ? "fill-current" : ""} size={18} />
                    {post.likes_count > 0 && <span>{post.likes_count}</span>}
                  </button>

                  <button
                    onClick={toggleRepost}
                    className={`flex items-center gap-1.5 text-sm font-medium px-3 sm:px-4 py-2 rounded-xl transition-all ${
                      post.is_reposted
                        ? "text-green-500 bg-green-50 dark:bg-green-900/20"
                        : "text-gray-500 dark:text-gray-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10"
                    }`}
                  >
                    <FiRepeat size={18} className={post.is_reposted ? "fill-current" : ""} />
                    {post.reposts_count > 0 && <span>{post.reposts_count}</span>}
                  </button>

                  <button
                    onClick={openShareModal}
                    className="flex items-center gap-1.5 text-sm font-medium px-3 sm:px-4 py-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-tide-500 hover:bg-tide-50 dark:hover:bg-tide-900/10 transition-all"
                  >
                    <FiSend size={18} />
                  </button>

                  <button
                    onClick={toggleSave}
                    className={`flex items-center gap-1.5 text-sm font-medium px-3 sm:px-4 py-2 rounded-xl transition-all ${
                      post.is_saved
                        ? "text-sun-500 bg-sun-50 dark:bg-sun-900/20"
                        : "text-gray-500 dark:text-gray-400 hover:text-sun-500 hover:bg-sun-50 dark:hover:bg-sun-900/10"
                    }`}
                  >
                    <FiBookmark size={18} className={post.is_saved ? "fill-current" : ""} />
                    {post.saves_count > 0 && <span>{post.saves_count}</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-white dark:bg-gray-900 lg:rounded-3xl lg:shadow-lg lg:border border-gray-100 dark:border-gray-800 overflow-hidden mt-4 lg:mt-6">
          <CommentSection uuid={uuid} user={user} />
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-10 text-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowShareModal(false); setShareRecipients([]); setSearchQuery(""); setFollowing([]); }} />
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Share Post</h3>
                <button onClick={() => { setShowShareModal(false); setShareRecipients([]); setSearchQuery(""); setFollowing([]); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"><FiX size={20} /></button>
              </div>

              <div className="relative mb-4">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleShareSearch(e.target.value)}
                  placeholder="Search users to share with..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-tide-500/50 placeholder-gray-400"
                />
              </div>

              {shareRecipients.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {shareRecipients.map((r) => (
                    <span key={r.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-tide-100 dark:bg-tide-900/30 text-tide-700 dark:text-tide-300 rounded-full text-sm font-medium">
                      {r.username}
                      <button onClick={() => toggleRecipient(r)} className="hover:text-tide-900 dark:hover:text-tide-100"><FiX size={14} /></button>
                    </span>
                  ))}
                </div>
              )}

              <div className="max-h-52 overflow-y-auto space-y-1 mb-4">
                {!searchQuery.trim() && following.length > 0 && (
                  <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Following</p>
                )}
                {(searchQuery.trim() ? searchResults : following).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => toggleRecipient(u)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition ${
                      shareRecipients.some((r) => r.id === u.id)
                        ? "bg-tide-50 dark:bg-tide-900/20 ring-1 ring-tide-300 dark:ring-tide-700"
                        : "hover:bg-gray-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.username}&background=6366F1&color=fff`} alt="" className="w-9 h-9 rounded-full object-cover" />
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{u.username}</p>
                      {u.bio && <p className="text-xs text-gray-500 line-clamp-1">{u.bio}</p>}
                    </div>
                    {shareRecipients.some((r) => r.id === u.id) && (
                      <svg className="w-5 h-5 text-tide-600" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                    )}
                  </button>
                ))}
                {!searchQuery.trim() && following.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">You are not following anyone yet</p>
                )}
                {searchQuery.trim() && searchResults.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">No users found</p>
                )}
              </div>

              <button
                onClick={handleShare}
                disabled={shareRecipients.length === 0 || sharing}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-tide-600 to-flow-600 text-white text-sm font-bold uppercase tracking-wide shadow-lg shadow-tide-600/25 hover:shadow-tide-600/40 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {sharing ? "Sharing..." : `Share with ${shareRecipients.length} friend${shareRecipients.length !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
