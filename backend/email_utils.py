import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_NAME = os.getenv("FROM_NAME", "MLSA Chapter")


def send_confirmation_email(to_email: str, full_name: str, event_title: str,
                             event_date: str, location: str) -> bool:
    """Sends a registration confirmation email. Returns True on success.
    Silently returns False (and logs) if SMTP creds aren't configured yet,
    so registration itself never fails because of email."""
    if not SMTP_USER or not SMTP_PASSWORD:
        print(f"[email skipped - no SMTP creds set] Would confirm {to_email} for {event_title}")
        return False

    subject = f"You're registered: {event_title}"
    body = f"""Hi {full_name},

You're confirmed for "{event_title}", hosted by our Microsoft Learn Student Ambassador chapter.

Date: {event_date}
Location: {location}

We'll send any updates about this event to this email address. See you there!

— {FROM_NAME}
"""
    msg = MIMEMultipart()
    msg["From"] = f"{FROM_NAME} <{SMTP_USER}>"
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"[email failed] {e}")
        return False
