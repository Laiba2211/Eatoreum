import { getMailFrom, getMailTransporter, getStoreNotifyEmail, isMailerConfigured } from "./mailer.js";

const EMAIL_RX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatMoney(currency, amount) {
  const c = currency || "PKR";
  const n = Number(amount);
  if (!Number.isFinite(n)) return `${c} —`;
  return `${c} ${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function formatWhen(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" });
  } catch {
    return "—";
  }
}

function buildBlocks(shipping, order) {
  const lines = Array.isArray(order.items) ? order.items : [];
  const currency = order.currency || "PKR";
  const subtotal = order.subtotal;

  const rowsHtml = lines
    .map(
      (line) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5">${escapeHtml(line.name)} × ${Number(line.quantity) || 0}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:right">${formatMoney(currency, (Number(line.price) || 0) * (Number(line.quantity) || 0))}</td>
    </tr>`
    )
    .join("");

  const addr = [
    shipping.addressLine1,
    shipping.addressLine2,
    [shipping.city, shipping.state, shipping.postalCode].filter(Boolean).join(", "),
    shipping.country,
  ]
    .filter(Boolean)
    .map((x) => escapeHtml(x))
    .join("<br>");

  const storeUrl = String(process.env.STORE_PUBLIC_URL ?? "").trim().replace(/\/$/, "");
  const footerLink = storeUrl
    ? `<p style="margin-top:24px"><a href="${escapeHtml(storeUrl)}" style="color:#b45309">Visit our store</a></p>`
    : "";

  const textLines = lines
    .map((line) => `  - ${line.name} x${line.quantity}  ${formatMoney(currency, (Number(line.price) || 0) * (Number(line.quantity) || 0))}`)
    .join("\n");

  const deliveryText = [shipping.addressLine1, shipping.addressLine2, `${shipping.city}, ${shipping.state} ${shipping.postalCode}`, shipping.country]
    .filter(Boolean)
    .join("\n");

  return {
    currency,
    subtotal,
    rowsHtml,
    addr,
    footerLink,
    textLines,
    deliveryText,
    orderNumber: order.orderNumber,
    orderId: order.id != null ? String(order.id) : "",
    placedAt: order.createdAt,
    paymentMethod: order.paymentMethod || "cod",
    status: order.status || "pending",
  };
}

function buildCustomerHtml(shipping, order) {
  const b = buildBlocks(shipping, order);
  const orderNumber = escapeHtml(b.orderNumber);
  const fullName = escapeHtml(shipping.fullName);

  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b;background:#fafafa;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e4e4e7;border-radius:12px;padding:28px">
    <p style="margin:0 0 8px;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#78716c">Order confirmed</p>
    <h1 style="margin:0 0 8px;font-size:22px;color:#09090b">Thank you, ${fullName}</h1>
    <p style="margin:0 0 20px;color:#52525b">We received your order <strong>#${orderNumber}</strong> (cash on delivery). We will contact you if anything changes.</p>
    <h2 style="font-size:14px;margin:24px 0 8px;color:#09090b">Items</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <thead><tr><th style="text-align:left;padding:8px 12px;border-bottom:2px solid #e4e4e7">Product</th><th style="text-align:right;padding:8px 12px;border-bottom:2px solid #e4e4e7">Line total</th></tr></thead>
      <tbody>${b.rowsHtml || `<tr><td colspan="2" style="padding:12px;color:#71717a">No line items</td></tr>`}</tbody>
    </table>
    <p style="margin-top:16px;font-size:16px;font-weight:600">Total: ${formatMoney(b.currency, b.subtotal)}</p>
    <h2 style="font-size:14px;margin:24px 0 8px;color:#09090b">Delivery address</h2>
    <p style="margin:0;color:#3f3f46;font-size:14px">${b.addr}</p>
    <p style="margin-top:12px;font-size:14px;color:#3f3f46"><strong>Phone:</strong> ${escapeHtml(shipping.phone)}</p>
    ${b.footerLink}
  </div>
</body>
</html>`;
}

function buildCustomerText(shipping, order) {
  const b = buildBlocks(shipping, order);
  return `Thank you, ${shipping.fullName}

We received your order #${b.orderNumber} (cash on delivery).

Items:
${b.textLines || "  (none)"}

Total: ${formatMoney(b.currency, b.subtotal)}

Delivery:
${b.deliveryText}
Phone: ${shipping.phone}
`;
}

/** Internal “new order” notice for the shop inbox — not the customer-facing template. */
function buildStoreOrderReceivedHtml(shipping, order) {
  const b = buildBlocks(shipping, order);
  const orderNumber = escapeHtml(b.orderNumber);
  const fullName = escapeHtml(shipping.fullName);
  const custEmail = String(shipping.email ?? "").trim();
  const emailBlock = custEmail
    ? `<tr><td style="padding:6px 0;color:#52525b;width:120px">Email</td><td style="padding:6px 0">${escapeHtml(custEmail)}</td></tr>`
    : `<tr><td colspan="2" style="padding:6px 0;color:#78716c;font-size:13px">No email on checkout.</td></tr>`;

  const adminBase = String(process.env.ADMIN_APP_URL ?? "").trim().replace(/\/$/, "");
  const adminLink =
    adminBase && b.orderId
      ? `<p style="margin-top:16px"><a href="${escapeHtml(adminBase)}/orders/${escapeHtml(b.orderId)}" style="display:inline-block;padding:10px 16px;background:#18181b;color:#fafafa;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600">Open in admin</a></p>`
      : b.orderId
        ? `<p style="margin-top:12px;font-size:12px;color:#78716c">Order ID (admin): <code style="background:#f4f4f5;padding:2px 6px;border-radius:4px">${escapeHtml(b.orderId)}</code></p>`
        : "";

  return `<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;line-height:1.5;color:#18181b;background:#f4f4f5;padding:24px">
  <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #d4d4d8;border-radius:12px;padding:28px;box-shadow:0 1px 3px rgba(0,0,0,.06)">
    <p style="margin:0 0 6px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;color:#a16207">Eatoreum · Shop</p>
    <h1 style="margin:0 0 8px;font-size:24px;color:#09090b">New order received</h1>
    <p style="margin:0 0 20px;font-size:15px;color:#3f3f46">Someone placed an order on the storefront. Fulfillment details below.</p>

    <table style="width:100%;margin-bottom:20px;font-size:14px;border-collapse:collapse;background:#fafafa;border-radius:8px;padding:16px">
      <tr><td style="padding:6px 12px;color:#52525b;width:130px">Order</td><td style="padding:6px 12px"><strong style="font-family:ui-monospace,monospace">${orderNumber}</strong></td></tr>
      <tr><td style="padding:6px 12px;color:#52525b">Placed</td><td style="padding:6px 12px">${escapeHtml(formatWhen(b.placedAt))}</td></tr>
      <tr><td style="padding:6px 12px;color:#52525b">Payment</td><td style="padding:6px 12px;text-transform:uppercase">${escapeHtml(String(b.paymentMethod))}</td></tr>
      <tr><td style="padding:6px 12px;color:#52525b">Status</td><td style="padding:6px 12px;text-transform:capitalize">${escapeHtml(String(b.status))}</td></tr>
    </table>

    <h2 style="font-size:13px;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.06em;color:#71717a">Customer</h2>
    <table style="width:100%;margin-bottom:22px;font-size:14px">
      <tr><td style="padding:6px 0;color:#52525b;width:120px">Name</td><td style="padding:6px 0">${fullName}</td></tr>
      <tr><td style="padding:6px 0;color:#52525b">Phone</td><td style="padding:6px 0">${escapeHtml(shipping.phone)}</td></tr>
      ${emailBlock}
    </table>

    <h2 style="font-size:13px;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.06em;color:#71717a">Line items</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:8px">
      <thead><tr><th style="text-align:left;padding:8px 12px;border-bottom:2px solid #e4e4e7">Product</th><th style="text-align:right;padding:8px 12px;border-bottom:2px solid #e4e4e7">Line total</th></tr></thead>
      <tbody>${b.rowsHtml || `<tr><td colspan="2" style="padding:12px;color:#71717a">No line items</td></tr>`}</tbody>
    </table>
    <p style="margin:12px 0 20px;font-size:17px;font-weight:700;color:#09090b">Order total: ${formatMoney(b.currency, b.subtotal)}</p>

    <h2 style="font-size:13px;margin:0 0 10px;text-transform:uppercase;letter-spacing:0.06em;color:#71717a">Ship to</h2>
    <p style="margin:0;font-size:14px;color:#3f3f46;line-height:1.6">${b.addr}</p>

    ${adminLink}
  </div>
</body>
</html>`;
}

function buildStoreOrderReceivedText(shipping, order) {
  const b = buildBlocks(shipping, order);
  const custEmail = String(shipping.email ?? "").trim();
  const emailLine = custEmail ? `Email: ${custEmail}\n` : "Email: (not provided)\n";

  return `EATOREUM — NEW ORDER RECEIVED

Order:     #${b.orderNumber}
Placed:    ${formatWhen(b.placedAt)}
Payment:   ${String(b.paymentMethod).toUpperCase()}
Status:    ${b.status}

--- Customer ---
Name:  ${shipping.fullName}
Phone: ${shipping.phone}
${emailLine}
--- Line items ---
${b.textLines || "  (none)"}

Order total: ${formatMoney(b.currency, b.subtotal)}

--- Ship to ---
${b.deliveryText}

Admin order ID: ${b.orderId || "—"}
`;
}

/**
 * @param {Record<string, unknown>} shipping
 * @param {Record<string, unknown>} order serialized order (include id, createdAt when available)
 */
export async function sendOrderConfirmationEmail(shipping, order) {
  if (!isMailerConfigured()) return;
  const transport = getMailTransporter();
  if (!transport) return;

  const storeInbox = getStoreNotifyEmail();
  if (!storeInbox) return;

  const raw = String(shipping?.email ?? "").trim();
  const customerOk = raw && EMAIL_RX.test(raw);
  const customerLower = customerOk ? raw.toLowerCase() : "";

  const htmlStore = buildStoreOrderReceivedHtml(shipping, order);
  const textStore = buildStoreOrderReceivedText(shipping, order);
  const storeSubject = `[Eatoreum] New order — ${order.orderNumber}`;

  if (customerOk && customerLower !== storeInbox) {
    await transport.sendMail({
      from: getMailFrom(),
      to: raw,
      subject: `Order confirmed — ${order.orderNumber}`,
      text: buildCustomerText(shipping, order),
      html: buildCustomerHtml(shipping, order),
    });
    await transport.sendMail({
      from: getMailFrom(),
      to: storeInbox,
      subject: storeSubject,
      text: textStore,
      html: htmlStore,
    });
    return;
  }

  if (customerOk && customerLower === storeInbox) {
    await transport.sendMail({
      from: getMailFrom(),
      to: storeInbox,
      subject: `${storeSubject} (shopper email is store inbox)`,
      text: textStore,
      html: htmlStore,
    });
    return;
  }

  await transport.sendMail({
    from: getMailFrom(),
    to: storeInbox,
    subject: `${storeSubject} (no shopper email)`,
    text: textStore,
    html: htmlStore,
  });
}

/**
 * Sends shopper confirmation when they left a valid email, and a separate shop “new order” email to SMTP_USER.
 * @param {Record<string, unknown>} shipping
 * @param {Record<string, unknown>} serializedOrder from serializeOrder()
 */
export async function trySendOrderConfirmation(shipping, serializedOrder) {
  if (!isMailerConfigured()) {
    console.warn("[order email] SMTP not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS); skipping send");
    return;
  }
  const storeInbox = getStoreNotifyEmail();
  if (!storeInbox) {
    console.warn("[order email] SMTP_USER empty; skipping send");
    return;
  }
  const raw = String(shipping?.email ?? "").trim();
  if (raw && !EMAIL_RX.test(raw)) {
    console.warn("[order email] Invalid customer email; sending shop notification only to", storeInbox);
  }
  try {
    await sendOrderConfirmationEmail(shipping, serializedOrder);
  } catch (err) {
    console.error("[order email] Failed to send:", err?.message ?? err);
  }
}
