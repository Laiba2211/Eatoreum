/**
 * Creates the first admin user if none exists with the given email.
 * Run: npm run seed:admin
 *
 * Required env: ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI
 * Optional: ADMIN_NAME, ADMIN_ROLE (superadmin | admin)
 */
import "dotenv/config";
import connectDB from "../config/db.js";
import Admin, { hashPassword } from "../models/Admin.js";

async function run() {
  const emailRaw = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!emailRaw?.trim() || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD in .env before running seed:admin.");
    process.exit(1);
  }

  const email = emailRaw.toLowerCase().trim();

  await connectDB();

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`Admin already exists (${email}). Nothing to do.`);
    process.exit(0);
    return;
  }

  const passwordHash = await hashPassword(password);
  const name = process.env.ADMIN_NAME?.trim();
  const role = process.env.ADMIN_ROLE?.trim();

  await Admin.create({
    email,
    passwordHash,
    ...(name ? { name } : {}),
    ...(role === "superadmin" || role === "admin" ? { role } : {}),
  });

  console.log("Seeded admin user:");
  console.log(`  Email: ${email}`);
  if (name) console.log(`  Name:  ${name}`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
