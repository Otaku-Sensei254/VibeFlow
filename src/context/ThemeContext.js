import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [halloweenEnabled, setHalloweenEnabledState] = useState(true);
  const [halloweenThemeLoading, setHalloweenThemeLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("vibeflow-theme");
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("vibeflow-theme", theme);
  }, [theme]);

  const refreshHalloweenTheme = useCallback(async () => {
    try {
      const response = await api.get("/site/theme");
      setHalloweenEnabledState(response.data.data?.halloween_enabled !== false);
    } catch {
      // Keep the seasonal look on if settings are temporarily unavailable.
    } finally {
      setHalloweenThemeLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshHalloweenTheme();
    const interval = window.setInterval(refreshHalloweenTheme, 5 * 60 * 1000);
    window.addEventListener("focus", refreshHalloweenTheme);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshHalloweenTheme);
    };
  }, [refreshHalloweenTheme]);

  useEffect(() => {
    document.documentElement.classList.toggle("halloween-theme", halloweenEnabled);
  }, [halloweenEnabled]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const setHalloweenEnabled = async (enabled) => {
    const response = await api.put("/admin/halloween-theme", { enabled });
    const savedValue = response.data.data?.halloween_enabled === true;
    setHalloweenEnabledState(savedValue);
    return savedValue;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        halloweenEnabled,
        halloweenThemeLoading,
        setHalloweenEnabled,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
