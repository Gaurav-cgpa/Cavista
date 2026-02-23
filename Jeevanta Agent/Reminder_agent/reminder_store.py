"""MongoDB persistence for medication reminders using pymongo."""

import os
import re
from datetime import datetime, timezone as dt_tz

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

_COLLECTION = "Users_medical_reminder"
_client: MongoClient | None = None


def _col():
    """Return the reminders collection, connecting lazily on first call."""
    global _client
    if _client is None:
        uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
        db_name = os.getenv("MONGODB_DB_NAME", "Users")
        _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        _client[db_name].command("ping")  # fail fast if unreachable
    db_name = os.getenv("MONGODB_DB_NAME", "Users")
    return _client[db_name][_COLLECTION]


def insert_reminder(user_id: str, email: str, medicine: str,
                    time_24h: str, timezone: str) -> None:
    """Persist a new reminder document."""
    _col().insert_one({
        "user_id": user_id,
        "email": email.lower(),
        "medicine": medicine,
        "time": time_24h,
        "timezone": timezone,
        "created_at": datetime.now(dt_tz.utc),
    })


def fetch_all_reminders() -> list[dict]:
    """Return all stored reminders (used to reload jobs on startup)."""
    return list(_col().find({}, {"_id": 0}))


def fetch_reminders_by_email(email: str) -> list[dict]:
    """Return all reminders belonging to a specific patient email."""
    return list(_col().find(
        {"email": email.lower()},
        {"_id": 0}
    ))


def delete_reminder(user_id: str, medicine: str) -> bool:
    """Delete a reminder document. Returns True if a document was removed."""
    result = _col().delete_one({
        "user_id": user_id,
        "medicine": re.compile(f"^{re.escape(medicine)}$", re.IGNORECASE),
    })
    return result.deleted_count > 0
