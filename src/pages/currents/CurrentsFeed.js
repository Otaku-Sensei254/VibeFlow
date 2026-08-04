import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiMessageCircle, FiShare2, FiVolume2, FiVolumeX, FiCamera } from "react-icons/fi";
import CurrentCommentSheet from "../../components/comments/CurrentCommentSheet";
import { useAuth } from "../../context/AuthContext";
import api from "../../utils/api";
import VideoPlayer from "../../components/VideoPlayer";

function formatCount(n) {
  if (!n) return "0";
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : dateStr + "Z");
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

export default function CurrentsFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("all");
  const [posts, setPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // eslint-disable-line no-unused-vars
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [muted, setMuted] = useState(true);
  const [liking, setLiking] = useState(false);
  const [commentTarget, setCommentTarget] = useState(null);
  const containerRef = useRef(null);

  const fetchCurrents = useCallback(async (pageNum, append = false) => {
    try {
      const res = await api.get("/currents", {
        params: { tab, page: pageNum, per_page: 10 },
      });
      const newPosts = res.data.data?.posts || [];
      setPosts((prev) => append ? [...prev, ...newPosts] : newPosts);
      setHasMore(newPosts.length === 10);
    } catch {}
    setLoading(false);
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    setCurrentIndex(0);
    setPage(1);
    fetchCurrents(1);
  }, [fetchCurrents]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number(entry.target.dataset.index);
          if (entry.isIntersecting) {
            setCurrentIndex(idx);
            if (idx >= posts.length - 3 && hasMore) {
              setPage((p) => p + 1);
            }
          }
        });
      },
      { root: containerRef.current, threshold: 0.6 }
    );
    const els = containerRef.current.querySelectorAll("[data-index]");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [posts, hasMore]);

  useEffect(() => {
    if (!hasMore || page <= 1) return;
    fetchCurrents(page, true);
  }, [page, hasMore, fetchCurrents]);

  const handleLike = async (post) => {
    if (!user) { navigate("/login"); return; }
    if (liking) return;
    setLiking(true);
    const wasLiked = post.is_liked;
    post.is_liked = !wasLiked;
    post.likes_count = (post.likes_count || 0) + (wasLiked ? -1 : 1);
    setPosts([...posts]);
    try {
      await api.post(`/posts/${post.uuid}/like`);
    } catch {
      post.is_liked = wasLiked;
      post.likes_count = (post.likes_count || 0) + (wasLiked ? 1 : -1);
      setPosts([...posts]);
    }
    setLiking(false);
  };

  const handleComment = (post) => {
    if (!user) { navigate("/login"); return; }
    setCommentTarget(post);
  };

  
  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({ url: `${window.location.origin}/posts/${post.uuid}` }).catch(() => {});
    }
  };

  const getFirstVideoUrl = (post) => {
    if (!post.media_files?.length) return "";
    const vid = post.media_files.find((m) => m.type === "video");
    return vid?.url || "";
  };

  return (
    <div className="relative h-full bg-black overflow-hidden">
      {/* Top tabs — slightly away from top */}
      <div className="absolute top-6 left-0 right-0 z-20 px-4">
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-full p-0.5">
            <button onClick={() => setTab("following")}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${tab === "following" ? 'bg-white text-gray-900' : 'text-white/60 hover:text-white/90'}`}>
              Following
            </button>
            <button onClick={() => setTab("all")}
              className={`px-5 py-1.5 rounded-full text-xs font-semibold transition-all ${tab === "all" ? 'bg-white text-gray-900' : 'text-white/60 hover:text-white/90'}`}>
              Currents
            </button>
          </div>
        </div>
      </div>

      {/* Video feed */}
      <div ref={containerRef} className="h-full overflow-y-auto snap-y snap-mandatory scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/60 px-8 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <FiCamera size={28} className="text-white/40" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-white/80 mb-1">No currents yet</p>
              <p className="text-sm text-white/40">Be the first to share a short video.</p>
            </div>
            <Link to="/currents/new"
              className="mt-2 px-6 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition">
              Record a Current
            </Link>
          </div>
        ) : posts.map((post, idx) => (
          <div key={post.uuid || idx} data-index={idx}
            className="relative w-full h-full snap-start flex-shrink-0 bg-black">
            {/* Video Player */}
            {getFirstVideoUrl(post) ? (
              <VideoPlayer
                src={getFirstVideoUrl(post)}
                muted={muted}
                autoPlay={true}
                loop={true}
                playsInline={true}
                className="absolute inset-0 w-full h-full"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/40 text-sm">No video</div>
            )}

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/40 pointer-events-none" />

            {/* Right action rail */}
            <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-5">
              <Link to={`/profile/${post.user?.username}`} className="block">
                <img src={post.user?.avatar_url || `https://ui-avatars.com/api/?name=${post.user?.username || "?"}&background=6366F1&color=fff`}
                  alt="" className="w-11 h-11 rounded-full object-cover ring-2 ring-white/30" />
              </Link>
              <div className="flex flex-col items-center gap-0.5">
                <button onClick={() => handleLike(post)}
                  className="text-white/80 hover:text-coral-400 transition-all p-1.5">
                  <FiHeart size={26} className={post.is_liked ? 'fill-coral-500 text-coral-500' : ''} />
                </button>
                <span className="text-white/50 text-[10px] font-medium">{formatCount(post.likes_count)}</span>
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <button onClick={() => handleComment(post)}
                  className="text-white/80 hover:text-tide-400 transition-all p-1.5">
                  <FiMessageCircle size={24} />
                </button>
                <span className="text-white/50 text-[10px] font-medium">{formatCount(post.comments_count)}</span>
              </div>
              <button onClick={() => handleShare(post)}
                className="text-white/80 hover:text-tide-400 transition-all p-2">
                <FiShare2 size={22} />
              </button>
            </div>

            {/* Bottom caption block */}
            <div className="absolute bottom-6 left-4 right-16 z-10">
              <Link to={`/profile/${post.user?.username}`}
                className="text-white font-semibold text-sm hover:underline inline-block mb-1">
                @{post.user?.username}
              </Link>
              <p className="text-white/70 text-xs leading-relaxed line-clamp-2">
                {post.content || post.title}
              </p>
              <p className="text-white/30 text-[10px] mt-1">
                {post.inserted_at && formatTime(post.inserted_at)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Mute toggle */}
      <button onClick={() => setMuted(!muted)}
        className="absolute top-6 right-4 z-20 text-white/50 hover:text-white p-2 bg-white/10 backdrop-blur-md rounded-full transition-all">
        {muted ? <FiVolumeX size={16} /> : <FiVolume2 size={16} />}
      </button>

      {/* Comment sheet overlay */}
      {commentTarget && (
        <CurrentCommentSheet
          current={commentTarget}
          currentUser={user}
          onClose={() => setCommentTarget(null)}
        />
      )}
    </div>
  );
}