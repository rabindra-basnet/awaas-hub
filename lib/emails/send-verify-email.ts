import { Resend } from "resend";
import VerifyEmail from "@/components/emails/verify-email";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendVerifyEmail({
  email,
  name,
  url,
}: {
  email: string;
  name: string;
  url: string;
}) {
  await resend.emails.send({
    from: `${process.env.EMAIL_SENDER_NAME} <${process.env.EMAIL_SENDER_ADDRESS}>`,
    to: email,
    subject: "Verify your email address",
    react: VerifyEmail({ name, verifyUrl: url }),
  });
  console.log(`Verify email sent to ${email}`);
}
