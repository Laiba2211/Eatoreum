import {
  FiGrid,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiSettings,
  FiMessageSquare,
} from "react-icons/fi";

/** Sidebar navigation — paths are relative to admin app root. */
export const adminNavItems = [
  { to: "/dashboard", label: "Dashboard", icon: FiGrid },
  { to: "/orders", label: "Orders", icon: FiShoppingBag },
  { to: "/products", label: "Products", icon: FiPackage },
  { to: "/reviews", label: "Reviews", icon: FiMessageSquare },
  { to: "/customers", label: "Customers", icon: FiUsers },
  { to: "/settings", label: "Settings", icon: FiSettings },
];
