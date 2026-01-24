import React from "react"; // required for JSX
import { render } from "@react-email/render";
import { Resend } from "resend";
import ResetPasswordEmail from "@/components/emails/reset-password";
import ForgotPasswordEmail from "@/components/emails/reset-password";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendResetPasswordEmail({
  email,
  name,
  url,
}: {
  email: string;
  name?: string | null;
  url: string;
}) {
  // Send using Resend
  await resend.emails.send({
    from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
    to: email,
    subject: "Reset your password",
    react: ForgotPasswordEmail({
      email,
      name,
      url,
    }),
  });

  console.log(`Reset password email sent to ${email}`);
}
