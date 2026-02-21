import { TelegramSession } from "../schema/telegramSession.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Get or create a session for a Telegram chat.
 * Returns the same sessionId for the same chatId across multiple requests.
 *
 * @param {number} chatId - Telegram chat ID
 * @param {Object} userInfo - Optional user info { username, firstName, lastName }
 * @returns {Promise<{ sessionId: string, isNew: boolean }>}
 */
export async function getOrCreateTelegramSession(chatId, userInfo = {}) {
  try {
    // Try to find existing session
    let session = await TelegramSession.findOne({ chatId: String(chatId) });

    if (session) {
      // Update message count and user info if provided
      session.messageCount = (session.messageCount || 0) + 1;
      if (userInfo.username) session.username = userInfo.username;
      if (userInfo.firstName) session.firstName = userInfo.firstName;
      if (userInfo.lastName) session.lastName = userInfo.lastName;
      await session.save();
      
      console.log(`✅ Session found for chatId ${chatId}: ${session.sessionId}`);
      return { sessionId: session.sessionId, isNew: false };
    }

    // Create new session
    const sessionId = `tg_${uuidv4()}`;
    const newSession = new TelegramSession({
      chatId: String(chatId),
      sessionId,
      username: userInfo.username,
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      messageCount: 1,
    });

    await newSession.save();
    console.log(`🆕 New session created for chatId ${chatId}: ${sessionId}`);
    return { sessionId, isNew: true };
  } catch (err) {
    console.error("❌ Error in session management:", err.message);
    // Fallback: generate a temporary session ID based on chatId
    const fallbackSessionId = `tg_${chatId}_${Date.now()}`;
    return { sessionId: fallbackSessionId, isNew: false };
  }
}

/**
 * Get session by sessionId
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object|null>}
 */
export async function getTelegramSession(sessionId) {
  try {
    const session = await TelegramSession.findOne({ sessionId });
    return session;
  } catch (err) {
    console.error("❌ Error retrieving session:", err.message);
    return null;
  }
}
