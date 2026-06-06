"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/auth";
import { GoldButton } from "@/components/ui/GoldButton";
import { FormField } from "@/components/forms/FormField";

interface NotifSettings {
  resend_api_key: string;
  email_from: string;
  telegram_bot_token: string;
  telegram_chat_id: string;
}

const EMPTY: NotifSettings = {
  resend_api_key: "",
  email_from: "",
  telegram_bot_token: "",
  telegram_chat_id: "",
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<NotifSettings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const [testEmail, setTestEmail] = useState("");
  const [testEmailStatus, setTestEmailStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [testEmailError, setTestEmailError] = useState("");

  const [testTgStatus, setTestTgStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");

  useEffect(() => {
    adminFetch<NotifSettings>("/api/admin/settings/notifications")
      .then((d) => setSettings({ ...EMPTY, ...d }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg(null);
    try {
      const updated = await adminFetch<NotifSettings>("/api/admin/settings/notifications", {
        method: "POST",
        body: JSON.stringify(settings),
      });
      setSettings({ ...EMPTY, ...updated });
      setSaveMsg("Settings saved.");
    } catch (err: unknown) {
      setSaveMsg(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleTestEmail(e: React.FormEvent) {
    e.preventDefault();
    setTestEmailStatus("sending");
    setTestEmailError("");
    try {
      await adminFetch("/api/admin/settings/test-email", {
        method: "POST",
        body: JSON.stringify({ to: testEmail }),
      });
      setTestEmailStatus("ok");
    } catch (err: unknown) {
      setTestEmailStatus("error");
      setTestEmailError(err instanceof Error ? err.message : "Failed.");
    }
  }

  async function handleTestTelegram() {
    setTestTgStatus("sending");
    try {
      await adminFetch("/api/admin/settings/test-telegram", { method: "POST" });
      setTestTgStatus("ok");
    } catch {
      setTestTgStatus("error");
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-white/5 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-10">
        <h1 className="font-serif text-4xl text-text-primary mb-2">Settings</h1>
        <div className="w-10 h-px bg-gold mb-4" />
        <p className="text-text-muted text-sm">Configure email and Telegram notifications.</p>
      </div>

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* ── Resend Email ── */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-4">Email (Resend)</p>
          <div className="card-surface p-6 flex flex-col gap-4">
            <p className="text-xs text-text-muted">
              Get your API key at{" "}
              <span className="text-gold">resend.com</span>. Add and verify{" "}
              <span className="font-mono text-text-primary">yvradvisory.ca</span> as a sending domain first.
            </p>
            <FormField
              label="Resend API Key"
              type="password"
              placeholder="re_••••••••••••••••••••••••"
              value={settings.resend_api_key}
              onChange={(e) => setSettings((s) => ({ ...s, resend_api_key: e.target.value }))}
            />
            <FormField
              label="From Address"
              placeholder="YVR Advisory <noreply@yvradvisory.ca>"
              value={settings.email_from}
              onChange={(e) => setSettings((s) => ({ ...s, email_from: e.target.value }))}
            />
          </div>
        </div>

        {/* ── Telegram ── */}
        <div>
          <p className="text-xs uppercase tracking-widest text-gold mb-4">Telegram</p>
          <div className="card-surface p-6 flex flex-col gap-4">
            <FormField
              label="Bot Token"
              placeholder="123456:ABC-DEF..."
              value={settings.telegram_bot_token}
              onChange={(e) => setSettings((s) => ({ ...s, telegram_bot_token: e.target.value }))}
            />
            <FormField
              label="Chat ID"
              placeholder="-100123456789"
              value={settings.telegram_chat_id}
              onChange={(e) => setSettings((s) => ({ ...s, telegram_chat_id: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <GoldButton type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save Settings"}
          </GoldButton>
          {saveMsg && (
            <span className={`text-sm ${saveMsg === "Settings saved." ? "text-green-400" : "text-red-400"}`}>
              {saveMsg}
            </span>
          )}
        </div>
      </form>

      {/* ── Test Email ── */}
      <div className="mt-12">
        <p className="text-xs uppercase tracking-widest text-gold mb-4">Send Test Email</p>
        <div className="card-surface p-6">
          <form onSubmit={handleTestEmail} className="flex flex-col gap-4">
            <FormField
              label="Send test to"
              type="email"
              placeholder="you@example.com"
              value={testEmail}
              onChange={(e) => {
                setTestEmail(e.target.value);
                setTestEmailStatus("idle");
              }}
            />
            {testEmailStatus === "error" && (
              <p className="text-sm text-red-400">{testEmailError || "Failed to send."}</p>
            )}
            {testEmailStatus === "ok" && (
              <p className="text-sm text-green-400">Test email sent. Check your inbox (and spam).</p>
            )}
            <GoldButton type="submit" variant="outline" disabled={testEmailStatus === "sending" || !testEmail}>
              {testEmailStatus === "sending" ? "Sending…" : "Send Test Email"}
            </GoldButton>
          </form>
        </div>
      </div>

      {/* ── Test Telegram ── */}
      <div className="mt-8">
        <p className="text-xs uppercase tracking-widest text-gold mb-4">Test Telegram</p>
        <div className="card-surface p-6 flex flex-col gap-4">
          {testTgStatus === "ok" && <p className="text-sm text-green-400">Message sent. Check your Telegram.</p>}
          {testTgStatus === "error" && <p className="text-sm text-red-400">Failed. Check bot token and chat ID.</p>}
          <GoldButton
            variant="outline"
            disabled={testTgStatus === "sending"}
            onClick={handleTestTelegram}
          >
            {testTgStatus === "sending" ? "Sending…" : "Send Test Telegram Message"}
          </GoldButton>
        </div>
      </div>
    </div>
  );
}
