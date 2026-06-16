import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import RequireAuth from "./components/RequireAuth";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const ShopPage = lazy(() => import("./pages/Shop/ShopPage.jsx"));
const ProductDetailPage = lazy(() => import("./pages/Shop/ProductDetailPage.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Contact = lazy(() => import("./pages/contact/Contact.jsx"));
const CartPage = lazy(() => import("./pages/Cart/CartPage.jsx"));
const CheckoutPage = lazy(() => import("./pages/Cart/CheckoutPage.jsx"));
const ComingSoonPage = lazy(() => import("./pages/ComingSoonPage.jsx"));
const AccountLayout = lazy(() => import("./layouts/AccountLayout.jsx"));
const DashboardPage = lazy(() => import("./pages/account/DashboardPage.jsx"));
const ProfilePage = lazy(() => import("./pages/account/ProfilePage.jsx"));
const OrderHistoryPage = lazy(() => import("./pages/account/OrderHistoryPage.jsx"));
const OrderDetailPage = lazy(() => import("./pages/account/OrderDetailPage.jsx"));

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-6 text-sm text-(--oat)">
      Loading…
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductDetailPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/offers" element={<ComingSoonPage />} />

          <Route element={<RequireAuth />}>
            <Route path="/account" element={<AccountLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="orders" element={<OrderHistoryPage />} />
              <Route path="orders/:orderId" element={<OrderDetailPage />} />
            </Route>
          </Route>

          <Route path="*" element={<ComingSoonPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
