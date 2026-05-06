# Role Simplification: `buyer | seller` → `user`

**Branch:** `feat/role-simplification`  
**Status:** Planning  
**Better-Auth version:** `^1.4.10`

---

## 1. Goal

Collapse the current four-role system (`admin | seller | buyer | guest`) into three:

| Current | New | Notes |
|---------|-----|-------|
| `admin` | `admin` | Unchanged |
| `seller` | `user` | Merged into one authenticated role |
| `buyer` | `user` | Merged into one authenticated role |
| `guest` | `guest` | Unchanged (anonymous plugin) |

**Why**: There is no meaningful permission difference between a buyer and a seller in this app today — both can create properties, manage appointments, upload files, etc. The distinction adds signup friction and branch complexity throughout the codebase with no payoff.

---

## 2. New Permission Map

Replace `lib/rbac/index.ts` with better-auth's native `access` module.

```ts
// lib/rbac/access.ts  (new file, replaces lib/rbac/index.ts)
import { createAccessControl } from "better-auth/plugins/access"
import { adminAc } from "better-auth/plugins/admin/access"

export const ac = createAccessControl({
  property:    ["create", "read", "update", "delete"],
  appointment: ["create", "read", "update", "delete"],
  file:        ["read",   "create", "delete"],
  favorite:    ["read",   "create", "delete"],
  user:        ["read",   "update", "delete", "ban"],
  analytics:   ["read"],
  ads:         ["read",   "manage"],
  support:     ["read",   "manage"],
})

// ── Role definitions ──────────────────────────────────────────────────────

export const userRole = ac.newRole({
  property:    ["create", "read", "update", "delete"],
  appointment: ["create", "read", "update", "delete"],
  file:        ["read", "create", "delete"],
  favorite:    ["read", "create", "delete"],
  support:     ["read"],
})

export const adminRole = ac.newRole({
  ...adminAc.statements,          // built-in better-auth admin permissions
  property:    ["create", "read", "update", "delete"],
  appointment: ["create", "read", "update", "delete"],
  file:        ["read", "create", "delete"],
  favorite:    ["read", "create", "delete"],
  user:        ["read", "update", "delete", "ban"],
  analytics:   ["read"],
  ads:         ["read", "manage"],
  support:     ["read", "manage"],
})
```

### Old → new permission mapping

| Old `Permission` enum | Replaces with `ac` check |
|-----------------------|--------------------------|
| `VIEW_PROPERTIES` | `property.read` |
| `MANAGE_PROPERTIES` | `property.create / update / delete` |
| `VIEW_FAVORITES` | `favorite.read` |
| `MANAGE_FAVORITES` | `favorite.create / delete` |
| `MANAGE_APPOINTMENTS` | `appointment.create / update / delete` |
| `MANAGE_USERS` | `user.update / delete / ban` |
| `VIEW_ANALYTICS` | `analytics.read` |
| `VIEW_DASHBOARD` | any authenticated session |
| `VIEW_PROFILE` | any authenticated session |
| `MANAGE_SETTINGS` | any authenticated session |
| `VIEW_FILES` | `file.read` |
| `MANAGE_FILES` | `file.create / delete` |
| `VIEW_ADS` | `ads.read` |
| `MANAGE_ADS` | `ads.manage` |
| `VIEW_SUPPORT_CHAT` | `support.read` |
| `MANAGE_SUPPORT_CHAT` | `support.manage` |

---

## 3. Better-Auth Admin Plugin Integration

### 3.1 Server config — `lib/server/auth.ts`

```ts
import { admin } from "better-auth/plugins"
import { ac, adminRole, userRole } from "@/lib/rbac/access"

plugins: [
  nextCookies(),
  lastLoginMethod(),
  anonymous({ generateName: () => "Guest", emailDomainName: "awaashub.com" }),

  admin({
    ac,
    roles: { admin: adminRole, user: userRole },
    defaultRole: "user",            // every new signup is "user"
    adminUserIds: [],               // optional: seed admin by env
  }),
],
```

**What this enables natively:**
- `auth.api.listUsers` — replaces `GET /api/admin/users`
- `auth.api.setRole` — replaces `PATCH /api/admin/users/[id]`
- `auth.api.banUser` / `auth.api.unbanUser` — replaces `POST /api/admin/users/[id]/ban|unban`
- `auth.api.removeUser` — replaces `DELETE /api/admin/users/[id]/delete`
- `auth.api.createUser` — admin-side user creation
- `auth.api.impersonateUser` — session impersonation (admin only)

### 3.2 Client config — `lib/client/auth-client.ts`

```ts
import { adminClient } from "better-auth/client/plugins"

plugins: [
  inferAdditionalFields<typeof auth>(),
  lastLoginMethodClient(),
  anonymousClient(),
  adminClient(),           // adds authClient.admin.*
],
```

**Client methods unlocked:**
```ts
authClient.admin.listUsers({ query: { limit: 20 } })
authClient.admin.setRole({ userId, role: "user" })
authClient.admin.banUser({ userId, banReason, banExpiresIn })
authClient.admin.unbanUser({ userId })
authClient.admin.removeUser({ userId })
authClient.admin.createUser({ name, email, password, role })
```

### 3.3 Server-side permission check helper

```ts
// lib/rbac/check.ts  (replaces hasPermission / hasAnyPermission helpers)
import { auth } from "@/lib/server/auth"

export async function requiresRole(
  headers: Headers,
  role: "admin" | "user",
) {
  const session = await auth.api.getSession({ headers })
  if (!session) throw new Error("Unauthorized")
  if (session.user.role !== role) throw new Error("Forbidden")
  return session
}

export async function requiresAdmin(headers: Headers) {
  return requiresRole(headers, "admin")
}
```

---

## 4. Files to Change

### 4.1 Core / Auth

| File | Change |
|------|--------|
| `lib/server/auth.ts` | Add `admin` plugin with `ac`, `adminRole`, `userRole`, `defaultRole: "user"` |
| `lib/client/auth-client.ts` | Add `adminClient()` plugin |
| `lib/rbac/index.ts` | **Delete** — replace with `lib/rbac/access.ts` |
| `lib/rbac/access.ts` | **Create** — `createAccessControl`, role definitions |
| `lib/rbac/check.ts` | **Create** — `requiresAdmin`, `requiresRole` helpers |
| `types/index.ts` | Change `UserRole = "buyer" \| "seller" \| "admin"` → `"user" \| "admin"` |
| `hooks/use-role-permissions.ts` | Replace `Role` enum usage with `ac.hasPermission()` from session |

### 4.2 Signup & Auth Flow

| File | Change |
|------|--------|
| `app/(auth)/signup/page.tsx` | Remove role picker dropdown; remove `role: z.enum(["buyer","seller"])` from Zod schema; role auto-assigned as `"user"` via `defaultRole` in admin plugin |
| `app/(auth)/update-profile/page.tsx` | **This page exists only to set buyer/seller post-Google-OAuth.** With `defaultRole: "user"` it becomes redundant. Either: (a) delete it and change Google callbackURL to `/dashboard`, or (b) keep it as a profile-completion page (name/avatar only, no role). |
| `app/api/auth/update-role/route.ts` | Remove `buyer`/`seller` from valid values; restrict to `"user"` only (admin role changes go through admin plugin). Can also delete this route entirely and replace with `auth.api.setRole`. |

### 4.3 Admin API Routes (to be replaced by better-auth admin plugin)

These custom routes are superseded by `auth.api.*` — they can be deleted once the admin plugin is wired up:

| File | Replaced by |
|------|-------------|
| `app/api/admin/users/route.ts` | `auth.api.listUsers` |
| `app/api/admin/users/[id]/route.ts` | `auth.api.setRole` |
| `app/api/admin/users/[id]/ban/route.ts` | `auth.api.banUser` |
| `app/api/admin/users/[id]/unban/route.ts` | `auth.api.unbanUser` |
| `app/api/admin/users/[id]/delete/route.ts` | `auth.api.removeUser` |
| `app/api/admin/users/[id]/reset-password/route.ts` | Keep (not in better-auth admin plugin) |

### 4.4 Client Queries (update or delete)

| File | Change |
|------|--------|
| `lib/client/queries/users.queries.ts` | Replace `useAdminUsers`, `useChangeRole`, `useDeleteUser`, `useBanUser`, `useUnbanUser` with `authClient.admin.*` calls |
| `lib/client/queries/roles.queries.ts` | Delete `useUpdateRoleMutation` (was for buyer/seller self-selection) |

### 4.5 Dashboard

| File | Change |
|------|--------|
| `lib/server/fetchers/dashboard.fetcher.ts` | Remove `isSeller`/`isBuyer` flags. Collapse to `isUser = role === "user"`. The `propertyQuery` (currently `isSeller ? { sellerId: userId } : {}`) becomes `{ ownerId: userId }` — see §6. The appointments query collapses: `isUser` shows own appointments. |
| `app/(main)/dashboard/_components/dashboard-content.tsx` | Remove `isSeller` flag. Remove the `role !== "buyer"` guard on "Add Property" link (all users can add). Remove seller-specific `PropertyStatusBar` conditional — show it for all users who have properties. |

### 4.6 Properties

| File | Change |
|------|--------|
| `app/api/properties/route.ts` | `Role.ADMIN` check is fine; no buyer/seller references here |
| `app/api/properties/[id]/route.ts` | Check for `session.user.role === "admin"` directly (string) |
| `app/(main)/properties/[id]/_components/pages.tsx` | `canManage` check: `isAdmin \|\| isOwner` (remove `MANAGE_PROPERTIES` permission check as redundant — all users can manage their own) |
| `app/(main)/properties/_components/properties-content.tsx` | Audit for any seller-gated UI |
| `app/api/properties/[id]/seller/route.ts` | The term "seller" in this endpoint can stay (it's the property owner's info) — no role check needed, just ownership |

### 4.7 Other API Routes

| File | Change |
|------|--------|
| `app/api/properties/[id]/contact-access/route.ts` | Replace `role === Role.ADMIN` with `session.user.role === "admin"` (no Role enum needed) |
| `app/api/appointments/[id]/route.ts` | Audit for `Role.SELLER/BUYER` references |
| `app/api/analytics/route.ts` | Audit for role checks |
| `app/api/support/route.ts` | Admin check only |

### 4.8 Users Admin UI

| File | Change |
|------|--------|
| `app/(main)/users/_components/users-page.tsx` | Change `roleFilter` from `"all" \| "buyer" \| "seller"` to `"all" \| "user" \| "admin"`. Update role badge colours. Replace `useChangeRole` etc with `authClient.admin.*` |

### 4.9 RBAC Page Guards

| File | Change |
|------|--------|
| `app/(main)/_components/pages-permissions.ts` | Replace `Role.ADMIN` imports with string `"admin"`. Keep `onlyForRoles` logic but with new string values. |
| `app/(main)/layout.tsx` | Audit `hasAnyPermission` calls; replace with `ac.hasPermission(role, resource, action)` |

---

## 5. Property Model: `sellerId` → `ownerId`

The `Property` model has a `sellerId` field. With the role rename, this is semantically misleading.

**Recommended:** rename `sellerId` → `ownerId` everywhere:
- `lib/models/Property.ts` — update schema field
- `lib/server/fetchers/dashboard.fetcher.ts` — `ownerId: userId`
- `app/(main)/properties/[id]/_components/pages.tsx` — `property.ownerId === session.user.id`
- `app/api/properties/*.ts` — all routes that read/write `sellerId`
- `lib/server/fetchers/properties.fetcher.ts` — filter queries
- `types/index.ts` — `ownerId` in the `Property` interface

**This requires a DB migration** (see §6).

---

## 6. Database Migration Script

Create `scripts/migrate-roles.ts`. Run once with `bun --env-file=.env.local scripts/migrate-roles.ts`.

```ts
import { connectToDatabase } from "@/lib/server/db"

async function migrate() {
  const { db } = await connectToDatabase()
  const users = db.collection("users")
  const properties = db.collection("properties")

  // 1. Migrate roles: buyer → user, seller → user
  const roleResult = await users.updateMany(
    { role: { $in: ["buyer", "seller"] } },
    { $set: { role: "user" } },
  )
  console.log(`Migrated ${roleResult.modifiedCount} users to role "user"`)

  // 2. (Optional) Rename sellerId → ownerId on properties
  const propResult = await properties.updateMany(
    { sellerId: { $exists: true } },
    [{ $set: { ownerId: "$sellerId" } }],
  )
  await properties.updateMany(
    { ownerId: { $exists: true } },
    { $unset: { sellerId: "" } },
  )
  console.log(`Migrated ${propResult.modifiedCount} properties sellerId → ownerId`)
}

migrate().catch(console.error)
```

> **Run this AFTER deploying auth changes but BEFORE removing old role checks from API routes.**

---

## 7. Rollout Order

Execute in this sequence to avoid a broken intermediate state:

```
1. lib/rbac/access.ts          — create new access control
2. lib/server/auth.ts          — wire admin plugin + defaultRole
3. lib/client/auth-client.ts   — add adminClient
4. scripts/migrate-roles.ts    — run DB migration
5. types/index.ts              — update UserRole type
6. lib/server/fetchers/        — remove isSeller/isBuyer
7. API routes                  — update role string checks
8. Client queries              — replace with authClient.admin.*
9. Signup page                 — remove role picker
10. update-profile page        — simplify or delete
11. Dashboard + Users UI       — remove buyer/seller UI branches
12. Delete old lib/rbac/index.ts + custom admin routes
```

---

## 8. What Stays the Same

- `guest` role (anonymous plugin) — no changes
- `hasAccess` / premium credit system for property contacts — no changes
- `PropertyContactAccess` model — no changes
- Payment / eSewa flow — no changes
- Email templates — no changes
- The term "seller" in API URL paths (`/api/properties/[id]/seller`) — cosmetic only, can be renamed later

---

## 9. Open Questions Before Implementation

1. **`update-profile` page**: delete entirely (simplest) or repurpose as name/avatar completion? If deleted, Google OAuth `callbackURL` must change from `/update-profile` → `/dashboard`.
2. **`ownerId` rename**: do it now or defer? Doing it now is cleaner but adds DB migration complexity.
3. **`MANAGE_FILES` for all users**: currently only sellers can upload files. Should all users be able to upload files (for property listings they create)?
4. **Dashboard stat cards**: the `isSeller` branch shows "Sold Properties" and "Property Status" charts. Should these show for all users, or only when the user has at least one property?
