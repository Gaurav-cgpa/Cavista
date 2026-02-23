"""Agent tool functions for medication reminders — pure Python, no HTTP dependency."""

import re
from datetime import datetime

from Reminder_agent.reminder_store import (
    insert_reminder,
    fetch_reminders_by_email,
    delete_reminder,
)
from Reminder_agent.reminder_scheduler import add_job, remove_job, list_jobs


# ---------------------------------------------------------------------------
# Internal helper
# ---------------------------------------------------------------------------

def _to_24h(time_str: str) -> str | None:
    """Convert any common time string to HH:MM (24-hour).

    Accepts: '9 PM', '9:30 AM', '21:00', '9pm', '9:30pm'
    """
    t = time_str.strip()
    for fmt in ("%I:%M %p", "%I %p", "%H:%M", "%H"):
        try:
            return datetime.strptime(t.upper(), fmt).strftime("%H:%M")
        except ValueError:
            continue
    m = re.match(r"^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$", t, re.IGNORECASE)
    if m:
        hour   = int(m.group(1))
        minute = int(m.group(2) or 0)
        suffix = m.group(3).lower()
        if suffix == "pm" and hour != 12:
            hour += 12
        if suffix == "am" and hour == 12:
            hour = 0
        return f"{hour:02d}:{minute:02d}"
    return None


def _user_id(email: str) -> str:
    """Derive a stable user ID from an email address."""
    return email.strip().lower().replace("@", "_at_").replace(".", "_")


# ---------------------------------------------------------------------------
# Agent tools
# ---------------------------------------------------------------------------

def schedule_reminder(
    patient_name: str,
    email: str,
    medication_name: str,
    reminder_time: str,
    timezone: str = "Asia/Kolkata",
) -> dict:
    print(f"[schedule_reminder] CALLED — patient={patient_name}, email={email}, med={medication_name}, time={reminder_time}")
    """Schedule a daily medication reminder for a patient.

    Args:
        patient_name: The patient's full name.
        email: Email address where the daily reminder will be sent.
        medication_name: Name of the medication (e.g. "Metformin 500mg").
        reminder_time: Time for the daily reminder in any common format
            (e.g. "8 AM", "9:30 PM", "21:00").
        timezone: IANA timezone string. Defaults to "Asia/Kolkata".

    Returns:
        dict with keys: ok (bool), message (str).
    """
    time_24h = _to_24h(reminder_time)
    if not time_24h:
        return {
            "ok": False,
            "message": f"Could not parse '{reminder_time}'. Use formats like '8 AM', '9:30 PM', or '21:00'.",
        }

    user_id = _user_id(email)

    try:
        insert_reminder(user_id, email, medication_name, time_24h, timezone)
        job_id = add_job(user_id, email, medication_name, time_24h, timezone)
        return {
            "ok": True,
            "message": (
                f"Daily reminder set for {medication_name} at {time_24h} ({timezone}). "
                f"Reminders will be sent to {email}. Job ID: {job_id}"
            ),
        }
    except Exception as e:
        return {"ok": False, "message": f"Failed to schedule reminder: {e}"}


def cancel_reminder(
    email: str,
    medication_name: str,
) -> dict:
    """Cancel an active daily medication reminder.

    Args:
        email: The patient's email address used when the reminder was created.
        medication_name: The medication whose reminder should be cancelled.

    Returns:
        dict with keys: ok (bool), message (str).
    """
    user_id = _user_id(email)

    removed_job = remove_job(user_id, medication_name)
    removed_db  = delete_reminder(user_id, medication_name)

    if removed_job or removed_db:
        return {"ok": True, "message": f"Reminder for {medication_name} has been cancelled."}
    return {"ok": False, "message": f"No active reminder found for {medication_name}."}


def list_reminders() -> dict:
    """List all currently scheduled medication reminders across all patients.

    Returns:
        dict with keys: ok (bool), count (int), reminders (list of dicts).
    """
    try:
        jobs = list_jobs()
        return {"ok": True, "count": len(jobs), "reminders": jobs}
    except Exception as e:
        return {"ok": False, "message": str(e)}


def get_patient_reminders(email: str) -> dict:
    """List all scheduled reminders for a specific patient.

    Args:
        email: The patient's email address.

    Returns:
        dict with keys: ok (bool), count (int), reminders (list of dicts).
    """
    try:
        docs = fetch_reminders_by_email(email)
        reminders = [
            {
                "medication": d["medicine"],
                "time": d["time"],
                "timezone": d.get("timezone", "Asia/Kolkata"),
                "email": d["email"],
            }
            for d in docs
        ]
        return {"ok": True, "count": len(reminders), "reminders": reminders}
    except Exception as e:
        return {"ok": False, "message": str(e)}
