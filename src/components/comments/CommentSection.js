import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiMessageCircle, FiMoreVertical, FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import api from "../../utils/api";
import { joinChannel, onChannel } from "../../utils/realtime";
import CommentInput from "./CommentInput";

const PinIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
  </svg>
);

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

export default function CommentSection({ uuid, user }) {
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);

  const loadPost = useCallback(async () => {
    try {
      const res = await api.get(`/posts/${uuid}`);
      setPost(res.data.data.post);
    } catch {}
    setLoading(false);
  }, [uuid]);

  useEffect(() => {
    loadPost();
  }, [loadPost]);

  useEffect(() => {
    if (!post) return;
    joinChannel(`relay:post:${uuid}`, {});

    onChannel(`relay:post:${uuid}`, "new_comment", (c) => {
      setPost((prev) => {
        if (!prev) return prev;
        if (prev.comments?.some((x) => x.id === c.id)) return prev;
        return {
          ...prev,
          comments: [...(prev.comments || []), c],
          comments_count: prev.comments_count + 1,
        };
      });
    });

    onChannel(`relay:post:${uuid}`, "comment_updated", (c) => {
      setPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments?.map((x) => x.id === c.id ? { ...x, content: c.content } : x),
        };
      });
    });

    onChannel(`relay:post:${uuid}`, "comment_pinned", (c) => {
      setPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments?.map((x) => ({ ...x, pinned: x.id === c.id })),
        };
      });
    });

    onChannel(`relay:post:${uuid}`, "comment_deleted", (c) => {
      setPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments?.filter((x) => x.id !== c.id),
          comments_count: Math.max(0, prev.comments_count - 1),
        };
      });
    });
  }, [uuid, post]);

  const handleSubmitComment = async (text) => {
    if (!text.trim()) return;
    if (!user) { navigate("/login"); return; }
    if (sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    try {
      const res = await api.post(`/posts/${uuid}/comments`, {
        comment: { content: text },
      });
      const newComment = res.data.data.comment;
      setPost((prev) => {
        if (prev.comments?.some((x) => x.id === newComment.id)) return prev;
        return {
          ...prev,
          comments: [...(prev.comments || []), newComment],
          comments_count: (prev.comments_count || 0) + 1,
        };
      });
    } catch {}
    sendingRef.current = false;
    setSending(false);
  };

  const handlePinComment = async (commentId) => {
    try {
      await api.post(`/comments/${commentId}/pin`);
    } catch {}
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setPost((prev) => ({
        ...prev,
        comments: prev.comments?.filter((c) => c.id !== commentId),
        comments_count: Math.max(0, prev.comments_count - 1),
      }));
    } catch {}
  };

  const handleCommentLike = async (commentId, wasLiked) => {
    if (!user) { navigate("/login"); return; }
    setPost((prev) => ({
      ...prev,
      comments: prev.comments?.map((c) =>
        c.id === commentId
          ? { ...c, is_liked: !wasLiked, likes_count: wasLiked ? c.likes_count - 1 : c.likes_count + 1 }
          : c
      ),
    }));
    try {
      await api.post(`/comments/${commentId}/like`);
    } catch {
      setPost((prev) => ({
        ...prev,
        comments: prev.comments?.map((c) =>
          c.id === commentId
            ? { ...c, is_liked: wasLiked, likes_count: wasLiked ? c.likes_count + 1 : c.likes_count - 1 }
            : c
        ),
      }));
    }
  };

  const startEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.content);
    setMenuOpenId(null);
  };

  const cancelEdit = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const submitEdit = async (commentId) => {
    if (!editText.trim()) return;
    try {
      const res = await api.put(`/comments/${commentId}`, {
        comment: { content: editText },
      });
      const updated = res.data.data.comment;
      setPost((prev) => ({
        ...prev,
        comments: prev.comments?.map((c) => c.id === commentId ? updated : c),
      }));
      setEditingCommentId(null);
      setEditText("");
    } catch {}
  };

  const isPostOwner = user && post && user.id === post.user?.id;
  const sortedComments = post?.comments
    ? [...post.comments].sort((a, b) => {
        if (b.pinned !== a.pinned) return (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0);
        return new Date(b.inserted_at) - new Date(a.inserted_at);
      })
    : [];

  if (loading) {
    return (
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3 p-4 animate-pulse">
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

  return (
    <div className="flex flex-col h-full">
      {/* Comments count header */}
      <div className="px-5 sm:px-7 lg:px-8 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 shrink-0">
        <FiMessageCircle className="text-tide-500" size={16} />
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Comments</h2>
        <span className="text-xs text-gray-400 ml-1">({post?.comments_count || 0})</span>
      </div>

      {/* Comment input */}
      <div className="shrink-0">
        <CommentInput user={user} onSubmit={handleSubmitComment} sending={sending} />
      </div>

      {/* Comments list — scrollable */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
        {sortedComments.length === 0 ? (
          <div className="text-center py-12 px-5 sm:px-7 lg:px-8">
            <FiMessageCircle className="mx-auto text-gray-200 dark:text-gray-700 mb-3" size={32} />
            <p className="text-gray-400 text-sm">No comments yet. Be the first to share your thoughts!</p>
          </div>
        ) : (
          sortedComments.map((comment) => {
            const isCommentOwner = user && user.id === comment.user?.id;
            const canDelete = isCommentOwner || isPostOwner;
            const isEditing = editingCommentId === comment.id;

            return (
              <div key={comment.id} className={`px-5 sm:px-7 lg:px-8 py-4 ${comment.pinned ? "bg-tide-50/40 dark:bg-tide-900/10" : ""} hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all`}>
                <div className="flex items-start gap-3">
                  <Link to={`/profile/${comment.user?.username}`} className="shrink-0">
                    <img
                      src={comment.user?.avatar_url || `https://ui-avatars.com/api/?name=${comment.user?.username || "?"}&background=6366F1&color=fff&bold=true`}
                      alt={comment.user?.username}
                      className="w-8 h-8 rounded-full object-cover mt-0.5"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <Link to={`/profile/${comment.user?.username}`} className="text-sm font-semibold text-gray-900 dark:text-gray-100 hover:text-tide-600 dark:hover:text-tide-400 transition-colors">
                        {comment.user?.username}
                      </Link>
                      {comment.user?.is_verified && (
                        <img src="/images/vibeflow_verified2.png" alt="Verified" className="inline w-3.5 h-3.5" />
                      )}
                      <span className="text-xs text-gray-400">{formatTime(comment.inserted_at)}</span>
                      {comment.pinned && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-tide-600 bg-tide-100 dark:bg-tide-900/30 px-1.5 py-0.5 rounded-full">
                          <PinIcon /> Pinned
                        </span>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="flex gap-2 mt-1">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 focus:ring-2 focus:ring-tide-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                          autoFocus
                        />
                        <button onClick={() => submitEdit(comment.id)} className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition"><FiCheck size={16} /></button>
                        <button onClick={cancelEdit} className="p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"><FiX size={16} /></button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{comment.content}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => handleCommentLike(comment.id, comment.is_liked)}
                        className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                          comment.is_liked ? "text-coral-500" : "text-gray-400 hover:text-coral-500"
                        }`}
                      >
                        <FiHeart size={13} className={comment.is_liked ? "fill-current" : ""} />
                        {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                      </button>
                    </div>
                  </div>

                  {(isCommentOwner || canDelete) && !isEditing && (
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === comment.id ? null : comment.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                      >
                        <FiMoreVertical size={15} />
                      </button>
                      {menuOpenId === comment.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpenId(null)} />
                          <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl py-1">
                            {isPostOwner && !comment.pinned && (
                              <button onClick={() => { handlePinComment(comment.id); setMenuOpenId(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-tide-500"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" /></svg>
                                Pin comment
                              </button>
                            )}
                            {isCommentOwner && (
                              <button onClick={() => startEdit(comment)} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-left">
                                <FiEdit2 size={14} className="text-blue-500" /> Edit
                              </button>
                            )}
                            {canDelete && (
                              <button onClick={() => { handleDeleteComment(comment.id); setMenuOpenId(null); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left">
                                <FiTrash2 size={14} /> Delete
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
