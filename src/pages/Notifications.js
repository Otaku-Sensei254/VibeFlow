import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { joinChannel, onChannel } from "../utils/realtime";
import { FiHeart, FiMessageCircle, FiRepeat, FiUserPlus, FiAtSign, FiFileText, FiUserCheck } from "react-icons/fi";

const NOTIF_ICONS = {
  like: { icon: FiHeart, color: "text-coral-500", bg: "bg-coral-50 dark:bg-coral-900/20" },
  comment: { icon: FiMessageCircle, color: "text-tide-500", bg: "bg-tide-50 dark:bg-tide-900/20" },
  follow: { icon: FiUserPlus, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
  repost: { icon: FiRepeat, color: "text-green-500", bg: "bg-green-50 dark:bg-green-900/20" },
  mention: { icon: FiAtSign, color: "text-flow-500", bg: "bg-flow-50 dark:bg-flow-900/20" },
  new_post: { icon: FiFileText, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
};

function getIcon(type) {
  return NOTIF_ICONS[type] || { icon: FiHeart, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-800" };
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  const normalized = dateStr.endsWith("Z") || dateStr.includes("+") ? dateStr : dateStr + "Z";
  const d = new Date(normalized);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

export default function Notifications() {
  const { user: currentUser, fetchCounts } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState({});

  const loadNotifications = useCallback(async () => {
    try {
      const res = await api.get("/notifications");
      setNotifications(res.data.data.notifications);
    } catch {}
    setLoading(false);
    fetchCounts();
  }, [fetchCounts]);

  useEffect(() => {
    loadNotifications();
    joinChannel("relay:user", {});
    onChannel("relay:user", "new_notification", (n) => {
      setNotifications((prev) => [n, ...prev]);
      fetchCounts();
    });
    onChannel("relay:user", "update_notifications", () => {
      loadNotifications();
    });
  }, [loadNotifications, fetchCounts]);

  const markRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
      fetchCounts();
    } catch {}
  };

  const getNotifLink = (n) => {
    if (n.type === "follow") return `/profile/${n.actor?.username}`;
    if (n.type === "shared_post") return n.conversation_uuid ? `/chat/${n.conversation_uuid}` : null;
    if (["like", "comment", "repost", "mention", "new_post", "post_ready"].includes(n.type)) {
      return n.post_uuid ? `/posts/${n.post_uuid}` : null;
    }
    return null;
  };

  const handleNotifClick = (n) => {
    markRead(n.id);
    const link = getNotifLink(n);
    if (link) navigate(link);
  };

  const handleFollowBack = async (e, actorUsername, notifId) => {
    e.stopPropagation();
    setFollowLoading((prev) => ({ ...prev, [notifId]: true }));
    try {
      await api.post(`/users/${actorUsername}/follow`);
    } catch {}
    setFollowLoading((prev) => ({ ...prev, [notifId]: false }));
  };

  const markAllRead = async () => {
    try {
      await api.post("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      fetchCounts();
    } catch {}
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-32 mb-6" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60">
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded-full w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="text-xs font-semibold bg-tide-600 text-white px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm font-medium text-tide-600 hover:text-tide-700 hover:underline transition"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-2">
        {notifications.map((n) => {
          const { icon: Icon, color, bg } = getIcon(n.type);
          const isUnread = !n.read_at;
          return (
            <div
              key={n.id}
              onClick={() => handleNotifClick(n)}
              className={`group relative flex items-start gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                isUnread
                  ? "bg-gradient-to-r from-tide-50/80 to-white dark:from-tide-900/15 dark:to-gray-800/80 border-tide-200 dark:border-tide-800/50 hover:shadow-md"
                  : "bg-white dark:bg-gray-800/60 border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800"
              }`}
            >
              <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${bg}`}>
                <Icon className={color} size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <img
                    src={n.actor?.avatar_url || `https://ui-avatars.com/api/?name=${n.actor?.username || "?"}&background=6366F1&color=fff&bold=true`}
                    alt=""
                    className="w-5 h-5 rounded-full shrink-0"
                  />
                  <p className="text-sm">
                    <strong className="font-semibold">{n.actor?.username}</strong>{" "}
                    <span className="text-gray-600 dark:text-gray-400">
                      {n.type === "like" ? "liked your post"
                        : n.type === "comment" ? "commented on your post"
                        : n.type === "follow" ? "followed you"
                        : n.type === "repost" ? "reposted your post"
                        : n.type === "mention" ? "mentioned you"
                        : n.type === "new_post" ? "posted something new"
                        : n.type === "shared_post" ? "shared a post with you"
                        : n.type}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-gray-400">
                    {formatTime(n.inserted_at)}
                  </p>
                  {n.type === "follow" && currentUser?.username !== n.actor?.username && (
                    <button
                      onClick={(e) => handleFollowBack(e, n.actor?.username, n.id)}
                      disabled={followLoading[n.id]}
                      className={`text-xs font-semibold flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors disabled:opacity-50 ${
                        followLoading[n.id]
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-400"
                          : "bg-tide-100 dark:bg-tide-900/30 text-tide-700 dark:text-tide-300 hover:bg-tide-200 dark:hover:bg-tide-800/50"
                      }`}
                    >
                      {followLoading[n.id] ? (
                        <span className="w-3 h-3 border border-tide-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <FiUserCheck size={11} />
                      )}
                      {followLoading[n.id] ? "Following" : "Follow back"}
                    </button>
                  )}
                </div>
              </div>
              {isUnread && (
                <span className="shrink-0 w-2.5 h-2.5 bg-tide-600 rounded-full mt-2 ring-2 ring-white dark:ring-gray-900" />
              )}
            </div>
          );
        })}
        {notifications.length === 0 && (
          <div className="text-center py-16">
            <FiHeart className="mx-auto text-gray-300 dark:text-gray-600 mb-3" size={40} />
            <p className="text-gray-500 text-lg mb-1">No notifications yet</p>
            <p className="text-gray-400 text-sm">When someone interacts with your posts, it'll show up here</p>
          </div>
        )}
      </div>
    </div>
  );
}