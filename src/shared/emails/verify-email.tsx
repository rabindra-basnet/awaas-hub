import * as React from "react";

interface VerifyEmailProps {
  userName: string;
  verificationUrl: string;
}

export function VerifyEmailTemplate({ userName, verificationUrl }: VerifyEmailProps) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ background: "#f8fafc", borderRadius: 12, padding: 40 }}>
        <h1 style={{ color: "#0f172a", fontSize: 24, marginBottom: 8 }}>Verify your email</h1>
        <p style={{ color: "#475569", fontSize: 16, lineHeight: 1.6 }}>
          Hi {userName}, thanks for signing up for AawasHub! Please verify your email address.
        </p>
        <a
          href={verificationUrl}
          style={{
            display: "inline-block",
            background: "#2563eb",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
            marginTop: 24,
          }}
        >
          Verify Email
        </a>
        <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 32 }}>
          This link expires in 24 hours. If you did not create an account, ignore this email.
        </p>
      </div>
    </div>
  );
}
