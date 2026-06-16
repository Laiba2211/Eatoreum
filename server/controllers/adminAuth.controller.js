import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

function signAdminToken(admin) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return jwt.sign(
    { sub: admin._id.toString(), role: admin.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

export async function login(req, res) {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const ok = await admin.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = signAdminToken(admin);

    return res.json({
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (err) {
    if (err.message === "JWT_SECRET is not set") {
      return res.status(500).json({ message: "Server misconfiguration" });
    }
    console.error(err);
    return res.status(500).json({ message: "Login failed" });
  }
}

export async function me(req, res) {
  try {
    const admin = await Admin.findById(req.admin.id).select("-passwordHash");
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    return res.json({ admin });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to load profile" });
  }
}
