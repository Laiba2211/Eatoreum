import { getMailFrom, getMailTransporter, isMailerConfigured } from "../utils/mailer.js";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function oneLine(s, max) {
  return String(s)
    .replace(/[\r\n\u0000]/g, " ")
    .trim()
    .slice(0, max);
}

/** Receives “new subscriber” alerts — defaults to SMTP_USER when unset. */
function newsletterNotifyInbox() {
  const explicit = String(process.env.NEWSLETTER_NOTIFY_EMAIL ?? "").trim();
  if (explicit) return explicit.toLowerCase();
  return String(process.env.SMTP_USER ?? "").trim().toLowerCase();
}

/** POST /api/newsletter/subscribe — public; emails shop inbox + subscriber (SMTP_*). */
export async function subscribe(req, res) {
  try {
    const raw = req.body ?? {};
    const email = String(raw.email ?? "").trim().toLowerCase();

    if (!email || !EMAIL_RX.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    if (!isMailerConfigured()) {
      return res.status(503).json({
        message: "Newsletter signup is not available right now. Please try again later.",
      });
    }

    const toShop = newsletterNotifyInbox();
    if (!toShop) {
      return res.status(503).json({ message: "Newsletter is not configured." });
    }

    const transport = getMailTransporter();
    if (!transport) {
      return res.status(503).json({ message: "Newsletter is not available." });
    }

    const safeEmail = escapeHtml(email);
    const storeUrl = String(process.env.STORE_PUBLIC_URL ?? "").trim().replace(/\/$/, "");

    const shopSubject = oneLine("[Eatoreum] New newsletter subscriber", 200);
    const shopHtml = `<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b;padding:24px;background:#fafafa">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:24px">
    <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#a16207">Newsletter</p>
    <h1 style="margin:0 0 16px;font-size:20px">New signup</h1>
    <p style="font-size:14px;color:#27272a">Someone subscribed from the website footer.</p>
    <p style="margin-top:16px;font-size:14px"><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
  </div>
</body></html>`;
    const shopText = `New newsletter subscriber\n\nEmail: ${email}\n`;

    await transport.sendMail({
      from: getMailFrom(),
      to: toShop,
      replyTo: email,
      subject: shopSubject,
      text: shopText,
      html: shopHtml,
    });

    const welcomeSubject = oneLine("You're on the Eatoreum list", 200);
    const welcomeHtml = `<!DOCTYPE html>
<html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b;padding:24px;background:#fafafa">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:24px">
    <p style="margin:0 0 8px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:#a16207">Eatoreum</p>
    <h1 style="margin:0 0 16px;font-size:20px">Thanks for subscribing</h1>
    <p style="font-size:14px;color:#27272a">You&apos;ll get updates about fresh deals, recipes, and discounts.</p>
    ${
      storeUrl
        ? `<p style="margin-top:20px;font-size:14px"><a href="${escapeHtml(storeUrl)}" style="color:#a16207;font-weight:600">Visit the shop</a></p>`
        : ""
    }
  </div>
</body></html>`;
    const welcomeText = `Thanks for subscribing to Eatoreum.\n\nYou'll hear from us with deals and updates.${storeUrl ? `\n\nShop: ${storeUrl}` : ""}\n`;

    await transport.sendMail({
      from: getMailFrom(),
      to: email,
      subject: welcomeSubject,
      text: welcomeText,
      html: welcomeHtml,
    });

    return res.status(200).json({
      ok: true,
      message: "Thanks — check your inbox for a confirmation email.",
    });
  } catch (err) {
    console.error("[newsletter]", err);
    return res.status(500).json({ message: "Could not complete signup. Please try again later." });
  }
}
