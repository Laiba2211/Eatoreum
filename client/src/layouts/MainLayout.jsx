import { Outlet } from "react-router-dom";
import CartDrawer from "../components/CartDrawer";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ScrollToTop from "../components/ScrollToTop";

function MainLayout() {
  return (
    <div className="min-h-screen bg-(--soft-black) text-(--cream) flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

export default MainLayout;
