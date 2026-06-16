import { Navigate, useLocation } from "react-router-dom";
import AdminLayout from "./AdminLayout.jsx";
import { getAdminToken } from "../pages/login/services/loginApi.js";

/** Renders sidebar shell only when an admin JWT exists in `localStorage`. */
function ProtectedAdminLayout() {
  const location = useLocation();
  const token = getAdminToken();

  if (!token) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <AdminLayout />;
}

export default ProtectedAdminLayout;
