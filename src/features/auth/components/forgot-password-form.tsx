"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useState } from "react";

import { authClient } from "@/features/auth/client/auth-client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      const { error } = await authClient.forgetPassword({
        email:       values.email,
        redirectTo:  "/reset-password",
      });
      if (error) {
        toast.error(error.message ?? "Failed to send reset email");
      } else {
        setSent(true);
      }
    });
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <MailCheck className="w-7 h-7 text-primary" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-h2">Check your email</h1>
          <p className="text-lead text-sm">
            We sent a reset link to{" "}
            <span className="font-semibold text-foreground">{getValues("email")}</span>
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Didn&apos;t receive it?{" "}
          <button
            type="button"
            className="underline hover:text-foreground"
            onClick={() => setSent(false)}
          >
            Try again
          </button>
        </p>
        <Button variant="outline" className="w-full h-11" render={<Link href="/login" />} nativeButton={false}><ArrowLeft className="w-4 h-4 mr-2" /> Back to sign in</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-h2">Forgot password?</h1>
        <p className="text-lead text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isPending}
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" className="w-full h-11" disabled={isPending}>
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Sending…
            </span>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <Button variant="ghost" className="w-full h-11" render={<Link href="/login" />} nativeButton={false}><ArrowLeft className="w-4 h-4 mr-2" /> Back to sign in</Button>
    </div>
  );
}
