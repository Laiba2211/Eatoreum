import { getMailFrom, getMailTransporter, isMailerConfigured } from "../utils/mailer.js";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inboxTo() {
  return String(process.env.SMTP_USER ?? "").trim();
}

/** Prevent header / SMTP injection in subject lines. */
function oneLine(s, max) {
  return String(s)
    .replace(/[\r\n\u0000]/g, " ")
    .trim()
    .slice(0, max);
}

/** POST /api/contact — public; emails admin inbox (SMTP_USER). */
export async function submitContact(req, res) {
  try {
    const raw = req.body ?? {};
    const name = oneLine(raw.name ?? "", 120);
    const email = String(raw.email ?? "").trim();
    const message = String(raw.message ?? "").trim();
    const subjectLine = oneLine(raw.subject ?? "", 200);

    if (!name || name.length > 120) {
      return res.status(400).json({ message: "Name is required (max 120 characters)." });
    }
    if (!email || !EMAIL_RX.test(email)) {
      return res.status(400).json({ message: "A valid email address is required." });
    }
    if (message.length < 10) {
      return res.status(400).json({ message: "Message must be at least 10 characters." });
    }
    if (message.length > 5000) {
      return res.status(400).json({ message: "Message is too long (max 5000 characters)." });
    }
    if (subjectLine.length > 200) {
      return res.status(400).json({ message: "Subject is too long (max 200 characters)." });
    }

    if (!isMailerConfigured()) {
      return res.status(503).json({
        message: "Contact form is not available. Please try again later or email the shop directly.",
      });
    }

    const to = inboxTo();
    if (!to) {
      return res.status(503).json({ message: "Contact form is not configured." });
    }

    const transport = getMailTransporter();
    if (!transport) {
      return res.status(503).json({ message: "Contact form is not available." });
    }

    const subject = subjectLine
      ? oneLine(`[Eatoreum Contact] ${subjectLine} — ${name}`, 250)
      : oneLine(`[Eatoreum Contact] Message from ${name}`, 250);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMsg = escapeHtml(message).replace(/\r?\n/g, "<br>");

    const html = `<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b;padding:24px;background:#fafafa">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:24px">
    <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#a16207">Website contact</p>
    <h1 style="margin:0 0 16px;font-size:20px">New message</h1>
    <table style="width:100%;font-size:14px;margin-bottom:16px">
      <tr><td style="padding:6px 0;color:#71717a;width:90px">Name</td><td style="padding:6px 0"><strong>${safeName}</strong></td></tr>
      <tr><td style="padding:6px 0;color:#71717a">Email</td><td style="padding:6px 0"><a href="mailto:${safeEmail}">${safeEmail}</a></td></tr>
    </table>
    <h2 style="font-size:13px;margin:0 0 8px;color:#52525b">Message</h2>
    <div style="font-size:14px;color:#27272a;border:1px solid #e4e4e7;border-radius:8px;padding:14px;background:#fafafa">${safeMsg}</div>
  </div>
</body></html>`;

    const text = `New contact form message\n\nName: ${name}\nEmail: ${email}\n\n${message}\n`;

    await transport.sendMail({
      from: getMailFrom(),
      to,
      replyTo: { name: name.slice(0, 70) || "Contact form", address: email },
      subject,
      text,
      html,
    });

    return res.status(200).json({ ok: true, message: "Thanks — we received your message and will get back to you soon." });
  } catch (err) {
    console.error("[contact]", err);
    return res.status(500).json({ message: "Could not send your message. Please try again later." });
  }
}
