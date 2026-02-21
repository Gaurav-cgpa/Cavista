# Telegram → Chatbot API → Telegram Flow

Same flow as WhatsApp: user sends a message on Telegram → your server sends it to **CHATBOT_API_URL** → reply is sent back on Telegram.

## Flow

1. **User sends a message** to your Telegram bot.
2. **Telegram** POSTs the update to your webhook (`POST /api/telegram/webhook`).
3. **Your server** reads `message.text`, calls **getChatbotReply** (same as WhatsApp; uses `CHATBOT_API_URL` or internal bot).
4. **Your server** sends the reply via Telegram Bot API.

## Setup

### 1. Create a bot and get token

1. Open Telegram, search for **@BotFather**.
2. Send `/newbot`, follow the steps, get the **bot token** (e.g. `123456:ABC-DEF...`).

### 2. Environment variable (.env)

```env
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
CHATBOT_API_URL=https://your-chatbot-api.com/chat
```

Same `CHATBOT_API_URL` as WhatsApp; both use the same chatbot.

### 3. Set Telegram webhook (one-time)

Telegram must know where to send updates. Call this **once** (use your real public HTTPS URL and token):

```bash
# Replace YOUR_PUBLIC_URL and YOUR_BOT_TOKEN
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://YOUR_PUBLIC_URL/api/telegram/webhook"
```

Example:

```bash
curl "https://api.telegram.org/bot123456:ABC-DEF/setWebhook?url=https://myapp.herokuapp.com/api/telegram/webhook"
```

Response should be `{"ok":true,"result":true,...}`.

- **URL must be HTTPS** and publicly reachable (no localhost unless you use ngrok and set the ngrok URL).

### 4. Test

1. Open your bot in Telegram (tap the link from BotFather).
2. Send a message (e.g. "Hello" or "I have a headache").
3. You should get the chatbot’s reply from the same bot.

## Test with curl (simulate Telegram)

You can simulate Telegram sending an update to your webhook:

```bash
curl -X POST "http://localhost:3001/api/telegram/webhook" \
  -H "Content-Type: application/json" \
  -d '{"message":{"chat":{"id":123456789},"text":"Hello, I have a headache"}}'
```

Use a real `chat.id` (your Telegram user/chat ID) if you want the reply to appear in Telegram; otherwise the server still runs the flow and sends the reply to that ID (no-op if the ID is fake).

## Summary

| Step | Action |
|------|--------|
| 1 | Create bot with @BotFather, copy token. |
| 2 | Add `TELEGRAM_BOT_TOKEN` and `CHATBOT_API_URL` to `.env`. |
| 3 | Call `setWebhook` once with `https://YOUR_PUBLIC_URL/api/telegram/webhook`. |
| 4 | Message your bot on Telegram → reply comes from the same chatbot as WhatsApp. |
