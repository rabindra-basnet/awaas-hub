import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/features/auth/server/session";
import { getAuth } from "@/features/auth/server/auth";
import { Resend } from "resend";
import { env } from "@/env";
import { ResetPasswordTemplate } from "@/shared/emails/reset-password";
import { forbidden, notFound, unauthorized } from "@/shared/lib/error";
import { Role } from "@/features/auth/rbac/access";
import * as React from "react";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await getServerSession();
  if (!session) return unauthorized();
  if (session.user.role !== Role.ADMIN) return forbidden();

  const auth = await getAuth();
  const user = await auth.api.getUser({ query: { userId: id } }).catch(() => null);
  if (!user) return notFound();

  const token = await auth.api.generatePasswordResetToken({ body: { userId: id } }).catch(() => null);
  if (!token) return NextResponse.json({ message: "Failed to generate token" }, { status: 500 });

  const resetUrl = `${env.BETTER_AUTH_URL}/reset-password?token=${(token as any).token}`;
  const resend = new Resend(env.RESEND_API_KEY);

  await resend.emails.send({
    from: env.EMAIL_SENDER_ADDRESS,
    to: (user as any).email,
    subject: "Reset your AawasHub password",
    react: React.createElement(ResetPasswordTemplate, {
      userName: (user as any).name || "User",
      resetUrl,
    }),
  });

  return NextResponse.json({ success: true });
}
