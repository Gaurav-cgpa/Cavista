"""OTP-based authentication tools for the Jeevanta orchestrator."""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

OTP_SEND_URL     = os.getenv("OTP_SEND_URL",     "https://lab-test-backend-1.onrender.com/api/v1/otp/send")
OTP_VERIFY_URL   = os.getenv("OTP_VERIFY_URL",   "https://lab-test-backend-1.onrender.com/api/v1/otp/verify")
USER_PROFILE_URL = os.getenv("USER_PROFILE_URL", "https://coherent-corine-tepid.ngrok-free.dev/api/mobile")
_TIMEOUT = 60  # Render.com free tier can take 30-60s on cold start

# ------------------------------------------------------------------
# DEV BYPASS — set OTP_BYPASS=true in .env to skip real OTP calls.
# Any OTP entered will be accepted as long as it matches BYPASS_OTP.
# Remove / set to false before going to production.
# ------------------------------------------------------------------
_BYPASS     = os.getenv("OTP_BYPASS", "false").lower() == "true"
_BYPASS_OTP = os.getenv("OTP_BYPASS_CODE", "123456")


def send_otp(name: str, phone_number: str) -> dict:
    """Send an OTP to the user's phone number via the authentication API.

    Call this after collecting the user's name and phone number.

    Args:
        name: The user's full name.
        phone_number: The user's phone number in international format (e.g. "+919876543210").

    Returns:
        dict with keys: ok (bool), message (str), expires_at (str).
    """
    if _BYPASS:
        return {
            "ok": True,
            "message": f"[DEV] OTP bypass active. Use code {_BYPASS_OTP} to verify.",
            "expires_at": "never",
        }

    try:
        response = requests.post(
            OTP_SEND_URL,
            json={"phone_number": phone_number.strip()},
            headers={"Content-Type": "application/json"},
            timeout=_TIMEOUT,
        )
        data = response.json()

        if not data.get("success"):
            return {
                "ok": False,
                "message": data.get("message", "Failed to send OTP. Please try again."),
            }

        expires_at = data.get("data", {}).get("expires_at", "")
        return {
            "ok": True,
            "message": f"OTP sent successfully to {phone_number}. Please ask the user to enter the OTP they received.",
            "expires_at": expires_at,
        }

    except requests.exceptions.ConnectionError:
        return {"ok": False, "message": "Could not reach the OTP service. Please try again."}
    except Exception as e:
        return {"ok": False, "message": f"Failed to send OTP: {e}"}


def verify_otp(phone_number: str, otp_entered: str) -> dict:
    """Verify the OTP entered by the user by calling the verification API.

    Call this after the user shares the OTP they received on their phone.

    Args:
        phone_number: The same phone number used when sending the OTP.
        otp_entered: The OTP code the user typed in the chat.

    Returns:
        dict with keys: ok (bool), verified (bool), message (str).
    """
    if _BYPASS:
        if str(otp_entered).strip() == _BYPASS_OTP:
            return {"ok": True, "verified": True, "message": "OTP verified successfully. The user is now authenticated."}
        return {"ok": False, "verified": False, "message": f"Incorrect OTP. (Dev bypass: use {_BYPASS_OTP})"}

    try:
        response = requests.post(
            OTP_VERIFY_URL,
            json={
                "phone_number": phone_number.strip(),
                "otp_code": str(otp_entered).strip(),
            },
            headers={"Content-Type": "application/json"},
            timeout=_TIMEOUT,
        )
        data = response.json()

        if not data.get("success"):
            return {
                "ok": False,
                "verified": False,
                "message": data.get("message", "OTP verification failed. Please try again."),
            }

        verified = data.get("data", {}).get("verified", False)
        if verified:
            return {
                "ok": True,
                "verified": True,
                "message": "OTP verified successfully. The user is now authenticated.",
            }

        return {
            "ok": False,
            "verified": False,
            "message": "Incorrect OTP. Please ask the user to check and try again.",
        }

    except requests.exceptions.ConnectionError:
        return {"ok": False, "verified": False, "message": "Could not reach the OTP service. Please try again."}
    except Exception as e:
        return {"ok": False, "verified": False, "message": f"Verification failed: {e}"}


def get_user_profile(phone_number: str) -> dict:
    """Fetch the user's full profile from the database using their phone number.

    Call this immediately after successful OTP verification to load the user's
    existing data as context for all downstream specialist agents.

    Args:
        phone_number: The verified phone number in international format (e.g. "+919876543210").

    Returns:
        dict with keys: ok (bool), profile (dict with user data), message (str).
        Profile fields: fullName, username, email, age, gender, dob, height,
                        weight, bloodGroup, phoneNumber.
    """
    try:
        response = requests.request(
            method="GET",
            url=USER_PROFILE_URL,
            json={"phoneNumber": phone_number.strip()},
            headers={
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true",
            },
            timeout=_TIMEOUT,
        )
        data = response.json()

        # Support both {success, data} and flat response shapes
        if not data.get("success"):
            return {
                "ok": False,
                "profile": {},
                "message": data.get("message", "Could not fetch user profile."),
            }

        # Profile may be nested under "data" or at the top level
        profile = data.get("data") or data
        if isinstance(profile, list):
            profile = profile[0] if profile else {}

        return {
            "ok": True,
            "profile": {
                "fullName":    profile.get("fullName", ""),
                "username":    profile.get("username", ""),
                "email":       profile.get("email", ""),
                "age":         profile.get("age", ""),
                "gender":      profile.get("gender", ""),
                "dob":         profile.get("dob", ""),
                "height":      profile.get("height", ""),
                "weight":      profile.get("weight", ""),
                "bloodGroup":  profile.get("bloodGroup", ""),
                "phoneNumber": profile.get("phoneNumber", ""),
            },
            "message": "User profile loaded successfully.",
        }

    except requests.exceptions.ConnectionError:
        return {"ok": False, "profile": {}, "message": "Could not reach the profile service. Make sure the backend is running."}
    except requests.exceptions.JSONDecodeError:
        return {"ok": False, "profile": {}, "message": f"Profile service returned non-JSON response (status {response.status_code}). Check the URL and ngrok tunnel."}
    except Exception as e:
        return {"ok": False, "profile": {}, "message": f"Failed to fetch profile: {e}"}
