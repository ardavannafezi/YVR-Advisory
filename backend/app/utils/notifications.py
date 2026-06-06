import asyncio
import logging

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings

logger = logging.getLogger(__name__)

RESEND_URL = "https://api.resend.com/emails"


async def load_db_notif_settings(db: AsyncSession) -> dict:
    from app.models.notification_settings import NotificationSettings
    row = await db.scalar(select(NotificationSettings).where(NotificationSettings.id == 1))
    if not row:
        return {}
    return {
        k: v for k, v in {
            "resend_api_key": row.resend_api_key,
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


async def send_email(
    to: str,
    subject: str,
    html_body: str,
    *,
    resend_api_key: str = "",
    email_from: str = "",
    **_: object,
) -> None:
    api_key = resend_api_key or settings.resend_api_key
    sender = email_from or settings.email_from
    if not api_key:
        logger.warning("Email skipped: no Resend API key configured")
        return
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.post(
                RESEND_URL,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={"from": sender, "to": [to], "subject": subject, "html": html_body},
            )
            if resp.status_code >= 400:
                logger.error("Resend API error to=%s status=%s body=%s", to, resp.status_code, resp.text)
            else:
                logger.info("Email sent via Resend to=%s id=%s", to, resp.json().get("id"))
    except Exception as exc:
        logger.error("Email notification failed to=%s: %s", to, exc, exc_info=True)
