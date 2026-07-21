import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { FiAnchor, FiSend, FiX, FiClock, FiMessageCircle, FiLoader } from "react-icons/fi";
import { showToast } from "../utils/toast";

function timeRemaining(expiresAt) {
  if (!expiresAt) return "";
  const diff = new Date(expiresAt) - new Date();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (hours > 0) return `${hours}h ${mins}m left`;
  return `${mins}m left`;
}

export default function Bottles() {
  const { user } = useAuth();
  const [bottles, setBottles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDrop, setShowDrop] = useState(false);
  const [bottleContent, setBottleContent] = useState("");
  const [dropping, setDropping] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setShowDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchBottles = async () => {
    try {
      const res = await api.get("/bottles");
      setBottles(res.data.data?.bottles || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchBottles(); }, []);

  const handleDrop = async () => {
    if (!bottleContent.trim() || dropping) return;
    setDropping(true);
    try {
      await api.post("/bottles", { content: bottleContent.trim() });
      setBottleContent("");
      setShowDrop(false);
      showToast({ title: "Bottle dropped!", message: "Your message is now adrift in the sea.", type: "success", duration: 4000 });
      fetchBottles();
    } catch {
      showToast({ title: "Failed", message: "Couldn't drop your bottle. Try again.", type: "error", duration: 4000 });
    }
    setDropping(false);
  };

  const handleReply = async (bottleId) => {
    if (!replyContent.trim() || replying) return;
    setReplying(true);
    try {
      await api.post(`/bottles/${bottleId}/reply`, { content: replyContent.trim() });
      setReplyContent("");
      setReplyTo(null);
      showToast({ title: "Reply sent!", message: "Your reply was delivered.", type: "success", duration: 4000 });
    } catch {
      showToast({ title: "Failed", message: "Couldn't send reply.", type: "error", duration: 4000 });
    }
    setReplying(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <FiAnchor className="text-amber-600 dark:text-amber-400" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Messages in a Bottle</h1>
            <p className="text-xs text-gray-500">Anonymous messages that expire in 24h</p>
          </div>
        </div>
        {user && (
          <button
            onClick={() => setShowDrop(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-md shadow-amber-200 dark:shadow-amber-900/30"
          >
            <FiSend size={14} />
            Drop a bottle
          </button>
        )}
      </div>

      {/* Drop modal */}
      {showDrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowDrop(false)} />
          <div ref={dropRef} className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Drop a bottle into the sea</h3>
              <button onClick={() => setShowDrop(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiX size={18} />
              </button>
            </div>
            <textarea
              value={bottleContent}
              onChange={(e) => setBottleContent(e.target.value)}
              placeholder="Write an anonymous message... (max 280 chars)"
              maxLength={280}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none mb-3"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">{bottleContent.length}/280</span>
              <button
                onClick={handleDrop}
                disabled={!bottleContent.trim() || dropping}
                className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              >
                {dropping ? <FiLoader className="animate-spin" size={15} /> : <FiAnchor size={15} />}
                {dropping ? "Dropping..." : "Drop into sea"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply modal */}
      {replyTo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setReplyTo(null)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Reply to bottle</h3>
              <button onClick={() => setReplyTo(null)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiX size={18} />
              </button>
            </div>
            <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl text-sm text-gray-600 dark:text-gray-400 italic border border-gray-200 dark:border-gray-700">
              &ldquo;{replyTo.content}&rdquo;
            </div>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
              maxLength={280}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none mb-3"
              autoFocus
            />
            <div className="flex justify-end">
              <button
                onClick={() => handleReply(replyTo.id)}
                disabled={!replyContent.trim() || replying}
                className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-tide-600 to-flow-600 text-white text-sm font-semibold rounded-xl hover:from-tide-700 hover:to-flow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {replying ? <FiLoader className="animate-spin" size={15} /> : <FiSend size={15} />}
                {replying ? "Sending..." : "Send reply"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottle list */}
      {loading ? (
        <div className="flex justify-center py-20">
          <FiLoader className="animate-spin text-amber-500" size={28} />
        </div>
      ) : bottles.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center">
            <FiAnchor className="text-amber-300 dark:text-amber-600" size={32} />
          </div>
          <p className="text-gray-500 text-lg font-medium mb-1">The sea is empty</p>
          <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
            No bottles have been dropped yet. Be the first to send a message into the unknown.
          </p>
          {user ? (
            <button
              onClick={() => setShowDrop(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-semibold hover:from-amber-600 hover:to-orange-600 transition-all shadow-md"
            >
              <FiSend size={15} />
              Drop the first bottle
            </button>
          ) : (
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-tide-600 to-flow-600 text-white rounded-xl text-sm font-semibold hover:from-tide-700 hover:to-flow-700 transition-all"
            >
              Join to drop a bottle
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {bottles.map((bottle) => (
            <div
              key={bottle.id}
              className="group bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-coral-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <FiAnchor size={14} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {bottle.content}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiClock size={12} />
                      {timeRemaining(bottle.expires_at)}
                    </span>
                    {bottle.reply_count > 0 && (
                      <span className="flex items-center gap-1">
                        <FiMessageCircle size={12} />
                        {bottle.reply_count} {bottle.reply_count === 1 ? "reply" : "replies"}
                      </span>
                    )}
                  </div>
                  {user && (
                    <button
                      onClick={() => setReplyTo(bottle)}
                      className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline transition"
                    >
                      Reply
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}