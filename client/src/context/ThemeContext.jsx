import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/** Same key as `index.html` inline boot script — keep in sync. */
export const THEME_STORAGE_KEY = "eatoreum_theme";

const ThemeContext = createContext(null);

export function readStoredTheme() {
  if (typeof window === "undefined") return "dark";
  try {
    const s = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (s === "light" || s === "dark") return s;
  } catch {
    /* private mode / blocked storage */
  }
  return "dark";
}

function applyThemeToDocument(theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(readStoredTheme);

  /** DOM + localStorage always follow React state (navigation, toggle, etc.). */
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  /** Other tabs windows: keep this tab in sync. */
  useEffect(() => {
    function onStorage(e) {
      if (e.storageArea !== window.localStorage) return;
      if (e.key !== THEME_STORAGE_KEY || e.newValue == null) return;
      if (e.newValue === "light" || e.newValue === "dark") {
        setThemeState(e.newValue);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = useCallback((t) => {
    setThemeState(t === "light" ? "light" : "dark");
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
