import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import api from "../utils/api";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [halloweenEnabled, setHalloweenEnabledState] = useState(true);
  const [halloweenThemeLoading, setHalloweenThemeLoading] = useState(true);
  const [halloweenThemeLoadError, setHalloweenThemeLoadError] = useState(false);
  const halloweenRequestId = useRef(0);
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
    const requestId = ++halloweenRequestId.current;
    try {
      const response = await api.get("/site/theme");
      const enabled = response.data.data?.halloween_enabled;
      if (typeof enabled !== "boolean") {
        throw new Error("Theme settings response did not include a boolean value");
      }
      if (requestId === halloweenRequestId.current) {
        setHalloweenEnabledState(enabled);
        setHalloweenThemeLoadError(false);
      }
    } catch {
      if (requestId === halloweenRequestId.current) {
        setHalloweenThemeLoadError(true);
      }
    } finally {
      if (requestId === halloweenRequestId.current) {
        setHalloweenThemeLoading(false);
      }
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
    const savedValue = response.data.data?.halloween_enabled;
    if (typeof savedValue !== "boolean") {
      throw new Error("Theme settings response did not include a boolean value");
    }
    // Ignore any GET that began before this successful save.
    halloweenRequestId.current += 1;
    setHalloweenEnabledState(savedValue);
    setHalloweenThemeLoadError(false);
    return savedValue;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        halloweenEnabled,
        halloweenThemeLoading,
        halloweenThemeLoadError,
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
