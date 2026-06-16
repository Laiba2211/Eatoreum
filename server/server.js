import path from "path";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import { closeRedis } from "./config/redis.js";
import adminAuthRoutes from "./routes/adminAuth.routes.js";
import adminProductsRoutes from "./routes/adminProducts.routes.js";
import adminOrdersRoutes from "./routes/adminOrders.routes.js";
import adminCustomersRoutes from "./routes/adminCustomers.routes.js";
import adminDashboardRoutes from "./routes/adminDashboard.routes.js";
import adminReviewsRoutes from "./routes/adminReviews.routes.js";
import adminNotificationsRoutes from "./routes/adminNotifications.routes.js";
import adminUploadRoutes from "./routes/adminUpload.routes.js";
import adminCategoriesRoutes from "./routes/adminCategories.routes.js";
import categoriesRoutes from "./routes/categories.routes.js";
import productReviewsRoutes from "./routes/productReviews.routes.js";
import productsRoutes from "./routes/products.routes.js";
import storeCartRoutes from "./routes/storeCart.routes.js";
import storeOrdersRoutes from "./routes/storeOrders.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import newsletterRoutes from "./routes/newsletter.routes.js";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("FATAL: JWT_SECRET is not set. Copy server/.env.example into .env and set JWT_SECRET.");
  process.exit(1);
}

connectDB();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/upload", adminUploadRoutes);
app.use("/api/admin/categories", adminCategoriesRoutes);
app.use("/api/admin/products", adminProductsRoutes);
app.use("/api/admin/orders", adminOrdersRoutes);
app.use("/api/admin/customers", adminCustomersRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/admin/reviews", adminReviewsRoutes);
app.use("/api/admin/notifications", adminNotificationsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productReviewsRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", storeCartRoutes);
app.use("/api/orders", storeOrdersRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/newsletter", newsletterRoutes);

app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (req, res) => {
  res.type("html").send(`<!doctype html><html><body style="font-family:sans-serif;padding:2rem;background:#09090b;color:#fafafa">
    <h1>Eatoreum API</h1>
    <p>Admin login UI: <a href="/admin/login.html" style="color:#f59e0b">/admin/login.html</a></p>
    <p>POST <code>/api/admin/auth/login</code> · GET <code>/api/admin/auth/me</code> (Bearer token)</p>
    <p>Store catalog: GET <code>/api/categories</code> · GET <code>/api/products</code> · GET <code>/api/products/:idOrSlug</code> · GET/POST <code>/api/products/:idOrSlug/reviews</code> · POST <code>/api/products/:idOrSlug/reviews/:reviewId/replies</code></p>
    <p>Admin catalog (Bearer): CRUD <code>/api/admin/products</code></p>
    <p>Admin orders (Bearer): GET <code>/api/admin/orders</code> · GET <code>/api/admin/orders/:id</code></p>
    <p>Admin customers (Bearer): GET <code>/api/admin/customers</code> · GET <code>/api/admin/customers/:id</code></p>
    <p>Admin reviews (Bearer): GET <code>/api/admin/reviews</code> · DELETE <code>/api/admin/reviews/:reviewId</code> · DELETE <code>/api/admin/reviews/:reviewId/replies/:replyId</code></p>
    <p>Admin notifications (Bearer): GET <code>/api/admin/notifications</code> · GET <code>/api/admin/notifications/unread-count</code> · PATCH <code>/api/admin/notifications/:id/read</code> · POST <code>/api/admin/notifications/read-all</code></p>
    <p>Admin dashboard (Bearer): GET <code>/api/admin/dashboard</code></p>
    <p>Store cart: POST <code>/api/cart/validate</code> · Orders: POST <code>/api/orders</code> (COD)</p>
    <p>Contact (public): POST <code>/api/contact</code> JSON <code>name, email, message</code> optional <code>subject</code> — requires SMTP_* in .env</p>
    <p>Newsletter (public): POST <code>/api/newsletter/subscribe</code> JSON <code>email</code> — notifies <code>NEWSLETTER_NOTIFY_EMAIL</code> or <code>SMTP_USER</code>; sends confirmation to subscriber</p>
  </body></html>`);
});

app.get("/admin", (req, res) => {
  res.redirect(302, "/admin/login.html");
});

const PORT = process.env.PORT || 5000;

async function shutdown(signal) {
  console.log(`\n${signal}: closing Redis (if used)…`);
  try {
    await closeRedis();
  } catch {
    /* ignore */
  }
  process.exit(0);
}
process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.REDIS_URL) {
    console.log(`Redis configured (${process.env.REDIS_URL}) — cache activates only after a successful Redis connection.`);
  }
});
