import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onChannel } from "../utils/realtime";
import { FiX, FiHeart, FiMessageCircle, FiUserPlus, FiRepeat, FiAtSign, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const NOTIF_ICONS = {
  like: { icon: FiHeart, color: "text-coral-500" },
  comment: { icon: FiMessageCircle, color: "text-tide-500" },
  follow: { icon: FiUserPlus, color: "text-green-500" },
  repost: { icon: FiRepeat, color: "text-green-500" },
  mention: { icon: FiAtSign, color: "text-flow-500" },
};

function getToastText(n) {
  const actor = n.actor?.username || "Someone";
  switch (n.type) {
    case "like": return `${actor} liked your post`;
    case "comment": return `${actor} commented on your post`;
    case "follow": return `${actor} followed you`;
    case "repost": return `${actor} reposted your post`;
    case "mention": return `${actor} mentioned you`;
    default: return `New notification from ${actor}`;
  }
}

function getIcon(type) {
  return NOTIF_ICONS[type] || { icon: FiHeart, color: "text-gray-500" };
}

export default function NotificationToast() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState([]);
  const timerRef = useRef(null);

  const dismiss = useCallback((id) => {
    setQueue((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    onChannel("relay:user", "new_notification", (n) => {
      if (!n) return;
      const id = n.id || Date.now();
      setQueue((prev) => {
        if (prev.some((item) => item.id === id)) return prev;
        return [...prev, { ...n, id }];
      });

      if (Notification.permission === "granted") {
        const body = getToastText(n);
        new Notification("Vibeflow", {
          body,
          icon: n.actor?.avatar_url || "/logo192.png",
          tag: `notif-${id}`,
        });
      }
    });
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const t = e.detail;
      setQueue((prev) => {
        if (prev.some((item) => item.id === t.id)) return prev;
        return [...prev, { ...t, _app: true }];
      });
    };
    window.addEventListener("app:toast", handler);
    return () => window.removeEventListener("app:toast", handler);
  }, []);

  useEffect(() => {
    if (queue.length === 0) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    const duration = queue[0].duration || 5000;
    timerRef.current = setTimeout(() => {
      setQueue((prev) => prev.slice(1));
    }, duration);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [queue]);

  if (queue.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[100] flex flex-col gap-2 max-w-sm w-auto pointer-events-none">
      {queue.map((n) => {
        if (n._app) {
          return (
            <div
              key={n.id}
              className="pointer-events-auto flex items-start gap-3 p-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl shadow-black/10 dark:shadow-black/30 transition-all duration-300 animate-slide-in-right"
            >
              <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${n.type === "error" ? "text-red-500" : "text-green-500"} bg-gray-100 dark:bg-gray-700`}>
                {n.type === "error" ? <FiAlertCircle size={16} /> : <FiCheckCircle size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                {n.title && <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{n.title}</p>}
                {n.message && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>}
                {n.link && n.linkText && (
                  <Link to={n.link} onClick={() => dismiss(n.id)} className="text-xs font-medium text-tide-600 dark:text-tide-400 hover:underline mt-1 inline-block">
                    {n.linkText}
                  </Link>
                )}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                className="shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX size={14} />
              </button>
            </div>
          );
        }

        const { icon: Icon, color } = getIcon(n.type);
        return (
          <div
            key={n.id}
            onClick={() => { dismiss(n.id); navigate("/notifications"); }}
            className="pointer-events-auto flex items-start gap-3 p-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl shadow-black/10 dark:shadow-black/30 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-all duration-300 animate-slide-in-right"
          >
            <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${color} bg-gray-100 dark:bg-gray-700`}>
              <Icon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-gray-100 font-medium leading-snug">
                {getToastText(n)}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
              className="shrink-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <FiX size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
