import { getChatbotReply } from "../services/chatbotService.js";
import { sendTelegramMessage } from "../services/telegramService.js";

/**
 * Telegram webhook: receives updates from Telegram, calls chatbot, sends reply.
 * Telegram POSTs JSON with update.message (chat.id, text).
 */
export async function handleWebhook(req, res) {
  try {
    const body = req.body || {};
    console.log("📱 Telegram webhook received:", JSON.stringify(body, null, 2));

    const message = body.message;
    if (!message) {
      console.log("No message in update, ignoring");
      return res.status(200).send("OK");
    }

    const chatId = message.chat?.id;
    const userMessage = (message.text || "").trim();

    if (chatId == null) {
      console.log("No chat.id in message");
      return res.status(200).send("OK");
    }

    // Reply quickly so Telegram doesn't retry
    res.status(200).send("OK");

    if (!userMessage) {
      console.log("Empty message text, sending prompt");
      await sendTelegramMessage(chatId, "Please send a text message and I'll reply.");
      return;
    }

    console.log(`Processing message from chat ${chatId}: "${userMessage}"`);

    // Forward message to chatbot API and send response back to Telegram
    const reply = await getChatbotReply(userMessage);
    console.log(`Got reply: "${reply}"`);
    await sendTelegramMessage(chatId, reply);
    console.log(`Sent reply to chat ${chatId}`);
  } catch (err) {
    console.error("Telegram webhook error:", err.message);
    console.error(err.stack);
    // Already sent 200, can't send error response
  }
}
