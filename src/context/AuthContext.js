import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { connectSocket, disconnectSocket, joinChannel, setStatusChangeCallback } from "../utils/realtime";
import { showToast } from "../utils/toast";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [connectionStatus, setConnectionStatus] = useState(() => {
    return localStorage.getItem("token") ? "connecting" : "disconnected";
  });
  const [sidebarRefresh, setSidebarRefresh] = useState(0);
  const [showPresence, setShowPresenceState] = useState(() => {
    return localStorage.getItem("vibeflow_show_presence") !== "false";
  });

  const setShowPresence = (val) => {
    localStorage.setItem("vibeflow_show_presence", String(val));
    setShowPresenceState(val);
  };

  const fetchCounts = useCallback(async () => {
    try {
      const [notifRes, chatRes] = await Promise.all([
        api.get("/notifications").catch(() => null),
        api.get("/chat/unread-count").catch(() => null),
      ]);
      if (notifRes?.data?.data?.unread_count !== undefined) {
        setNotificationCount(notifRes.data.data.unread_count);
      }
      if (chatRes?.data?.data?.unread_count !== undefined) {
        setChatUnreadCount(chatRes.data.data.unread_count);
      }
    } catch {}
  }, []);

  const setupRealtime = useCallback((token) => {
    setStatusChangeCallback(setConnectionStatus);
    setConnectionStatus("connecting");

    connectSocket(token, () => {
      joinChannel("relay:user", {
        new_notification: () => {
          setNotificationCount((c) => c + 1);
        },
        update_notifications: () => {
          fetchCounts();
        },
        new_sidebar_message: (payload) => {
          fetchCounts();
          setSidebarRefresh((c) => c + 1);
          if (
            payload?.user &&
            payload?.content &&
            payload.user_id !== user?.id &&
            !window.location.pathname.startsWith(`/chat/${payload.conversation_uuid}`)
          ) {
            showToast({
              title: payload.user.username,
              message: payload.content,
              link: `/chat/${payload.conversation_uuid}`,
              linkText: "Open chat",
              duration: 8000,
            });
          }
        },
        update_sidebar: () => {
          fetchCounts();
          setSidebarRefresh((c) => c + 1);
        },
        points_awarded: (payload) => {
          if (!payload || !payload.amount) return;
          setUser((prev) => {
            if (!prev) return prev;
            const updated = { ...prev, points: (prev.points || 0) + payload.amount };
            localStorage.setItem("user", JSON.stringify(updated));
            return updated;
          });
          const amount = payload.amount;
          showToast({
            type: "success",
            title: `+${amount} pts`,
            message: `You earned ${amount} point${amount !== 1 ? "s" : ""}!`,
            duration: 4000,
          });
        },
        // Backend always pushes the full authoritative presence_state on both
        // initial join AND every presence_diff – so we just replace state here.
        presence_state: (state) => {
          if (!state) return;
          const ids = {};
          Object.keys(state).forEach((id) => (ids[id] = true));
          setOnlineUsers(ids);
        },
      });
      fetchCounts();
    });
  }, [fetchCounts]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .get("/auth/me")
        .then((res) => {
          const u = res.data.data.user;
          setUser(u);
          localStorage.setItem("user", JSON.stringify(u));
          setupRealtime(token);
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    return () => disconnectSocket();
  }, [setupRealtime]);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, user: u } = res.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
    setupRealtime(token);
    return u;
  };

  const register = async (userData) => {
    const res = await api.post("/auth/register", { user: userData });
    const { token, user: u } = res.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
    setupRealtime(token);
    return u;
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    disconnectSocket();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setNotificationCount(0);
    setChatUnreadCount(0);
  };

  const updateUser = (u) => {
    setUser(u);
    localStorage.setItem("user", JSON.stringify(u));
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser, notificationCount, chatUnreadCount, fetchCounts, onlineUsers, connectionStatus, sidebarRefresh, showPresence, setShowPresence }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
