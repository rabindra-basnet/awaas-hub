// "use client";

// import { useState } from "react";
// import { useSearchParams, useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Eye, EyeOff } from "lucide-react";
// import { useResetPasswordMutation } from "@/lib/client/queries/auth.queries";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";

// // Zod validation schema
// const resetPasswordSchema = z
//   .object({
//     password: z
//       .string()
//       .min(8, "Password must be at least 8 characters")
//       .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
//       .regex(/[a-z]/, "Password must contain at least one lowercase letter")
//       .regex(/[0-9]/, "Password must contain at least one number"),
//     confirmPassword: z.string(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "Passwords don't match",
//     path: ["confirmPassword"],
//   });

// type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// export default function ResetPassword() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token");

//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ResetPasswordFormValues>({
//     resolver: zodResolver(resetPasswordSchema),
//     defaultValues: {
//       password: "",
//       confirmPassword: "",
//     },
//   });

//   const resetPassword = useResetPasswordMutation();

//   const onSubmit = async (data: ResetPasswordFormValues) => {
//     if (!token) return;

//     if (password.length < 8) {
//       resetPassword.reset();
//       return;
//     }

//     if (password !== confirmPassword) {
//       return;
//     }

//     resetPassword.mutate(
//       { token, newPassword: password },
//       {
//         onSuccess: () => {
//           router.push("/login");
//         },
//       },
//     );
//   };

//   if (!token) {
//     return (
//       <div className="max-w-md mx-auto mt-20 text-center">
//         <h1 className="text-xl font-semibold">Invalid reset link</h1>
//         <p className="text-muted-foreground mt-2">
//           This password reset link is invalid or expired.
//         </p>
//       </div>
//     );
//   }

//   if (!token) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white p-4">
//         <Card className="w-full max-w-md">
//           <CardHeader className="text-center">
//             <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
//               <Lock className="w-6 h-6 text-red-600" />
//             </div>
//             <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
//             <CardDescription>
//               This password reset link is invalid or has expired.
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Button
//               className="w-full"
//               onClick={() => (window.location.href = "/forgot-password")}
//             >
//               Request New Link
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-md mx-auto mt-20 space-y-6">
//       <h1 className="text-2xl font-bold text-center">Reset your password</h1>

//       <div className="space-y-4">
//         {/* Password Field */}
//         <div className="relative">
//           <Label>New Password</Label>
//           <Input
//             type={showPassword ? "text" : "password"}
//             placeholder="Enter new password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             disabled={resetPassword.isPending}
//           />
//           <Button
//             type="button"
//             variant="ghost"
//             size="icon"
//             className="absolute right-2 top-1/2 -translate-y-1/2 p-0"
//             onClick={() => setShowPassword(!showPassword)}
//           >
//             {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//           </Button>
//         </div>

//         {/* Confirm Password Field */}
//         <div className="relative">
//           <Label>Confirm Password</Label>
//           <Input
//             type={showConfirmPassword ? "text" : "password"}
//             placeholder="Confirm new password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             disabled={resetPassword.isPending}
//           />
//           <Button
//             type="button"
//             variant="ghost"
//             size="icon"
//             className="absolute right-2 top-1/2 -translate-y-1/2 p-0"
//             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//           >
//             {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//           </Button>
//         </div>

//         <Button
//           className="w-full"
//           onClick={onSubmit}
//           disabled={resetPassword.isPending}
//         >
//           {resetPassword.isPending ? "Resetting..." : "Reset Password"}
//         </Button>
//       </div>
//     </div>
//   );
// }

//   return (
//     <div className="min-h-screen flex items-center justify-center p-4">
//       <Card className="w-full max-w-md shadow-lg">
//         <CardHeader className="space-y-1 text-center">
//           <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
//             <Lock className="w-6 h-6 text-blue-600" />
//           </div>
//           <CardTitle className="text-2xl font-bold">
//             Reset Your Password
//           </CardTitle>
//           <CardDescription>
//             Enter your new password below to secure your account
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <div className="space-y-4">
//             {/* Password Field */}
//             <div className="space-y-2">
//               <Label htmlFor="password">New Password</Label>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Enter your new password"
//                   disabled={isLoading}
//                   {...register("password")}
//                   className="pr-10"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
//                   tabIndex={-1}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="w-4 h-4" />
//                   ) : (
//                     <Eye className="w-4 h-4" />
//                   )}
//                 </button>
//               </div>
//               {errors.password && (
//                 <p className="text-sm font-medium text-red-500">
//                   {errors.password.message}
//                 </p>
//               )}
//             </div>

//             {/* Confirm Password Field */}
//             <div className="space-y-2">
//               <Label htmlFor="confirmPassword">Confirm Password</Label>
//               <div className="relative">
//                 <Input
//                   id="confirmPassword"
//                   type={showConfirmPassword ? "text" : "password"}
//                   placeholder="Confirm your new password"
//                   disabled={isLoading}
//                   {...register("confirmPassword")}
//                   className="pr-10"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
//                   tabIndex={-1}
//                 >
//                   {showConfirmPassword ? (
//                     <EyeOff className="w-4 h-4" />
//                   ) : (
//                     <Eye className="w-4 h-4" />
//                   )}
//                 </button>
//               </div>
//               {errors.confirmPassword && (
//                 <p className="text-sm font-medium text-red-500">
//                   {errors.confirmPassword.message}
//                 </p>
//               )}
//             </div>

//             {/* Password Requirements */}
//             <div className="bg-slate-50 rounded-lg p-3 space-y-1">
//               <p className="text-xs font-medium text-slate-700 mb-2">
//                 Password must contain:
//               </p>
//               <ul className="text-xs text-slate-600 space-y-1">
//                 <li className="flex items-center gap-2">
//                   <div className="w-1 h-1 bg-slate-400 rounded-full" />
//                   At least 8 characters
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <div className="w-1 h-1 bg-slate-400 rounded-full" />
//                   One uppercase letter
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <div className="w-1 h-1 bg-slate-400 rounded-full" />
//                   One lowercase letter
//                 </li>
//                 <li className="flex items-center gap-2">
//                   <div className="w-1 h-1 bg-slate-400 rounded-full" />
//                   One number
//                 </li>
//               </ul>
//             </div>

//             <Button
//               className="w-full"
//               disabled={isLoading}
//               onClick={handleSubmit(onSubmit)}
//             >
//               {isLoading ? (
//                 <span className="flex items-center gap-2">
//                   <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   Resetting Password...
//                 </span>
//               ) : (
//                 "Reset Password"
//               )}
//             </Button>

//             <div className="text-center">
//               <a
//                 href="/login"
//                 className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
//               >
//                 Back to Login
//               </a>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { useResetPasswordMutation } from "@/lib/client/queries/auth.queries";
import Link from "next/link";

/* ---------------- ZOD SCHEMA ---------------- */
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(/[A-Z]/, "One uppercase letter required")
      .regex(/[a-z]/, "One lowercase letter required")
      .regex(/[0-9]/, "One number required"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const router = useRouter();
  const token = useSearchParams().get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPassword = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data: ResetPasswordFormValues) => {
    if (!token) return;

    resetPassword.mutate(
      { token, newPassword: data.password },
      {
        onSuccess: () => router.push("/login"),
      },
    );
  };

  /* ---------------- INVALID TOKEN ---------------- */
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-red-600" />
            </div>
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              onClick={() => router.push("/forgot-password")}
            >
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---------------- FORM ---------------- */
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Password */}
          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="pr-10"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label>Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                className="pr-10"
                placeholder="Enter your confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            className="w-full"
            disabled={resetPassword.isPending}
            onClick={handleSubmit(onSubmit)}
          >
            {resetPassword.isPending ? "Resetting..." : "Reset Password"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="underline hover:text-primary">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
