import { ImageResponse } from "next/og";

export const alt = "AWS Lambda Sandbox — Run Node.js Handlers in Your Browser | DevBench";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const name = "AWS Lambda Sandbox";
  const description = "Run Node.js Lambda handlers against API Gateway, SQS, S3, EventBridge events — sandboxed in your browser.";
  const category = "Dev";
  const icon = "λ";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a14 0%, #13132b 60%, #0f0f23 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "auto" }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M7 3.5 L4 6.5 L7 9.5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12.25" y1="3" x2="10.75" y2="10" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
            <path d="M14.5 3.5 L17.5 6.5 L14.5 9.5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="2" y="12" width="20" height="2.5" rx="1.25" fill="#6366f1" />
            <rect x="4.5" y="14.5" width="2" height="6.5" rx="1" fill="#6366f1" opacity="0.75" />
            <rect x="17.5" y="14.5" width="2" height="6.5" rx="1" fill="#6366f1" opacity="0.75" />
          </svg>
          <span style={{ fontSize: "22px", fontWeight: 700, color: "#6366f1" }}>DevBench</span>
          <span style={{ fontSize: "16px", color: "#4b5563", marginLeft: "8px" }}>·</span>
          <span
            style={{
              marginLeft: "8px",
              padding: "4px 12px",
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "999px",
              fontSize: "14px",
              color: "#a5b4fc",
            }}
          >
            {category}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px", margin: "32px 0 20px" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(99,102,241,0.3)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: 700,
              color: "#a5b4fc",
              fontFamily: "monospace",
            }}
          >
            {icon}
          </div>
          <h1
            style={{
              fontSize: name.length > 20 ? "52px" : "64px",
              fontWeight: 800,
              color: "#ffffff",
              margin: 0,
              letterSpacing: "-1px",
              lineHeight: 1.1,
            }}
          >
            {name}
          </h1>
        </div>
        <p
          style={{
            fontSize: "26px",
            color: "#9ca3af",
            margin: "0 0 32px 0",
            lineHeight: 1.4,
            maxWidth: "900px",
          }}
        >
          {description}
        </p>
        <div style={{ display: "flex", gap: "12px" }}>
          {["Free", "No Signup", "Client-Side Only"].map((b) => (
            <div
              key={b}
              style={{
                padding: "6px 16px",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                borderRadius: "999px",
                color: "#6ee7b7",
                fontSize: "16px",
              }}
            >
              {b}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
