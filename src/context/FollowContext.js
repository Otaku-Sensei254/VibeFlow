import { createContext, useContext, useState, useCallback } from "react";

const FollowContext = createContext(null);

export function FollowProvider({ children }) {
  const [followedUsers, setFollowedUsers] = useState({});

  const setFollowing = useCallback((userId, following) => {
    setFollowedUsers((prev) => {
      if (following) {
        if (prev[userId]) return prev;
        return { ...prev, [userId]: true };
      }
      if (!prev[userId]) return prev;
      const next = { ...prev };
      delete next[userId];
      return next;
    });
  }, []);

  return (
    <FollowContext.Provider value={{ followedUsers, setFollowing }}>
      {children}
    </FollowContext.Provider>
  );
}

export function useFollow() {
  const ctx = useContext(FollowContext);
  if (!ctx) throw new Error("useFollow must be used within FollowProvider");
  return ctx;
}
