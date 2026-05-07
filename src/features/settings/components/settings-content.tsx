"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { authClient } from "@/features/auth/client/auth-client";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { toast } from "sonner";
import { User, Lock, Bell, ShieldCheck, Loader2, LogOut } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password required"),
  newPassword:     z.string().min(8, "At least 8 characters"),
  confirm:         z.string().min(1, "Confirm your password"),
}).refine((d) => d.newPassword === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

type Tab = "profile" | "security" | "notifications";

type Props = { initialUser: any };

export default function SettingsContent({ initialUser }: Props) {
  const [tab, setTab] = useState<Tab>("profile");
  const { data: session } = authClient.useSession();
  const user = session?.user ?? initialUser;
  const isAnon = !!(user as any)?.isAnonymous;

  const initials = user?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name ?? "" } });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: "", newPassword: "", confirm: "" } });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const onProfileSave = profileForm.handleSubmit(async ({ name }) => {
    setProfileLoading(true);
    try {
      const res = await authClient.updateUser({ name });
      if ((res as any)?.error) throw new Error((res as any).error.message);
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  });

  const onPasswordSave = passwordForm.handleSubmit(async ({ currentPassword, newPassword }) => {
    setPasswordLoading(true);
    try {
      const res = await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: false });
      if ((res as any)?.error) throw new Error((res as any).error.message);
      toast.success("Password changed successfully");
      passwordForm.reset();
    } catch (e: any) {
      toast.error(e.message || "Failed to change password");
    } finally {
      setPasswordLoading(false);
    }
  });

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "profile",       label: "Profile",       icon: User       },
    { key: "security",      label: "Security",      icon: Lock       },
    { key: "notifications", label: "Notifications", icon: Bell       },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <nav className="md:col-span-1 space-y-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="md:col-span-3 space-y-6">

          {/* Profile tab */}
          {tab === "profile" && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold flex items-center gap-2"><User className="w-4 h-4" /> Profile</h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user?.image ?? undefined} />
                    <AvatarFallback className="text-lg font-bold">{isAnon ? "G" : (initials ?? "?")}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{isAnon ? "Guest User" : user?.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{isAnon ? "Anonymous" : user?.role}</p>
                  </div>
                </div>

                {isAnon ? (
                  <div className="rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground text-center space-y-3">
                    <p>You&apos;re browsing as a guest. Create an account to save your preferences.</p>
                    <Button render={<a href="/signup" />} nativeButton={false}>Create Account</Button>
                  </div>
                ) : (
                  <form onSubmit={onProfileSave} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label>Full Name</Label>
                      <Input {...profileForm.register("name")} />
                      {profileForm.formState.errors.name && (
                        <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Email</Label>
                      <Input value={user?.email ?? ""} disabled className="opacity-60" />
                      <p className="text-xs text-muted-foreground">Email cannot be changed here</p>
                    </div>
                    <Button type="submit" disabled={profileLoading}>
                      {profileLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                      Save Changes
                    </Button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Security tab */}
          {tab === "security" && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card overflow-hidden">
                <div className="px-6 py-4 border-b border-border">
                  <h2 className="font-semibold flex items-center gap-2"><Lock className="w-4 h-4" /> Change Password</h2>
                </div>
                <div className="p-6">
                  {isAnon ? (
                    <p className="text-sm text-muted-foreground">Please sign in to manage your security settings.</p>
                  ) : (
                    <form onSubmit={onPasswordSave} className="space-y-4">
                      <div className="space-y-1.5">
                        <Label>Current Password</Label>
                        <Input type="password" {...passwordForm.register("currentPassword")} />
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>New Password</Label>
                        <Input type="password" {...passwordForm.register("newPassword")} />
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label>Confirm New Password</Label>
                        <Input type="password" {...passwordForm.register("confirm")} />
                        {passwordForm.formState.errors.confirm && (
                          <p className="text-xs text-destructive">{passwordForm.formState.errors.confirm.message}</p>
                        )}
                      </div>
                      <Button type="submit" disabled={passwordLoading}>
                        {passwordLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                        Update Password
                      </Button>
                    </form>
                  )}
                </div>
              </div>

              {!isAnon && (
                <div className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Sessions</h2>
                  </div>
                  <div className="p-6 space-y-3">
                    <p className="text-sm text-muted-foreground">Sign out from all other devices.</p>
                    <Button variant="outline" onClick={async () => {
                      await authClient.revokeOtherSessions();
                      toast.success("Other sessions revoked");
                    }}>
                      Revoke All Other Sessions
                    </Button>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-destructive/30 bg-card overflow-hidden">
                <div className="px-6 py-4 border-b border-destructive/30">
                  <h2 className="font-semibold text-destructive flex items-center gap-2"><LogOut className="w-4 h-4" /> Danger Zone</h2>
                </div>
                <div className="p-6 space-y-3">
                  <p className="text-sm text-muted-foreground">Signing out will end your current session.</p>
                  <Button variant="destructive" onClick={() => authClient.signOut()}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Notifications tab */}
          {tab === "notifications" && (
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: "Property status updates", desc: "When your property is verified or rejected" },
                  { label: "Appointment reminders",   desc: "24 hours before a scheduled appointment" },
                  { label: "New inquiries",           desc: "When someone messages you about a listing" },
                  { label: "Support replies",         desc: "When admin responds to your support ticket" },
                ].map(({ label, desc }) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                  </div>
                ))}
                <Separator />
                <p className="text-xs text-muted-foreground">Notification preferences are saved locally. Email notification settings require profile email confirmation.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
