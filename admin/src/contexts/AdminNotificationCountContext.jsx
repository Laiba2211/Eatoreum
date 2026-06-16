import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getUnreadNotificationCount } from "../pages/notifications/services/notificationsApi.js";

const AdminNotificationCountContext = createContext(null);

export function AdminNotificationCountProvider({ children }) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const data = await getUnreadNotificationCount();
      setUnreadCount(Number(data.unreadCount) || 0);
    } catch {
      /* ignore — e.g. expired token */
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const interval = setInterval(() => void refresh(), 45000);
    const onVis = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  const value = useMemo(() => ({ unreadCount, refresh }), [unreadCount, refresh]);

  return (
    <AdminNotificationCountContext.Provider value={value}>{children}</AdminNotificationCountContext.Provider>
  );
}

export function useAdminNotificationCount() {
  const ctx = useContext(AdminNotificationCountContext);
  if (!ctx) {
    throw new Error("useAdminNotificationCount must be used within AdminNotificationCountProvider");
  }
  return ctx;
}
