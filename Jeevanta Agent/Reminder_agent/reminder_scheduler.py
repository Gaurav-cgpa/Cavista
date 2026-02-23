"""APScheduler-based reminder scheduler with smtplib email delivery."""

import os
import smtplib
import threading
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from dotenv import load_dotenv

from Reminder_agent.reminder_store import fetch_all_reminders

load_dotenv()

_SMTP_SERVER   = os.getenv("SMTP_SERVER", "smtp.gmail.com")
_SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
_EMAIL_USER    = os.getenv("EMAIL_USER", "")
_EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "")

_scheduler = BackgroundScheduler(daemon=True)
_lock = threading.Lock()


# ---------------------------------------------------------------------------
# Email
# ---------------------------------------------------------------------------

def _build_email_html(medicine: str, time_str: str, timezone: str) -> str:
    return f"""
    <html>
    <body style="font-family:Arial,sans-serif;color:#333;max-width:600px;margin:auto">
      <div style="background:#198754;padding:20px;border-radius:8px 8px 0 0">
        <h2 style="color:white;margin:0">&#128138; Medication Reminder</h2>
      </div>
      <div style="border:1px solid #ddd;padding:24px;border-radius:0 0 8px 8px">
        <p>This is your scheduled reminder to take your medication.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr>
            <td style="padding:8px;border:1px solid #ddd;background:#f8f9fa"><b>Medication</b></td>
            <td style="padding:8px;border:1px solid #ddd">{medicine}</td>
          </tr>
          <tr>
            <td style="padding:8px;border:1px solid #ddd;background:#f8f9fa"><b>Scheduled Time</b></td>
            <td style="padding:8px;border:1px solid #ddd">{time_str} ({timezone})</td>
          </tr>
        </table>
        <p style="color:#888;font-size:12px">
          Sent by Jeevanta &middot; Reply to your health assistant to cancel or modify reminders.
        </p>
      </div>
    </body>
    </html>
    """


def _send_email(to_email: str, medicine: str, time_str: str, timezone: str) -> None:
    if not _EMAIL_USER or not _EMAIL_PASSWORD:
        print(f"[ReminderScheduler] SMTP not configured — skipping email to {to_email}")
        return
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Reminder: Take {medicine} now"
        msg["From"]    = f"Jeevanta Reminders <{_EMAIL_USER}>"
        msg["To"]      = to_email
        msg.attach(MIMEText(_build_email_html(medicine, time_str, timezone), "html"))

        with smtplib.SMTP(_SMTP_SERVER, _SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(_EMAIL_USER, _EMAIL_PASSWORD)
            server.sendmail(_EMAIL_USER, to_email, msg.as_string())

        print(f"[ReminderScheduler] Email sent — {medicine} to {to_email} at {time_str}")
    except Exception as e:
        print(f"[ReminderScheduler] Email failed for {to_email}: {e}")


# ---------------------------------------------------------------------------
# Scheduling
# ---------------------------------------------------------------------------

def _job_id(user_id: str, medicine: str) -> str:
    return f"{user_id}:{medicine.lower()}"


def add_job(user_id: str, email: str, medicine: str,
            time_24h: str, timezone: str) -> str:
    """Register a daily cron job. Replaces any existing job for the same key."""
    hour, minute = map(int, time_24h.split(":"))
    job_id = _job_id(user_id, medicine)

    with _lock:
        _scheduler.add_job(
            _send_email,
            CronTrigger(hour=hour, minute=minute, timezone=timezone),
            id=job_id,
            args=[email, medicine, time_24h, timezone],
            replace_existing=True,
        )
    return job_id


def remove_job(user_id: str, medicine: str) -> bool:
    """Stop and remove the cron job. Returns True if it existed."""
    job_id = _job_id(user_id, medicine)
    with _lock:
        if _scheduler.get_job(job_id):
            _scheduler.remove_job(job_id)
            return True
    return False


def list_jobs() -> list[dict]:
    """Return a summary of all active scheduled jobs."""
    results = []
    for job in _scheduler.get_jobs():
        parts = job.id.split(":", 1)
        results.append({
            "id": job.id,
            "userId": parts[0],
            "medicationName": parts[1] if len(parts) > 1 else "",
            "nextRun": str(job.next_run_time),
        })
    return results


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------

def start_scheduler() -> None:
    """Start the background scheduler and reload persisted reminders from MongoDB."""
    if _scheduler.running:
        return

    _scheduler.start()

    try:
        reminders = fetch_all_reminders()
        for r in reminders:
            add_job(
                r["user_id"], r["email"], r["medicine"],
                r["time"], r.get("timezone", "Asia/Kolkata"),
            )
        print(f"[ReminderScheduler] Started — {len(reminders)} reminder(s) loaded from DB.")
    except Exception as e:
        print(f"[ReminderScheduler] Started (could not load existing reminders: {e})")
