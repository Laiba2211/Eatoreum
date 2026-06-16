import jwt from "jsonwebtoken";

/**
 * Requires `Authorization: Bearer <JWT>` from admin login.
 * Sets `req.admin = { id, role }`.
 */
export function requireAdmin(req, res, next) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "Server misconfiguration: JWT_SECRET missing" });
  }

  try {
    const payload = jwt.verify(token, secret);
    req.admin = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
