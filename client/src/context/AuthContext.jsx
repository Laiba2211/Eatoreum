import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const SESSION_KEY = "eatoreum_demo_session";
const USERS_KEY = "eatoreum_demo_users";

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(readJSON(SESSION_KEY, null));
    setHydrated(true);
  }, []);

  const persistSession = useCallback((next) => {
    setUser(next);
    if (next) localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    else localStorage.removeItem(SESSION_KEY);
  }, []);

  const login = useCallback(
    (email, password) => {
      const users = readJSON(USERS_KEY, []);
      const e = email.trim().toLowerCase();
      const u = users.find((x) => x.email === e);
      if (!u || u.password !== password) {
        return { ok: false, error: "Invalid email or password." };
      }
      persistSession({ email: u.email, name: u.name });
      return { ok: true };
    },
    [persistSession]
  );

  const register = useCallback(
    (name, email, password) => {
      const users = readJSON(USERS_KEY, []);
      const e = email.trim().toLowerCase();
      if (users.some((x) => x.email === e)) {
        return { ok: false, error: "An account with this email already exists." };
      }
      const nextUsers = [...users, { name: name.trim(), email: e, password }];
      localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
      persistSession({ email: e, name: name.trim() });
      return { ok: true };
    },
    [persistSession]
  );

  const logout = useCallback(() => {
    persistSession(null);
  }, [persistSession]);

  const value = useMemo(
    () => ({ user, hydrated, login, register, logout }),
    [user, hydrated, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
