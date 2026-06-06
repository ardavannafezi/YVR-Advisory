"""HTML email templates for YVR Advisory transactional emails."""

GOLD = "#c9a84c"
BLACK = "#0a0a0a"
DARK = "#111111"
BORDER = "#1e1e1e"
TEXT = "#e8e0d0"
MUTED = "#888880"
SITE_URL = "https://yvradvisory.ca"


def _base(subject_hint: str, content: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <title>{subject_hint}</title>
  <style>
    body, table, td {{ margin: 0; padding: 0; }}
    body {{ background-color: {DARK}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }}
    a {{ color: {GOLD}; text-decoration: none; }}
    @media only screen and (max-width: 600px) {{
      .container {{ width: 100% !important; }}
      .inner {{ padding: 28px 20px !important; }}
      .detail-label, .detail-value {{ display: block !important; width: 100% !important; padding: 4px 0 !important; }}
      .detail-row {{ border-bottom: 1px solid {BORDER} !important; }}
    }}
  </style>
</head>
<body style="background-color:{DARK}; margin:0; padding:0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:{DARK};">
    <tr>
      <td align="center" style="padding: 32px 16px 48px;">

        <!-- Container -->
        <table class="container" role="presentation" width="600" cellpadding="0" cellspacing="0"
          style="max-width:600px; width:100%; background-color:{BLACK}; border:1px solid {BORDER};">

          <!-- Gold top bar -->
          <tr><td style="height:3px; background-color:{GOLD};"></td></tr>

          <!-- Header -->
          <tr>
            <td align="center" style="padding: 32px 40px 24px; border-bottom: 1px solid {BORDER};">
              <a href="{SITE_URL}" style="text-decoration:none;">
                <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 18px; letter-spacing: 0.35em; color:{GOLD}; text-transform: uppercase; font-weight: normal;">YVR Advisory</span>
              </a>
              <p style="margin: 8px 0 0; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color:{MUTED};">Vancouver Nightlife</p>
            </td>
          </tr>

          <!-- Content -->
          {content}

          <!-- Footer -->
          <tr>
            <td style="border-top: 1px solid {BORDER}; padding: 24px 40px; background-color:{DARK};">
              <p style="margin:0 0 8px; font-size:12px; color:{MUTED}; line-height:1.6;">
                Questions? Reply to this email or contact us at
                <a href="mailto:info@yvradvisory.ca" style="color:{GOLD};">info@yvradvisory.ca</a>
              </p>
              <p style="margin:0; font-size:11px; color:#555550; line-height:1.5;">
                YVR Advisory &mdash; Vancouver, BC &mdash;
                <a href="{SITE_URL}" style="color:#555550;">yvradvisory.ca</a>
              </p>
            </td>
          </tr>

          <!-- Gold bottom bar -->
          <tr><td style="height:1px; background-color:{GOLD}; opacity:0.4;"></td></tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>"""


def _detail_row(label: str, value: str) -> str:
    if not value or value == "—":
        return ""
    return f"""
          <tr class="detail-row">
            <td class="detail-label" style="padding: 10px 0; font-size:11px; letter-spacing:0.15em; text-transform:uppercase; color:{MUTED}; white-space:nowrap; width:38%; border-bottom:1px solid {BORDER};">{label}</td>
            <td class="detail-value" style="padding: 10px 0 10px 16px; font-size:13px; color:{TEXT}; border-bottom:1px solid {BORDER};">{value}</td>
          </tr>"""


def _details_table(rows: list[tuple[str, str]]) -> str:
    rendered = "".join(_detail_row(label, value) for label, value in rows)
    if not rendered.strip():
        return ""
    return f"""
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
          {rendered}
        </table>"""


# ── Guestlist ─────────────────────────────────────────────────────────────────

def guestlist_user_email(
    *,
    full_name: str,
    event_name: str,
    event_date: str,
    venue_name: str,
    party_size: int,
) -> str:
    details = _details_table([
        ("Event", event_name),
        ("Date", event_date),
        ("Venue", venue_name),
        ("Party size", str(party_size)),
    ])
    content = f"""
          <!-- Hero -->
          <tr>
            <td class="inner" style="padding: 36px 40px 12px;">
              <p style="margin:0 0 6px; font-size:10px; letter-spacing:0.25em; text-transform:uppercase; color:{GOLD};">Guestlist Request Received</p>
              <h1 style="margin:0 0 16px; font-family: Georgia, 'Times New Roman', serif; font-size:26px; font-weight:normal; color:{TEXT}; line-height:1.3;">
                We&rsquo;ve got your request,<br>{full_name}.
              </h1>
              <p style="margin:0; font-size:14px; color:{MUTED}; line-height:1.7;">
                Your guestlist request is in. Our team will review it and send you a confirmation shortly.
                In the meantime, here&rsquo;s a summary of what you submitted.
              </p>
              {details}
            </td>
          </tr>

          <!-- Info box -->
          <tr>
            <td class="inner" style="padding: 20px 40px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:{DARK}; border-left:2px solid {GOLD}; padding:14px 18px;">
                    <p style="margin:0; font-size:12px; color:{MUTED}; line-height:1.7;">
                      Once approved, you&rsquo;ll receive a confirmation email. If you don&rsquo;t see it, check your
                      <strong style="color:{TEXT};">spam or junk folder</strong>.
                      You can also reach us at
                      <a href="mailto:info@yvradvisory.ca" style="color:{GOLD};">info@yvradvisory.ca</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>"""
    return _base("Guestlist Request — YVR Advisory", content)


def guestlist_admin_email(
    *,
    full_name: str,
    email: str,
    event_name: str,
    event_date: str,
    venue_name: str,
    party_size: int,
    source_page: str = "",
) -> str:
    details = _details_table([
        ("Name", full_name),
        ("Email", email),
        ("Party size", str(party_size)),
        ("Event", event_name),
        ("Date", event_date),
        ("Venue", venue_name),
        ("Source", source_page),
    ])
    content = f"""
          <tr>
            <td class="inner" style="padding: 36px 40px;">
              <p style="margin:0 0 6px; font-size:10px; letter-spacing:0.25em; text-transform:uppercase; color:{GOLD};">New Guestlist Signup</p>
              <h1 style="margin:0 0 8px; font-family: Georgia, 'Times New Roman', serif; font-size:22px; font-weight:normal; color:{TEXT};">
                {full_name}
              </h1>
              <p style="margin:0 0 4px; font-size:13px; color:{MUTED};">{email}</p>
              {details}
            </td>
          </tr>"""
    return _base("New Guestlist Signup — YVR Advisory Admin", content)


# ── Reservations ──────────────────────────────────────────────────────────────

def reservation_user_email(
    *,
    full_name: str,
    venue_name: str,
    date_str: str,
    party_size: int | None,
    occasion: str = "",
    budget_range: str = "",
) -> str:
    details = _details_table([
        ("Venue", venue_name),
        ("Date requested", date_str),
        ("Party size", str(party_size) if party_size else ""),
        ("Occasion", occasion),
        ("Budget", budget_range),
    ])
    content = f"""
          <!-- Hero -->
          <tr>
            <td class="inner" style="padding: 36px 40px 12px;">
              <p style="margin:0 0 6px; font-size:10px; letter-spacing:0.25em; text-transform:uppercase; color:{GOLD};">Table Reservation Request</p>
              <h1 style="margin:0 0 16px; font-family: Georgia, 'Times New Roman', serif; font-size:26px; font-weight:normal; color:{TEXT}; line-height:1.3;">
                Your night is being arranged,<br>{full_name}.
              </h1>
              <p style="margin:0; font-size:14px; color:{MUTED}; line-height:1.7;">
                We&rsquo;ve received your table reservation request. Our advisory team will reach out shortly
                to confirm all the details and make sure your experience is exceptional.
              </p>
              {details}
            </td>
          </tr>

          <!-- Info box -->
          <tr>
            <td class="inner" style="padding: 20px 40px 36px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:{DARK}; border-left:2px solid {GOLD}; padding:14px 18px;">
                    <p style="margin:0; font-size:12px; color:{MUTED}; line-height:1.7;">
                      Expect to hear from us within 24 hours. If you have any immediate questions,
                      reach us at <a href="mailto:info@yvradvisory.ca" style="color:{GOLD};">info@yvradvisory.ca</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>"""
    return _base("Reservation Request — YVR Advisory", content)


def reservation_admin_email(
    *,
    full_name: str,
    email: str,
    phone: str = "",
    venue_name: str,
    date_str: str,
    party_size: int | None,
    occasion: str = "",
    budget_range: str = "",
) -> str:
    details = _details_table([
        ("Name", full_name),
        ("Email", email),
        ("Phone", phone),
        ("Venue", venue_name),
        ("Date requested", date_str),
        ("Party size", str(party_size) if party_size else ""),
        ("Occasion", occasion),
        ("Budget", budget_range),
    ])
    content = f"""
          <tr>
            <td class="inner" style="padding: 36px 40px;">
              <p style="margin:0 0 6px; font-size:10px; letter-spacing:0.25em; text-transform:uppercase; color:{GOLD};">New Table Reservation</p>
              <h1 style="margin:0 0 8px; font-family: Georgia, 'Times New Roman', serif; font-size:22px; font-weight:normal; color:{TEXT};">
                {full_name}
              </h1>
              <p style="margin:0 0 4px; font-size:13px; color:{MUTED};">{email}</p>
              {details}
            </td>
          </tr>"""
    return _base("New Table Reservation — YVR Advisory Admin", content)


# ── Test email ────────────────────────────────────────────────────────────────

def test_email() -> str:
    content = f"""
          <tr>
            <td class="inner" style="padding: 36px 40px;">
              <p style="margin:0 0 6px; font-size:10px; letter-spacing:0.25em; text-transform:uppercase; color:{GOLD};">Email Test</p>
              <h1 style="margin:0 0 16px; font-family: Georgia, 'Times New Roman', serif; font-size:24px; font-weight:normal; color:{TEXT};">
                Your email notifications are working.
              </h1>
              <p style="margin:0; font-size:14px; color:{MUTED}; line-height:1.7;">
                This is a test message sent from the YVR Advisory admin panel.
                Guestlist and reservation emails will be delivered using this configuration.
              </p>
            </td>
          </tr>"""
    return _base("Test Email — YVR Advisory", content)
