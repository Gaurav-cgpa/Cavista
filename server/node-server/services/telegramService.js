/**
 * Send a message via Telegram Bot API.
 * Set TELEGRAM_BOT_TOKEN in .env (from @BotFather).
 */

const TELEGRAM_API = "https://api.telegram.org";

function getToken() {
  const token = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN must be set in .env (get it from @BotFather).");
  }
  return token;
}

/**
 * Send a text message to a Telegram chat.
 * @param {string|number} chatId - Chat ID (from update.message.chat.id)
 * @param {string} text - Message text (max 4096 chars; Telegram will truncate)
 * @returns {Promise<{ message_id: number }>}
 */
export async function sendTelegramMessage(chatId, text) {
  const token = getToken();
  const url = `${TELEGRAM_API}/bot${token}/sendMessage`;

  const body = {
    chat_id: chatId,
    text: String(text || "").slice(0, 4096),
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!data.ok) {
    const errorMsg = `Telegram send failed (${res.status}): ${data.description || res.statusText}`;
    console.error("Telegram API error:", errorMsg, JSON.stringify(data, null, 2));
    throw new Error(errorMsg);
  }

  return { message_id: data.result?.message_id };
}
