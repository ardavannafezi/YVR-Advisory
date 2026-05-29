import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "YVR Advisory";
  const subtitle = searchParams.get("subtitle") || "Vancouver Nightlife & Events";

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0a0a0a",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "60px 80px",
          fontFamily: "Georgia, serif",
          border: "1px solid rgba(201,168,76,0.3)",
        }}
      >
        <div style={{ width: 60, height: 1, background: "#c9a84c", marginBottom: 24 }} />
        <div style={{ fontSize: 52, color: "#f5f5f0", fontWeight: "bold", lineHeight: 1.1, marginBottom: 16, maxWidth: 900 }}>
          {title}
        </div>
        <div style={{ fontSize: 22, color: "#9a9a9a", marginBottom: 40 }}>
          {subtitle}
        </div>
        <div style={{ fontSize: 16, color: "#c9a84c", letterSpacing: "0.3em", textTransform: "uppercase" }}>
          YVR Advisory · Vancouver
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
