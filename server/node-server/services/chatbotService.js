/**
 * Chatbot service: calls external AI Chat API only.
 * No hardcoded responses - all replies come from the API.
 */

/**
 * Get chatbot response from CHATBOT_API_URL (for WhatsApp/Telegram).
 * Does NOT require bearer token.
 * @param {string} message - User's message
 * @param {string|number} userId - User's ID (for session tracking)
 * @returns {Promise<string>} - Bot reply from API
 */
export async function getChatbotReplyFromUrl(message, userId) {
  const text = (message || "").trim();
  if (!text) {
    throw new Error("Message cannot be empty");
  }

  // Call Chatbot API (no bearer token needed)
  const chatbotUrl = (process.env.CHATBOT_API_URL || "").trim();

  if (!chatbotUrl) {
    throw new Error("CHATBOT_API_URL is not configured");
  }

  try {
    console.log("🤖 Calling Chatbot API:", chatbotUrl);
    console.log("📤 Sending message:", text);
    if (userId) console.log("👤 User ID:", userId);

    const requestBody = userId 
      ? { user_id: String(userId), message: String(text) }
      : { message: String(text) };

    const res = await fetch(chatbotUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📥 API Response status:", res.status);

    const data = await res.json().catch(() => ({}));
    console.log("📥 API Response data:", JSON.stringify(data));

    // Check for success with 'ok' and 'response' field (primary format from CHATBOT_API_URL)
    if (res.ok && data.ok === true && data.response) {
      console.log("✅ Got response from Chatbot API:", data.response);
      return String(data.response).trim();
    }

    // Check for reply field
    if (res.ok && data.reply) {
      console.log("✅ Got reply from Chatbot API:", data.reply);
      return String(data.reply).trim();
    }

    // Check for message field
    if (res.ok && data.message) {
      console.log("✅ Got message from Chatbot API:", data.message);
      return String(data.message).trim();
    }

    // Handle error responses
    if (data.reply || data.message || data.response) {
      throw new Error(`API Error: ${data.reply || data.message || data.response || "Unknown error"}`);
    }

    // Non-200 status code or completely invalid response
    throw new Error(`API failed with status ${res.status}: ${JSON.stringify(data)}`);
  } catch (err) {
    console.error("❌ Chatbot API Error:", err.message);
    throw err;
  }
}

/**
 * Get chatbot response from AI Chat API (for VirtualAssistant).
 * Requires bearer token.
 * @param {string} message - User's message
 * @param {string|number} userId - User's ID (for session tracking)
 * @param {string} bearerToken - Bearer token from frontend local storage
 * @returns {Promise<string>} - Bot reply from API
 */
export async function getChatbotReply(message, userId, bearerToken) {
  const text = (message || "").trim();
  if (!text) {
    throw new Error("Message cannot be empty");
  }

  // Call AI Chat API (with Bearer token)
  const aiApiUrl = (process.env.AI_CHAT_API_URL || "").trim();
  const token = (bearerToken || process.env.AI_CHAT_BEARER_TOKEN || "").trim();

  if (!aiApiUrl) {
    throw new Error("AI_CHAT_API_URL is not configured");
  }

  if (!token) {
    throw new Error("Bearer token not provided and AI_CHAT_BEARER_TOKEN not configured. Get token from login.");
  }

  try {
    console.log("🤖 Calling AI Chat API:", aiApiUrl);
    console.log("📤 Sending message:", text);
    if (userId) console.log("👤 User ID:", userId);
    console.log("🔐 Using bearer token (length):", token?.length || 0, "chars");
    console.log("🔐 Token preview:", token?.substring(0, 20) + "...");

    const requestBody = { message: String(text) };

    const res = await fetch(aiApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    console.log("📥 API Response status:", res.status);

    const data = await res.json().catch(() => ({}));
    console.log("📥 API Response data:", JSON.stringify(data));

    // Check for success response with 'reply' field (primary response format)
    if (res.ok && data.success === true && data.reply) {
      console.log("✅ Got reply from AI Chat API:", data.reply);
      return String(data.reply).trim();
    }

    // Check for 'message' field (alternate format)
    if (res.ok && data.success === true && data.message) {
      console.log("✅ Got message from AI Chat API:", data.message);
      return String(data.message).trim();
    }

    // Check for 'response' field (another format)
    if (res.ok && data.success === true && data.response) {
      console.log("✅ Got response from AI Chat API:", data.response);
      return String(data.response).trim();
    }

    // Handle error responses
    if (data.success === false) {
      throw new Error(`API Error: ${data.reply || data.message || data.response || "Unknown error"}`);
    }

    // Handle unexpected response format (if reply/message/response exists but success might be missing)
    if (res.ok && (data.reply || data.message || data.response)) {
      const reply = data.reply || data.message || data.response;
      console.log("✅ Got reply (non-standard format):", reply);
      return String(reply).trim();
    }

    // Non-200 status code or completely invalid response
    throw new Error(`API failed with status ${res.status}: ${JSON.stringify(data)}`);
  } catch (err) {
    console.error("❌ AI Chat API Error:", err.message);
    throw err; // Throw error to be handled by caller
  }
}
