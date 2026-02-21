/**
 * Send WhatsApp message via Twilio REST API.
 * Uses Account SID + Auth Token; From must be a Twilio WhatsApp-enabled number.
 */

function getClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!accountSid || !authToken) {
    throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set.");
  }
  return { accountSid, authToken };
}

/** Ensure format is exactly "whatsapp:+1234567890" (no spaces). Twilio rejects "whatsapp: +91...". */
function normalizeWhatsAppNumber(value) {
  const raw = (value || "").trim();
  if (!raw) return "";
  // Strip ALL whitespace (including non-breaking space U+00A0) and extract only + and digits
  const digitsOnly = raw.replace(/[\s\u00A0\u2000-\u200B\u202F\u205F\u3000]/g, "").replace(/^whatsapp:/i, "");
  const hasPlus = digitsOnly.startsWith("+");
  const number = (hasPlus ? "+" : "") + digitsOnly.replace(/\D/g, "");
  if (!number || number === "+") return "";
  return "whatsapp:" + number;
}

function getFromNumber() {
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!from) {
    throw new Error("TWILIO_WHATSAPP_FROM must be set (e.g. whatsapp:+14155238886).");
  }
  return normalizeWhatsAppNumber(from);
}

/**
 * Send a WhatsApp text message.
 * @param {string} to - Recipient, e.g. "whatsapp:+919322818122"
 * @param {string} body - Message text
 * @returns {Promise<{ sid: string }>}
 */
export async function sendWhatsAppMessage(to, body) {
  const { accountSid, authToken } = getClient();
  const from = getFromNumber();
  const toNormalized = normalizeWhatsAppNumber(to);
  if (!toNormalized) throw new Error("Missing or invalid To number.");

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  const params = new URLSearchParams();
  params.append("To", toNormalized);
  params.append("From", from);
  params.append("Body", String(body || ""));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64"),
    },
    body: params.toString(),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data.message || data.error_message || res.statusText;
    throw new Error(`Twilio WhatsApp send failed (${res.status}): ${msg}`);
  }

  return { sid: data.sid };
}
