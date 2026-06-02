import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


async def send_telegram(message: str) -> None:
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        return
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            await client.post(url, json={"chat_id": settings.telegram_chat_id, "text": message, "parse_mode": "HTML"})
    except Exception as exc:
        logger.warning("Telegram notification failed: %s", exc)


def _send_email_sync(to: str, subject: str, html_body: str) -> None:
    if not settings.smtp_host or not settings.smtp_user:
        return
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.email_from
    msg["To"] = to
    msg.attach(MIMEText(html_body, "html"))
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.sendmail(settings.email_from, to, msg.as_string())


async def send_email(to: str, subject: str, html_body: str) -> None:
    if not settings.smtp_host or not settings.smtp_user:
        return
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _send_email_sync, to, subject, html_body)
    except Exception as exc:
        logger.warning("Email notification failed: %s", exc)
