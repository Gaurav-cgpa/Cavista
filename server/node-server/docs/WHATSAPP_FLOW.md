# WhatsApp → Chatbot API → WhatsApp Flow

## Flow

1. **User sends a message on WhatsApp** to your Twilio WhatsApp number.
2. **Twilio** sends a POST request to your webhook URL with the message body and sender.
3. **Your server** (`POST /api/whatsapp/incoming`) receives it, sends the **body** to your **external chatbot API**.
4. **Chatbot API** returns a response.
5. **Your server** sends that response back to the user **on WhatsApp** via Twilio.

## Setup

### 1. Environment variables (.env)

```env
TWILIO_ACCOUNT_SID=ACxxxx...
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# External chatbot API: when set, WhatsApp messages are sent here and the reply is sent back to WhatsApp
CHATBOT_API_URL=https://your-chatbot-api.com/chat
```

### 2. Twilio webhook (required for “send from WhatsApp” flow)

So that **when you send a message from the WhatsApp app**, Twilio calls your server:

1. Go to [Twilio Console](https://console.twilio.com) → **Messaging** → **Try it out** → **Send a WhatsApp message** (or your WhatsApp sandbox / number settings).
2. Set **“When a message comes in”** to your **public** webhook URL:
   - `https://YOUR_PUBLIC_DOMAIN/api/whatsapp/incoming`
   - Must be **HTTPS** and reachable from the internet (e.g. deployed server or ngrok).
3. Save.

Example: if your server is at `https://myapp.herokuapp.com`, set:

`https://myapp.herokuapp.com/api/whatsapp/incoming`

Then when someone sends a WhatsApp message to your Twilio number, Twilio will POST to that URL and your server will forward the body to `CHATBOT_API_URL` and reply on WhatsApp.

### 3. Chatbot API contract

Your chatbot API must:

- **Method:** POST  
- **URL:** value of `CHATBOT_API_URL` (e.g. `https://your-api.com/chat`)  
- **Request body (JSON):** `{ "message": "user message text" }`  
- **Response (JSON):** any of:
  - `{ "reply": "bot reply text" }`
  - `{ "response": "..." }`
  - `{ "text": "..." }`
  - `{ "message": "..." }`
  - OpenAI-style: `{ "choices": [{ "message": { "content": "..." } }] }`

The first non-empty string found is sent back to the user on WhatsApp.

## Test with curl (simulate Twilio)

Without using the phone, you can simulate Twilio calling your webhook:

```bash
curl -X POST "http://localhost:5000/api/whatsapp/incoming" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+919322818122" \
  -d "To=whatsapp:+14155238886" \
  -d "Body=Hello, I have a headache"
```

The server will call your `CHATBOT_API_URL` with `{"message":"Hello, I have a headache"}`, then send the API’s reply to `whatsapp:+919322818122`.

## Summary

| Step | Action |
|------|--------|
| 1 | Add `CHATBOT_API_URL` to `.env` (your chatbot API). |
| 2 | In Twilio, set “When a message comes in” to `https://YOUR_PUBLIC_URL/api/whatsapp/incoming`. |
| 3 | Deploy your server so the webhook URL is public and HTTPS. |
| 4 | Send a WhatsApp message to your Twilio number → your API gets the body → reply is sent back on WhatsApp. |
