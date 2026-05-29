"use client";

const SESSION_KEY = "yvr_session_id";
const EMAIL_KEY = "yvr_email";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function setTrackedEmail(email: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(EMAIL_KEY, email);
  }
}

export function getTrackedEmail(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(EMAIL_KEY);
}

export async function track(eventType: string, payload: Record<string, unknown> = {}) {
  const session_id = getSessionId();
  if (!session_id) return;
  const email = getTrackedEmail();

  try {
    await fetch(`${API_URL}/api/analytics/track`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id, email, event_type: eventType, payload }),
    });
  } catch {
    // fire-and-forget
  }
}
