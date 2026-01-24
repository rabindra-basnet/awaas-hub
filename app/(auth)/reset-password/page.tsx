import ResetPasswordForm from "./_components/reset-password-form";

// app/(auth)/reset-password/page.tsx
export const dynamic = "force-dynamic";
export default function Page() {
  return <ResetPasswordForm />;
}
