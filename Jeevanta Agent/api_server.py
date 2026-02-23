"""Jeevanta API Server — FastAPI wrapper around the Jeevanta ADK agent."""

import asyncio
import os
import sys
import uuid
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types
from pydantic import BaseModel

load_dotenv()

sys.path.insert(0, str(Path(__file__).parent))

from Jeevanta_agent.agent import root_agent

# ---------------------------------------------------------------------------
# ADK setup
# ---------------------------------------------------------------------------

APP_NAME    = "Jeevanta"
HOST        = os.getenv("API_HOST", "0.0.0.0")
PORT        = int(os.getenv("API_PORT", "8000"))

session_service = InMemorySessionService()
runner = Runner(
    agent=root_agent,
    app_name=APP_NAME,
    session_service=session_service,
)
_executor = ThreadPoolExecutor(max_workers=10)

# Maps user_id -> session_id so the server maintains continuity automatically.
# Client can always send session_id="-1"; the server reuses the existing session.
_user_sessions: dict[str, str] = {}



app = FastAPI(
    title="Jeevanta Health API",
    description="API gateway for the Jeevanta multi-agent health platform.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    user_id: str
    session_id: str | None = "-1"   # send -1 (or omit) to start a new session
    message: str

class ChatResponse(BaseModel):
    ok: bool
    user_id: str
    session_id: str                 # always echoed back — store and reuse this
    response: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _ensure_session(user_id: str, session_id: str) -> None:
    existing = session_service.get_session_sync(
        app_name=APP_NAME, user_id=user_id, session_id=session_id
    )
    if existing is None:
        session_service.create_session_sync(
            app_name=APP_NAME, user_id=user_id, session_id=session_id
        )


def _run_agent(user_id: str, session_id: str, message: str) -> str:
    _ensure_session(user_id, session_id)
    content = genai_types.Content(
        role="user",
        parts=[genai_types.Part(text=message)],
    )
    response_text = ""
    for event in runner.run(
        user_id=user_id,
        session_id=session_id,
        new_message=content,
    ):
        if event.is_final_response() and event.content:
            for part in event.content.parts:
                if hasattr(part, "text") and part.text:
                    response_text += part.text
    return response_text.strip()


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/health", tags=["System"])
async def health():
    """Check that the API server is running."""
    return {"ok": True, "agent": APP_NAME, "status": "healthy"}


@app.post("/chat", response_model=ChatResponse, tags=["Agent"])
async def chat(req: ChatRequest):
    """Send a message to the Jeevanta agent and receive a response.

    - **user_id**: Unique identifier for the user (e.g. patient name or UUID).
    - **session_id**: Pass `-1` (or omit) on the first message — a new session UUID
      is created and returned. Pass the returned `session_id` on every subsequent
      message to continue the same conversation.
    - **message**: The user's message text.
    """
    # -1 / None / empty → look up or create a session for this user
    if not req.session_id or req.session_id == "-1":
        if req.user_id in _user_sessions:
            session_id = _user_sessions[req.user_id]   # reuse existing
        else:
            session_id = str(uuid.uuid4())             # brand new session
            _user_sessions[req.user_id] = session_id
    else:
        session_id = req.session_id
        _user_sessions[req.user_id] = session_id       # register if client provides one
    loop = asyncio.get_event_loop()
    try:
        response = await loop.run_in_executor(
            _executor, _run_agent, req.user_id, session_id, req.message
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return ChatResponse(
        ok=True,
        user_id=req.user_id,
        session_id=session_id,
        response=response,
    )


@app.delete("/session/{user_id}/{session_id}", tags=["Session"])
async def clear_session(user_id: str, session_id: str):
    """Delete a conversation session, clearing all history."""
    try:
        session_service.delete_session_sync(
            app_name=APP_NAME, user_id=user_id, session_id=session_id
        )
        _user_sessions.pop(user_id, None)
        return {"ok": True, "message": f"Session {session_id} deleted."}
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print(f"\n[Jeevanta] Running locally on http://{HOST}:{PORT}")
    print(f"[Jeevanta] API Docs at http://{HOST}:{PORT}/docs\n")
    uvicorn.run("api_server:app", host=HOST, port=PORT, reload=False)

