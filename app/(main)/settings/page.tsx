"use client";

import { useSession } from "@/lib/client/auth-client";
import { Role, Permission, hasPermission, hasAnyPermission } from "@/lib/rbac";

import ProfileSettings from "./_components/profile-settings";
import SecuritySettings from "./_components/security-settings";
import PreferencesSettings from "./_components/preferences-settings";
import AdminSettings from "./_components/admin-settings";

export default function SettingsPage() {
  const { data: session } = useSession();
  if (!session) return null;

  const role = session.user.role as Role;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>

      {hasPermission(role, Permission.VIEW_PROFILE) && (
        <ProfileSettings user={session.user} />
      )}

      {hasPermission(role, Permission.MANAGE_SETTINGS) && (
        <>
          <SecuritySettings />
          <PreferencesSettings />
        </>
      )}

      {hasAnyPermission(role, [
        Permission.MANAGE_USERS,
        Permission.VIEW_ANALYTICS,
      ]) && <AdminSettings />}
    </div>
  );
}
