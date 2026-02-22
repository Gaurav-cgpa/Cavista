import { getChatbotReplyFromUrl } from "../services/chatbotService.js";
import { sendWhatsAppMessage } from "../services/whatsappService.js";

/**
 * Twilio WhatsApp webhook: receives incoming message, calls chatbot, sends reply.
 * Twilio POSTs application/x-www-form-urlencoded with Body, From, To.
 */
export async function handleIncoming(req, res) {
  try {
    const body = req.body || {};
    const userMessage = (body.Body || body.body || "").trim();
    const from = body.From || body.from;

    if (!from) {
      return res.status(400).send("Missing From");
    }

    if (!userMessage) {
      await sendWhatsAppMessage(from, "Please send a text message and I'll reply.");
      return res.status(200).send("OK");
    }

    // Forward WhatsApp body to chatbot API and send API response back to WhatsApp
    const reply = await getChatbotReplyFromUrl(userMessage, from);
    await sendWhatsAppMessage(from, reply);

    res.status(200).send("OK");
  } catch (err) {
    console.error("WhatsApp webhook error:", err.message);
    try {
      const from = (req.body && (req.body.From || req.body.from)) || "";
      if (from) {
        await sendWhatsAppMessage(from, "Sorry, something went wrong. Please try again later.");
      }
    } catch (e) {
      console.error("Failed to send error reply:", e.message);
    }
    res.status(500).send("Error");
  }
}
