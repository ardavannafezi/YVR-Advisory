import asyncio
import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings

logger = logging.getLogger(__name__)


async def load_db_notif_settings(db: AsyncSession) -> dict:
    from app.models.notification_settings import NotificationSettings
    row = await db.scalar(select(NotificationSettings).where(NotificationSettings.id == 1))
    if not row:
        return {}
    return {
        k: v for k, v in {
            "smtp_host": row.smtp_host,
            "smtp_port": row.smtp_port,
            "smtp_user": row.smtp_user,
            "smtp_password": row.smtp_password,
            "email_from": row.email_from,
            "telegram_bot_token": row.telegram_bot_token,
            "telegram_chat_id": row.telegram_chat_id,
        }.items() if v
    }


async def send_telegram(
    message: str,
    *,
    telegram_bot_token: str = "",
    telegram_chat_id: str = "",
    **_: object,
) -> None:
    token = telegram_bot_token or settings.telegram_bot_token
    chat_id = telegram_chat_id or settings.telegram_chat_id
    if not token or not chat_id:
        return
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            await client.post(url, json={"chat_id": chat_id, "text": message, "parse_mode": "HTML"})
    except Exception as exc:
        logger.warning("Telegram notification failed: %s", exc)


def _send_email_sync(
    to: str,
    subject: str,
    html_body: str,
    smtp_host: str,
    smtp_port: int,
    smtp_user: str,
    smtp_password: str,
    email_from: str,
) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = email_from
    msg["To"] = to
    msg.attach(MIMEText(html_body, "html"))
    # Port 465 = implicit SSL; all others use STARTTLS
    if smtp_port == 465:
        with smtplib.SMTP_SSL(smtp_host, smtp_port) as server:
            server.login(smtp_user, smtp_password)
            server.sendmail(email_from, to, msg.as_string())
    else:
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_user, smtp_password)
            server.sendmail(email_from, to, msg.as_string())


async def send_email(
    to: str,
    subject: str,
    html_body: str,
    *,
    smtp_host: str = "",
    smtp_port: int = 0,
    smtp_user: str = "",
    smtp_password: str = "",
    email_from: str = "",
    **_: object,
) -> None:
    host = smtp_host or settings.smtp_host
    port = smtp_port or settings.smtp_port
    user = smtp_user or settings.smtp_user
    password = smtp_password or settings.smtp_password
    sender = email_from or settings.email_from
    if not host or not user:
        return
    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, _send_email_sync, to, subject, html_body, host, port, user, password, sender)
    except Exception as exc:
        logger.error("Email notification failed to=%s host=%s port=%s user=%s: %s", to, smtp_host, smtp_port, smtp_user, exc, exc_info=True)
