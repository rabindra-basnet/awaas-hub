import * as React from "react";

interface ResetPasswordProps {
  userName: string;
  resetUrl: string;
}

export function ResetPasswordTemplate({ userName, resetUrl }: ResetPasswordProps) {
  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 600, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ background: "#f8fafc", borderRadius: 12, padding: 40 }}>
        <h1 style={{ color: "#0f172a", fontSize: 24, marginBottom: 8 }}>Reset your password</h1>
        <p style={{ color: "#475569", fontSize: 16, lineHeight: 1.6 }}>
          Hi {userName}, we received a request to reset your AawasHub account password.
        </p>
        <a
          href={resetUrl}
          style={{
            display: "inline-block",
            background: "#dc2626",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: 8,
            textDecoration: "none",
            fontWeight: 600,
            marginTop: 24,
          }}
        >
          Reset Password
        </a>
        <p style={{ color: "#94a3b8", fontSize: 14, marginTop: 32 }}>
          This link expires in 1 hour. If you did not request a reset, ignore this email.
        </p>
      </div>
    </div>
  );
}
