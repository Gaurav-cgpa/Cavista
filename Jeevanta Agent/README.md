# Jeevanta Agent

Multi-agent AI health platform built with Google ADK and Gemini 2.0 Flash. Authenticates users via OTP, loads their health profile, and routes them through specialist AI agents for medical intake, diet coaching, and medication reminders. Exposed as a REST API via FastAPI.

---

## Project Structure

```
Jeevanta Agent/
├── api_server.py                    # FastAPI server — main entry point, exposes /chat and /health
├── requirements.txt                 # Python dependencies
├── .env.example                     # Template for all required environment variables
│
├── Jeevanta_agent/
│   ├── agent.py                     # Root orchestrator — handles OTP auth and routes to sub-agents
│   └── auth_tools.py                # Tools: send_otp, verify_otp, get_user_profile
│
├── MedAssist_agent/
│   └── agent.py                     # Medical intake agent — conducts SOAP-style interview, generates clinical EMR report using Vertex AI Search
│
├── DietLifestyle_agent/
│   └── agent.py                     # Coach Vita — builds personalised 7-day diet plan and activity routine using Google Search
│
└── Reminder_agent/
    ├── agent.py                     # Reminder orchestrator — manages schedule / cancel / view reminder requests
    ├── tools.py                     # Agent tools: schedule_reminder, cancel_reminder, get_patient_reminders
    ├── reminder_scheduler.py        # APScheduler setup — fires daily email reminders at the right time
    └── reminder_store.py            # MongoDB CRUD — persists reminder records
```

---

## Running Locally

```bash
python -m venv venv
venv\Scripts\activate          # or: source venv/bin/activate on Mac/Linux
pip install -r requirements.txt

cp .env.example .env           # fill in your credentials

gcloud auth application-default login   # authenticate with Google Cloud

python api_server.py
```

Server starts at `http://localhost:8080`. API docs at `http://localhost:8080/docs`.

---

## API

### `POST /chat`
```json
{ "user_id": "user_123", "session_id": "-1", "message": "Hello" }
```
Pass `session_id: "-1"` on the first message. The response echoes back a `session_id` — reuse it on every subsequent message to maintain conversation continuity.

### `GET /health`
Returns `{ "ok": true }` — use this to confirm the server is up.

### `DELETE /session/{user_id}/{session_id}`
Clears a conversation session.

---

## ngrok (Public Tunnel for Development)

To expose the local server publicly (e.g. for mobile app testing):

```bash
ngrok http 8080
```

Or set `NGROK_AUTH_TOKEN` in `.env` and the server can auto-tunnel on startup.
The forwarding URL from ngrok is what you point the mobile app to instead of `localhost`.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | What it's for |
|---|---|
| `GOOGLE_CLOUD_PROJECT` | GCP project ID |
| `VERTEX_AI_DATASTORE_PATH` | Vertex AI Search data store (MedAssist knowledge base) |
| `EMAIL_USER` / `EMAIL_PASSWORD` | Gmail + App Password for sending medication reminders |
| `MONGODB_URI` | MongoDB Atlas connection string for reminder storage |
| `OTP_SEND_URL` / `OTP_VERIFY_URL` | OTP service endpoints |
| `USER_PROFILE_URL` | Backend API for fetching user health profiles |
| `NGROK_AUTH_TOKEN` | ngrok token for dev tunnelling |
| `OTP_BYPASS` | Set `true` to skip real OTP during local dev |

---

> **Disclaimer:** Jeevanta is a hackathon prototype. All agent responses are for general guidance only and do not constitute a medical diagnosis.
