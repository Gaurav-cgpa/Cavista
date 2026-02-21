/**
 * Chatbot service: returns a reply for a user message.
 * If CHATBOT_API_URL is set, calls that API (POST { message } -> { reply }).
 * Otherwise uses internal health-assistant logic.
 */

function getInternalReply(userMessage) {
  const lower = (userMessage || "").toLowerCase();
  if (lower.includes("headache") || lower.includes("dizzy")) {
    return "I'm sorry to hear that. For headaches and dizziness, try resting in a quiet room and staying hydrated. If it's severe or persists, please see a doctor.";
  }
  if (lower.includes("vital") || lower.includes("vitals")) {
    return "Based on your dashboard, your recent vitals are within normal ranges. Keep monitoring them and share any concerns.";
  }
  if (lower.includes("exercise") || lower.includes("back pain")) {
    return "For lower back pain, gentle stretches and walking often help. Avoid heavy lifting. I recommend consulting a physiotherapist for a personalized plan.";
  }
  if (lower.includes("diabetes") || lower.includes("risk")) {
    return "Risk depends on family history, lifestyle, and vitals. I recommend discussing a full risk assessment with your doctor.";
  }
  if (lower.includes("thank") || lower.includes("thanks")) {
    return "You're welcome! Feel free to ask anything else about your health.";
  }
  return "Thank you for your message. For personalized medical advice, please consult your physician. Is there anything specific about your health you'd like to know?";
}

/**
 * Get chatbot response for a user message.
 * @param {string} message - User's message
 * @returns {Promise<string>} - Bot reply
 */
export async function getChatbotReply(message) {
  const text = (message || "").trim();
  if (!text) return "Please send a message and I'll help you.";

  const apiUrl = (process.env.CHATBOT_API_URL || "").trim();
  if (apiUrl) {
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Common response shapes: { reply }, { response }, { text }, { message }, { choices: [{ message: { content } }] }
        let reply = data.reply ?? data.response ?? data.text ?? data.message;
        if (reply == null && Array.isArray(data.choices)?.[0]?.message?.content) {
          reply = data.choices[0].message.content;
        }
        if (reply != null && String(reply).trim()) return String(reply).trim();
      } else {
        console.error("Chatbot API error:", res.status, data);
      }
    } catch (err) {
      console.error("Chatbot API error:", err.message);
    }
  }

  return getInternalReply(text);
}
