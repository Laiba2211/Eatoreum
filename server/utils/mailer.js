import nodemailer from "nodemailer";

let transporter = null;

/** True when Nodemailer can send (set SMTP_* in .env). */
export function isMailerConfigured() {
  const host = String(process.env.SMTP_HOST ?? "").trim();
  const user = String(process.env.SMTP_USER ?? "").trim();
  const pass = String(process.env.SMTP_PASS ?? "").trim();
  return Boolean(host && user && pass);
}

export function getMailTransporter() {
  if (!isMailerConfigured()) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: String(process.env.SMTP_HOST).trim(),
      port: Number.parseInt(String(process.env.SMTP_PORT ?? "587"), 10) || 587,
      secure: String(process.env.SMTP_SECURE ?? "").toLowerCase() === "true",
      auth: {
        user: String(process.env.SMTP_USER).trim(),
        pass: String(process.env.SMTP_PASS).trim(),
      },
    });
  }
  return transporter;
}

/** Inbox that receives shop copies of order mail (same as SMTP auth user). */
export function getStoreNotifyEmail() {
  return String(process.env.SMTP_USER ?? "").trim().toLowerCase();
}

export function getMailFrom() {
  const from = String(process.env.MAIL_FROM ?? "").trim();
  if (from) return from;
  const user = String(process.env.SMTP_USER ?? "").trim();
  return user ? `Eatoreum <${user}>` : "Eatoreum";
}
