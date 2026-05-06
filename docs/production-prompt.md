# AawasHub — Production-Ready Build Prompt

Use this prompt verbatim with Claude Code to build a production-grade real estate platform. Every
system must be built to funded-startup MVP quality — no stubs, no TODO comments, no half-finished
implementations.

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15+ — App Router, React 19, TypeScript strict |
| Database | MongoDB via Mongoose — single cached `_mongoose` global |
| Auth | better-auth ^1.4+ with `admin`, `anonymous`, `lastLoginMethod` plugins |
| Data fetching | TanStack Query v5 — `HydrationBoundary` + `useSuspenseQuery` on every SSR page |
| UI | shadcn/ui (Radix) + Tailwind CSS v4 via `postcss.config.mjs` |
| Storage | Cloudflare R2 via `@aws-sdk/client-s3` with presigned URLs |
| Real-time | Supabase broadcast-only (no subscription needed) — REST endpoint per channel |
| Email | Resend + React Email component templates |
| Maps | `react-leaflet` with SSR-safe `dynamic()` imports |
| Payments | Provider-agnostic billing engine (see §Billing) |
| Animation | framer-motion for page transitions and card reveals |
| Charts | recharts for analytics dashboards |

---

## Architecture: Vertical Slice

Every feature owns its own model, server fetcher, client queries, components, and API handlers.
Do NOT use a flat `lib/models/`, `lib/client/queries/` structure.

```
src/
├── app/                          # Next.js App Router — thin shells only
│   ├── (home)/                   # Public landing + map pages
│   ├── (auth)/                   # Auth flows
│   ├── (main)/                   # Protected dashboard shell
│   │   ├── layout.tsx            # Sidebar + header + RBAC guards
│   │   └── [feature]/page.tsx    # Imports from features/{name}/
│   ├── (docs)/                   # Static docs pages
│   └── api/                      # Route handlers import from features/{name}/api/
│
├── features/
│   ├── properties/
│   │   ├── models/               # Mongoose schema + TypeScript interfaces
│   │   │   ├── property.model.ts
│   │   │   └── property-contact-access.model.ts
│   │   ├── server/
│   │   │   ├── properties.fetcher.ts   # Server-side MongoDB queries
│   │   │   └── properties.actions.ts   # Validation + write helpers
│   │   ├── queries/
│   │   │   └── properties.queries.ts   # TanStack Query hooks (client)
│   │   ├── components/
│   │   │   ├── property-form.tsx
│   │   │   ├── property-list-card.tsx
│   │   │   ├── properties-content.tsx
│   │   │   ├── delete-property.tsx
│   │   │   ├── map-picker.tsx          # Leaflet GPS pin + boundary polygon
│   │   │   ├── premium-map.tsx         # Full-screen premium map page
│   │   │   ├── livemap.tsx             # All properties on map
│   │   │   └── video-tour.tsx          # Custom HTML5 + iframe player
│   │   └── api/
│   │       ├── list.handler.ts
│   │       ├── detail.handler.ts
│   │       ├── create.handler.ts
│   │       ├── update.handler.ts
│   │       └── delete.handler.ts
│   │
│   ├── chat/
│   │   ├── models/
│   │   │   ├── property-chat.model.ts  # Buyer↔Owner per-property thread
│   │   │   └── conversation.model.ts  # Legacy general conversation
│   │   ├── server/
│   │   │   └── realtime.ts            # Supabase broadcast helpers
│   │   ├── queries/
│   │   │   └── chat.queries.ts
│   │   └── components/
│   │       ├── property-direct-chat.tsx
│   │       ├── seller-chat-inbox.tsx
│   │       └── floating-chat.tsx
│   │
│   ├── support/
│   │   ├── models/
│   │   │   └── support-conversation.model.ts
│   │   ├── queries/
│   │   │   └── support.queries.ts
│   │   └── components/
│   │       ├── support-chat.tsx        # User → Admin
│   │       └── support-inbox.tsx       # Admin inbox
│   │
│   ├── appointments/
│   │   ├── models/
│   │   │   ├── appointment.model.ts
│   │   │   └── activity.model.ts       # Status change audit log
│   │   ├── server/
│   │   │   └── appointments.fetcher.ts
│   │   ├── queries/
│   │   │   └── appointments.queries.ts
│   │   └── components/
│   │       ├── appointment-form.tsx
│   │       ├── appointment-card.tsx
│   │       └── today-schedule.tsx
│   │
│   ├── billing/
│   │   ├── models/
│   │   │   ├── subscription.model.ts
│   │   │   └── credit-ledger.model.ts
│   │   ├── providers/
│   │   │   ├── types.ts              # PaymentProvider interface
│   │   │   ├── esewa.provider.ts     # HMAC-SHA256, form-POST redirect
│   │   │   └── khalti.provider.ts    # REST initiate + lookup verify
│   │   ├── registry.ts              # select provider by string name
│   │   ├── queries/
│   │   │   └── billing.queries.ts
│   │   └── components/
│   │       ├── plan-picker.tsx
│   │       ├── esewa-button.tsx
│   │       └── credit-badge.tsx
│   │
│   ├── files/
│   │   ├── models/
│   │   │   └── file.model.ts
│   │   ├── server/
│   │   │   └── r2.client.ts          # S3 presigned URL helpers
│   │   ├── queries/
│   │   │   └── file.queries.ts
│   │   └── components/
│   │       ├── files-table.tsx
│   │       └── file-upload-zone.tsx
│   │
│   ├── ads/
│   │   ├── models/
│   │   │   └── ad.model.ts
│   │   ├── queries/
│   │   │   └── ads.queries.ts
│   │   └── components/
│   │       ├── ad-slot.tsx
│   │       └── ad-manager.tsx
│   │
│   ├── analytics/
│   │   ├── server/
│   │   │   └── analytics.fetcher.ts
│   │   └── components/
│   │       └── analytics-dashboard.tsx
│   │
│   ├── favorites/
│   │   ├── models/
│   │   │   └── favorite.model.ts
│   │   ├── queries/
│   │   │   └── favorites.queries.ts
│   │   └── components/
│   │       └── favorites-grid.tsx
│   │
│   └── auth/
│       ├── server/
│       │   ├── auth.ts             # betterAuth() config
│       │   ├── auth-client.ts      # createAuthClient()
│       │   └── session.ts          # getServerSession helper
│       ├── rbac/
│       │   ├── access.ts           # createAccessControl + roles
│       │   └── index.ts            # Role enum + checkAcPermission
│       └── components/
│           ├── login-form.tsx
│           ├── signup-form.tsx
│           └── access-denied.tsx
│
├── shared/
│   ├── ui/                         # shadcn/ui components (generated)
│   ├── components/                 # Cross-feature UI
│   ├── lib/
│   │   ├── db.ts                   # Mongoose connection (global _mongoose)
│   │   ├── query-client.ts         # getQueryClient() — per-request server / singleton browser
│   │   ├── error.ts                # badRequest, forbidden, unauthorized, notFound helpers
│   │   └── utils.ts
│   └── emails/                     # React Email templates
│       ├── verify-email.tsx
│       └── reset-password.tsx
│
└── scripts/
    └── migrate-roles.ts            # buyer/seller → user (idempotent)
```

---

## Database Models (exact schemas)

### Property
```ts
{
  // Core
  title: String (required, max 200)
  price: Number (required, min 0)
  location: String (required, max 100)
  status: enum["available","booked","sold"] default:"available"
  verificationStatus: enum["pending","verified","rejected"] default:"pending"
  verifiedAt: Date | null
  verifiedBy: ObjectId → users | null
  description: String (max 2000)
  sellerId: ObjectId → users (required, indexed)
  views: Number default:0
  messagesCount: Number default:0

  // Property details
  category: enum["House","Apartment","Land","Colony"] (required)
  area: String
  bedrooms: Number (0–20)
  bathrooms: Number (0–20)
  face: enum["North","South","East","West","North-East","North-West","South-East","South-West"]
  roadType: enum["Blacktopped","Graveled","Dirt","Goreto"]
  roadAccess: String
  negotiable: Boolean default:false

  // Location
  municipality: String
  wardNo: String
  ringRoad: String

  // GPS pin (Leaflet map picker)
  latitude: Number (-90 to 90) | null
  longitude: Number (-180 to 180) | null

  // Boundary polygon — array of [lat, lng] pairs drawn on the map
  // 0 = no boundary (valid); 1–2 = invalid; 3+ = valid polygon
  boundaryPoints: [[Number]] default:[]

  // Facilities
  nearHospital, nearAirport, nearSupermarket, nearSchool,
  nearGym, nearTransport, nearAtm, nearRestaurant: String

  // Video tour — YouTube/Vimeo URL or direct video link
  videoUrl: String

  // Sold tracking
  soldAt: Date | null
}

Indexes:
  sellerId + status
  sellerId + createdAt DESC
  category + status
  location + status
  latitude + longitude (sparse)
```

### PropertyChatConversation + PropertyChatMessage
One thread per (buyerId, propertyId). Unique index on `{ buyerId, propertyId }`.
```ts
// Conversation
{
  buyerId: String (required, indexed)
  buyerName: String
  sellerId: String (required, indexed)
  propertyId: String (required, indexed)
  propertyTitle: String
  lastMessage: String
  lastMessageAt: Date | null
  unreadBySeller: Number default:0
  unreadByBuyer: Number default:0
  timestamps: true
}
// Message
{
  conversationId: ObjectId → PropertyChatConversation
  senderId: String
  senderName: String
  senderRole: enum["inquirer","owner"]   // rename from buyer/seller
  content: String (max 2000)
  readBy: [String]
  timestamps: true
}
Index: conversationId + createdAt
```

### SupportConversation + SupportMessage
User → Admin support. One thread per (userId, propertyId). Unique index on that pair.
```ts
// Conversation
{
  userId: String (required, indexed)
  userName: String
  propertyId: String default:""
  propertyTitle: String
  lastMessage: String
  lastMessageAt: Date | null
  status: enum["open","closed"] default:"open"
  unreadByAdmin: Number default:0
  unreadByUser: Number default:0
  timestamps: true
}
// Message
{
  conversationId: ObjectId → SupportConversation
  senderId: String
  senderName: String
  senderRole: enum["user","admin"]
  content: String (max 2000)
  readBy: [String]
  timestamps: true
}
```

### Appointment + Activity
```ts
// Appointment
{
  title: String (required, max 200)
  type: enum["Property Viewing","Inspection","Legal Review"] (required)
  date: Date (required)
  propertyId: ObjectId → Property | null
  participants: [ObjectId → users]     // property owner + requester
  createdBy: ObjectId → users
  status: enum["scheduled","approved","completed","cancelled"] default:"scheduled"
  notes: String (max 500)
  image: String | null
  createdAt: Date
}

// Activity — audit log of appointment status changes
{
  appointmentId: ObjectId → Appointment (required, indexed)
  action: String (required)    // e.g. "Status changed to approved"
  status: enum["scheduled","approved","completed","cancelled"]
  note: String (optional)
  createdAt: Date
}
```

### Subscription (payment/credits)
```ts
{
  userId: ObjectId → users (required)
  propertyId: ObjectId → Property (required)
  credits: Number default:0            // total credits in this payment
  creditsToAdd: Number (required)
  creditsGranted: Boolean default:false
  usedCredits: Number default:0
  amount: Number (required, min 0)
  status: enum["pending","paid","failed","expired"] default:"pending"
  transactionId: String (required, unique index)
  transactionUuid: String
  paymentMethod: enum["esewa","khalti"] default:"esewa"
  paymentDate: Date
  expiresAt: Date | null
  timestamps: true
}

Index: userId + propertyId
Index: transactionId (unique)
```

### PropertyContactAccess
Guards who has unlocked a property's contact info. Atomic credit deduction uses a MongoDB transaction.
```ts
{
  userId: ObjectId → users (required, indexed)
  propertyId: ObjectId → Property (required, indexed)
  subscriptionId: ObjectId → Subscription (required)
  creditsDeducted: Number default:1
  timestamps: true
}
Unique index: userId + propertyId
```

### File
```ts
{
  userId: ObjectId → users (required, indexed)
  propertyId: ObjectId → Property (indexed, optional)
  filename: String (required)
  storedName: String (required, unique — R2 object key)
  isPrivate: Boolean default:true
  mimetype: String (required)
  size: Number (required)
  isDeleted: Boolean default:false
  deletedAt: Date | null
  timestamps: true
}
Virtuals: readableSize
Methods: softDelete(), restore()
Statics: findActiveByUser(), findByStoredName()
```

### Favorite
```ts
{ userId: ObjectId, propertyId: ObjectId, timestamps: true }
Unique index: userId + propertyId
```

### Ad
```ts
{
  title: String (required)
  slot: String (required, indexed)    // "properties-top" | "properties-inline" | "interstitial"
  imageUrl: String
  imageKey: String (R2 object key when image uploaded, not pasted)
  htmlContent: String
  targetUrl: String (required)
  altText: String
  isActive: Boolean default:true
  startDate: Date | null
  endDate: Date | null
  impressions: Number default:0
  clicks: Number default:0
  timestamps: true
}
Index: slot + isActive + startDate + endDate
```

---

## Authentication (features/auth/server/auth.ts)

```ts
betterAuth({
  plugins: [
    nextCookies(),
    lastLoginMethod(),
    anonymous({ generateName: () => "Guest", emailDomainName: "awaashub.com" }),
    admin({
      ac,
      roles: { admin: adminRole, user: userRole },
      defaultRole: "user",
    }),
  ],
  user: {
    additionalFields: {
      role: { type: "string", default: "user", input: true },
    },
  },
})
```

**Roles**
- `admin` — full platform access
- `user`  — authenticated (can create listings, book visits, chat)
- guest   — `session.user.isAnonymous === true` — NEVER check `role === "guest"`

**Access control (features/auth/rbac/access.ts)**
```ts
const statement = {
  ...defaultStatements,
  property:    ["read","view","update","delete","share","print","copy","duplicate"],
  appointment: ["read","view","update","delete"],
  file:        ["read","view","update","delete","copy","duplicate"],
  favorite:    ["read","view","delete"],
  analytics:   ["read","view"],
  ads:         ["read","view","update","delete","duplicate"],
  support:     ["read","view","update","delete"],
} as const
```

**Permission checks**
```ts
// Server (API routes — async)
await auth.api.userHasPermission({
  body: { userId: session.user.id, permissions: { property: ["delete"] } }
})

// Client (components — synchronous)
authClient.admin.checkRolePermission({ role, permissions: { file: ["read"] } })

// Inline sync (both envs)
import { checkAcPermission } from "@/features/auth/rbac"
checkAcPermission(role, { property: ["update"] })
```

**No role selector on signup.** `defaultRole: "user"` handles it. Google OAuth → `/dashboard` directly.

---

## Data Fetching Pattern (every page under `app/(main)/`)

```tsx
// app/(main)/properties/page.tsx — server component
const qc = getQueryClient()
await qc.prefetchInfiniteQuery(infinitePropertiesOptions())
return (
  <HydrationBoundary state={dehydrate(qc)}>
    <PropertiesContent />
  </HydrationBoundary>
)

// features/properties/components/properties-content.tsx — client
const { data } = useSuspenseInfiniteQuery(infinitePropertiesOptions())
```

- **Server fetchers** (features/\*/server/\*.fetcher.ts) → query MongoDB directly, resolve R2 presigned URLs, never call `fetch()`
- **Client queries** (features/\*/queries/\*.queries.ts) → `queryOptions()`, `useSuspenseQuery`, `useMutation`
- Same `queryKey` on both sides — dehydrated cache reused, zero extra network round-trip
- `getQueryClient()` in `shared/lib/query-client.ts` — per-request on server, singleton on browser
- Infinite scroll uses cursor-based pagination (`_id` as cursor, not skip/offset)

---

## Properties: Map, Boundary & Tour

### Map Picker (create/edit form — Step 4)
- `react-leaflet` with `dynamic()` SSR-safe imports for all Leaflet components
- Two tile styles: standard (OpenStreetMap) and satellite (Esri World Imagery)
- **GPS pin**: click-to-place or Nominatim geocode search; draggable marker; lat/lng stored in Property
- **Boundary polygon**: toggle "Draw boundary" mode → each click adds a `[lat, lng]` point;
  polygon renders as a dashed red overlay; "Clear" button resets; min 3 points required if any drawn
- `boundaryPoints: []` = valid (no boundary); `1–2` points = invalid → validation error
- Boundary validation in BOTH `POST /api/properties/new` and `PUT /api/properties/[id]`:
  `length === 0` → valid; `length < 3 && length > 0` → `badRequest`
- `boundaryPoints` stored as `[[Number]]` in MongoDB (array of `[lat, lng]` pairs)

### Premium Map Page (`app/(main)/properties/[id]/map/page.tsx`)
- Full-screen Leaflet map showing the property pin and boundary polygon overlay
- Satellite/standard tile toggle
- Facility markers (hospital, school, transport etc.) with circle radius overlays
- Premium-gated: requires `PropertyContactAccess` or admin/owner — redirect to contact page if no access
- `map/[lat]/[lng]` home route: global property explorer map showing all verified listings as pins

### Live Map (`app/(main)/properties/[id]/livemap/page.tsx`)
- Real-time property location preview during form editing — embedded in the form's map step

### Virtual Tour (`app/(main)/properties/[id]/tour/page.tsx`)
Full custom video player — no third-party player library:
- **YouTube/Vimeo** → `<iframe>` embed with resolved video ID
- **YouTube Shorts** → resolved separately from `youtube.com/shorts/{id}`
- **Direct video URLs** → HTML5 `<video>` element with custom controls
- Controls: play/pause, volume, seek bar with buffered indicator, timestamp, fullscreen, skip ±10s
- Auto-hide controls after 3s of inactivity
- Property metadata (title, location, area, face) displayed as overlay
- `videoUrl` validation: `z.union([z.literal(""), z.string().url()])` — never `.optional().or()`

---

## Three Chat Systems

### 1. Property Direct Chat (buyer ↔ property owner)
`/api/property-chat` + `PropertyChatConversation` + `PropertyChatMessage`

- One conversation thread per `(buyerId, propertyId)` — unique compound index
- Buyer can initiate; property owner sees all their threads in the Seller Inbox
- **Owners cannot message themselves** — `userId === sellerId → forbidden`
- Ownership-based, NOT role-based: `isOwner = userId === property.sellerId.toString()`
- Unread count tracked per side (`unreadBySeller`, `unreadByBuyer`)
- Real-time: Supabase broadcast on channels `propchat-{conversationId}` and `seller-inbox-{sellerId}`

### 2. General Conversation (legacy — keep for backward compat)
`/api/conversations` + `Conversation` + `Message`

- One thread per `(propertyId, buyerId)` — unique index
- Ownership determines participant roles (NOT the role field)
- Real-time: Supabase broadcast on `property-{conversationId}`

### 3. Support Chat (user → admin)
`/api/support` + `SupportConversation` + `SupportMessage`

- One thread per `(userId, propertyId)` — empty `propertyId` = general support
- Users (non-admin, non-guest) can open tickets; admin replies from inbox
- Unread tracking: `unreadByAdmin` / `unreadByUser`
- Real-time: broadcast on `support-{conversationId}`, `admin-support-inbox`, `user-notifications-{userId}`
- Admin inbox at `/support/inbox` — admin-only via `onlyForRoles: [Role.ADMIN]`

### Real-time Transport (shared/lib/supabase.ts)
Use **Supabase REST broadcast only** — no client subscription needed from the server side.
```ts
async function _broadcast(channel: string, event: string, payload: object) {
  await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messages: [{ topic: channel, event, payload }] }),
  })
}

// Named exports (one per channel type):
broadcastDirectChatMessage(conversationId, payload)  // propchat-{id}
broadcastSellerInboxUpdate(sellerId, payload)         // seller-inbox-{id}
broadcastSupportMessage(conversationId, payload)      // support-{id}
broadcastNewConversation(payload)                     // admin-support-inbox
broadcastUserNotification(userId, payload)            // user-notifications-{id}
broadcastPropertyMessage(conversationId, payload)     // property-{id}
broadcastPropertyTyping(conversationId, payload)      // property-{id} typing
```

---

## Billing System (payment-provider agnostic)

### Interface (features/billing/providers/types.ts)
```ts
interface PaymentProvider {
  name: string
  createCheckout(params: CheckoutParams): Promise<{ formAction: string; fields: Record<string,string> }>
  verifyPayment(query: Record<string,string>): Promise<VerifyResult>
  generateSignature(message: string, secret: string): string
}

interface CheckoutParams {
  userId: string; propertyId: string; amount: number
  credits: number; transactionUuid: string; successUrl: string; failureUrl: string
}

interface VerifyResult {
  success: boolean; transactionId: string; amount: number; status: string
}
```

### eSewa Provider (Nepal)
- HMAC-SHA256 signature: `total_amount,transaction_uuid,product_code`
- Form-POST redirect to `https://rc-epay.esewa.com.np/api/epay/main/v2/form`
- Status verification: `GET https://rc-epay.esewa.com.np/api/epay/transaction/status/`
- Use `crypto` (built-in Node) not `crypto-js` for HMAC generation

### Khalti Provider (Nepal)
- REST `POST /api/v2/epayment/initiate/` → returns payment URL
- Verify: `POST /api/v2/epayment/lookup/` with pidx

### Credit System
- Each paid Subscription grants N credits
- `POST /api/billing/credits/consume` deducts 1 credit atomically in a MongoDB transaction:
  ```ts
  mongoSession.withTransaction(async () => {
    const sub = await Subscription.findOneAndUpdate(
      { userId, status: "paid", credits: { $gt: 0 } },
      { $inc: { usedCredits: 1 } },
      { sort: { createdAt: 1 }, session: mongoSession, new: true }
    )
    if (!sub) throw new Error("no_credits")
    await PropertyContactAccess.create([{ userId, propertyId, subscriptionId: sub._id }], { session: mongoSession })
  })
  ```
- Admins bypass credit checks (always `hasAccess: true`)
- `PropertyContactAccess` unique index prevents double-spending

### Contact Unlock Flow
1. User clicks "Contact Seller" → `POST /api/properties/{id}/contact-access`
2. API checks `PropertyContactAccess` (already unlocked?) → early return
3. Deducts 1 credit from oldest valid Subscription (MongoDB transaction)
4. Returns `{ hasAccess: true, remainingCredits: N }`
5. Client navigates to `/properties/{id}/contact`

---

## Property Visibility Rules

```ts
// GET /api/properties (list — infinite scroll, cursor-based)
baseQuery =
  role === "admin" ? {} :
  userId           ? { $or: [{ verificationStatus: "verified" }, { sellerId: userId }] } :
                     { verificationStatus: "verified" }

// GET /api/properties/[id] (detail — fetch-then-check)
const property = await Property.findById(id).lean()
if (!property) return notFound()
const isOwner = property.sellerId.toString() === userId
if (!isAdmin && !isOwner && property.verificationStatus !== "verified") return notFound()

// Boundary validation (same in POST and PUT routes)
if (boundaryPoints.length > 0 && boundaryPoints.length < 3) return badRequest(...)
// length === 0 is always valid (no boundary drawn)
```

---

## File Management (features/files/)

- Cloudflare R2 via `@aws-sdk/client-s3` — endpoint `https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
- Files stored with `storedName` = nanoid + extension (never the original filename)
- Presigned PUT URL for upload; presigned GET URL for download (15 min TTL)
- Soft-delete: `isDeleted: true` + `deletedAt` — physical R2 deletion via `deleteFile(storedName)`
- File metadata in `File` collection linked to `userId` and optionally `propertyId`
- Images for a property are fetched via `Files.find({ propertyId, isDeleted: false, mimetype: /^image\// })`
- In the server fetcher, resolve presigned URL for first image per property before returning
- Max 10 images per property (enforced in Mongoose schema validator)

---

## Admin Features

### Property Verification Workflow
- New listings: `verificationStatus: "pending"` — visible to owner but not public
- Admin sees "Pending Review" count in dashboard stats and sidebar badge
- `PATCH /api/properties/{id}/verify` — sets `verificationStatus`, `verifiedAt`, `verifiedBy`
- Verification dialog: approve / reject with reason
- Sold properties: `status: "sold"`, `soldAt: Date` — shown with sold banner; admin can revert via verify dialog

### Ad Management
- Ads served by slot name (`properties-top`, `properties-inline`, `interstitial`)
- Date-range scheduling: `startDate` / `endDate` — null = always active
- Impression/click tracking: atomic `$inc` on each ad event
- `GET /api/ads/all?slot={slot}` returns active ads for a slot (date-filtered)
- `POST /api/ads/{id}/{event}` where event = `impression` or `click`
- Ad images uploaded to R2 (imageKey stored); or paste external imageUrl

### User Management
Use `authClient.admin.*` for all user operations — no custom admin routes needed:
```ts
authClient.admin.listUsers({ query: { limit: 50, offset, searchValue, filterField: "role", filterValue: "user" } })
authClient.admin.setRole({ userId, role: "user" | "admin" })
authClient.admin.banUser({ userId, banReason, banExpiresIn })
authClient.admin.unbanUser({ userId })
authClient.admin.removeUser({ userId })
authClient.admin.createUser({ name, email, password, role: "user" })
```
Keep `POST /api/admin/users/{id}/reset-password` as a custom route (not in better-auth admin plugin).

### Analytics (admin-only)
`GET /api/analytics` returns parallel counts:
- Total users, total properties, available, booked, sold
- Total appointments by status
- Total favorites
- Properties grouped by status (for pie chart)
- Monthly new users + new listings (for trend charts)

---

## Full API Surface

### Properties
```
GET    /api/properties                    # infinite list (cursor, filters)
POST   /api/properties/new               # create
GET    /api/properties/featured          # 6 verified for landing
GET    /api/properties/[id]              # detail (fetch-then-check)
PUT    /api/properties/[id]              # update
DELETE /api/properties/[id]              # delete + R2 cleanup
PATCH  /api/properties/[id]/verify       # admin verify/reject
GET    /api/properties/[id]/seller       # seller profile + stats for contact page
POST   /api/properties/[id]/contact-access  # unlock contact (credit deduction)
POST   /api/properties/[id]/favorite     # toggle favorite
GET    /api/properties/[id]/images       # signed image URLs
GET    /api/properties/[id]/subscriptions # user's subscriptions for this property
```

### Property Chat (direct buyer↔owner)
```
GET    /api/property-chat                       # get/create conversation + messages
POST   /api/property-chat                       # send message
GET    /api/property-chat/seller-inbox           # owner's all conversations
GET    /api/property-chat/[id]                  # read conversation + mark as read
POST   /api/property-chat/[id]                  # owner replies
```

### Support
```
GET    /api/support                     # user's support thread + messages
POST   /api/support                     # user sends message
GET    /api/support/inbox               # admin inbox (all open conversations)
POST   /api/support/[id]               # admin replies
GET    /api/support/user-notifications  # user polls for unread admin replies
```

### Conversations (legacy)
```
GET    /api/conversations               # get/create + messages
POST   /api/conversations               # send message
GET    /api/conversations/[id]/stream   # SSE stream for typing/messages
POST   /api/conversations/[id]/typing   # broadcast typing indicator
```

### Appointments
```
GET    /api/appointments                # list (admin = all; user = own)
POST   /api/appointments/new            # create
GET    /api/appointments/[id]           # detail
PATCH  /api/appointments/[id]           # update status (+ Activity log entry)
DELETE /api/appointments/[id]           # cancel
```

### Billing / Payment
```
POST   /api/payment/checkout            # create Subscription + generate provider form
GET    /api/payment/status              # verify payment after redirect
GET    /api/payment/[id]               # payment detail
POST   /api/billing/credits/consume     # atomic credit deduction (MongoDB txn)
```

### Files
```
GET    /api/files                       # list user's files
POST   /api/files/upload                # presigned PUT URL + File record
GET    /api/files/[key]                 # signed download URL + metadata
DELETE /api/files/[key]                 # soft-delete + R2 delete
```

### Ads
```
GET    /api/ads/all                     # active ads by slot
GET    /api/ads                         # admin: list all
POST   /api/ads                         # admin: create
GET    /api/ads/[id]                    # admin: detail
PATCH  /api/ads/[id]                    # admin: update
DELETE /api/ads/[id]                    # admin: delete
POST   /api/ads/[id]/[event]            # impression or click tracking
```

### Admin Users
```
GET    /api/admin/users                 # list (delegates to authClient.admin.listUsers)
PATCH  /api/admin/users/[id]            # set role
DELETE /api/admin/users/[id]/delete     # remove user
POST   /api/admin/users/[id]/ban        # ban user
POST   /api/admin/users/[id]/unban      # unban user
POST   /api/admin/users/[id]/reset-password  # send password reset email
GET    /api/admin/users/[id]            # get user detail
```

### Auth + Analytics
```
GET/POST /api/auth/[...all]             # better-auth handler
GET      /api/analytics                 # admin-only platform stats
GET      /api/dashboard                 # role-aware dashboard data
GET      /api/favorites                 # user favorites list
POST     /api/auth/update-role          # self-service role update (user only)
```

---

## UI/UX Rules

### Styling
- Tailwind CSS v4 — config in `postcss.config.mjs`, no `tailwind.config.js`
- ALL repeated visual patterns go in `globals.css` as named CSS classes:
  - Page layout shells: `.contact-page-root`, `.contact-sidebar`, `.contact-chat-panel`
  - Gradient backgrounds: `.contact-ambient-bg`, `.seller-hero-banner` with `::before`/`::after`
  - Scrollbar overrides: defined once in `*::-webkit-scrollbar` block
  - Card variants, banner patterns, map overlays
- Use `color-mix(in oklch, var(--primary) 12%, transparent)` not `hsl(var(--primary)/0.12)` in CSS
- Components use Tailwind for: spacing, sizing, one-off state variants (`hover:`, `dark:`, `group-hover:`)
- **No** `style={{ backgroundImage: "..." }}` or `style={{ background: "radial-gradient(...)" }}` in JSX

### Loading States
- Every async data boundary uses a `<Suspense>` with a **skeleton component** matching the layout
- Skeletons use `animate-pulse` and match card dimensions exactly
- No spinner-only loading states for page-level data

### Destructive Actions
- All delete/destructive actions use a `Dialog` (not `AlertDialog`) with a typed confirmation input
- User must type `"delete"` to enable the confirm button
- Use `z.union([z.literal(""), z.string()])` for the input, not `.optional().or()`
- Confirm button shows `<Loader2 className="animate-spin" />` while `mutation.isPending`
- Dialog auto-closes when `isDeleting` transitions from `true` to `false` via `useEffect`

### Share Feature (properties/[id])
- Share icon opens a `<Dialog>` with:
  - Property title + location preview
  - Read-only URL input + "Copy" button (toggles to "Copied!" with `CheckCircle2`)
  - WhatsApp, X/Twitter, Facebook quick-share buttons (open in new tab)
  - "Share via…" button using `navigator.share` — only rendered when `"share" in navigator`
- `navigator.share` fallback: `navigator.clipboard.writeText(url)` → toast

### Optimistic Updates
- Favorites toggle: optimistic `setQueryData` on both infinite list and detail caches
- Rollback on `onError` via stored snapshots in `onMutate`

---

## Non-Negotiable Rules

1. **No `style={{...}}` for gradients/colors** — use `globals.css` CSS classes with `color-mix()`
2. **No `role === "guest"`** — guests are `session.user.isAnonymous === true`
3. **No `Role.SELLER` or `Role.BUYER`** — only `Role.ADMIN` and `Role.USER`
4. **No `Permission` enum** — use resource/action pairs: `{ property: ["delete"] }`
5. **No `fetch()` inside server fetchers** — query MongoDB directly
6. **No skip/offset pagination** — cursor-based only (`_id` as cursor, sorted `_id: -1`)
7. **Boundary validation**: `length === 0` = valid; `1–2` = invalid (BOTH POST and PUT routes)
8. **`canManage = isAdmin || isOwner`** — never check role for property management
9. **Dashboard recent properties** = user's own listings (any status) — pending shows immediately
10. **MongoDB transactions** for any multi-document write involving credits or subscriptions
11. **HydrationBoundary wraps every server-prefetched query** — never do client-side-only data fetching on SSR pages
12. **Vertical slice** — every feature owns its model, fetcher, queries, components, and API handlers
13. **Feature public API** — each feature exports only what other features need via `features/{name}/index.ts`
14. **No `pages/` directory** — App Router only

---

## Database Migration

```ts
// scripts/migrate-roles.ts — run before deploying role changes
// bun --env-file=.env.local scripts/migrate-roles.ts

const result = await db.collection("users").updateMany(
  { role: { $in: ["buyer", "seller"] } },
  { $set: { role: "user" } }
)
console.log(`Migrated ${result.modifiedCount} users`)
```

---

## Environment Variables

```env
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
NEXT_PUBLIC_BETTER_AUTH_URL=
MONGODB_URI=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
RESEND_API_KEY=
EMAIL_SENDER_ADDRESS=
ESEWA_MERCHANT_CODE=
ESEWA_SECRET_KEY=
KHALTI_SECRET_KEY=
SUPABASE_URL=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```
