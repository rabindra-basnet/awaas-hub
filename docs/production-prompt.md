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

### Appointment
```ts
// Appointment — NO top-level status field. Status lives in activityHistory.
// Current status = activityHistory[activityHistory.length - 1]?.status ?? "scheduled"
{
  title: String (required, max 200)
  type: enum["Property Viewing","Inspection","Legal Review"] (required)
  date: Date (required)
  propertyId: ObjectId → Property | null
  participants: [ObjectId → users]     // property owner + requester
  createdBy: ObjectId → users
  image: String | null
  createdAt: Date

  // Embedded audit trail — never a separate collection
  activityHistory: [{
    status: enum["scheduled","approved","completed","cancelled"] (required)
    note: String (max 500, default "")
    changedAt: Date (default now)
    // _id: false — no subdocument _id needed
  }]
}
```

**Activity history rules:**
- `POST /api/appointments/new` seeds the first entry: `{ status: body.status || "scheduled", note: body.notes || "Appointment created", changedAt: new Date() }`
- `PATCH /api/appointments/[id]` uses MongoDB `$push` to append (never replaces) — this bypasses Mongoose strict mode
- Never add `status` as a top-level field and in activityHistory — choose one; embedded array wins
- To check current status in API routes, always derive: `history[history.length - 1]?.status`
- To read appointment with activityHistory from GET, use `Model.collection.findOne()` not `Model.findById().lean()` — the Mongoose model cache may not know about the field

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
POST   /api/appointments/new            # create — seeds initial activityHistory entry
GET    /api/appointments/[id]           # detail — use collection.findOne() not findById().lean()
PATCH  /api/appointments/[id]           # status change → $push activityHistory (MongoDB txn)
DELETE /api/appointments/[id]           # cancel — checks last activityHistory entry for status
```

**PATCH implementation pattern:**
```ts
// 1. Fetch with collection.findOne() to bypass Mongoose schema cache
const appointment = await Appointment.collection.findOne({ _id: new Types.ObjectId(id) })
const currentStatus = appointment.activityHistory?.at(-1)?.status

// 2. Guard checks on currentStatus
if (currentStatus === "completed" || currentStatus === "cancelled") return forbidden(...)

// 3. Write in a Mongoose transaction — $push only, no $set: { status }
await mongoSession.withTransaction(async () => {
  await Appointment.collection.findOneAndUpdate(
    { _id: new Types.ObjectId(id) },
    { $push: { activityHistory: { status, note: notes || "", changedAt: new Date() } } },
    { returnDocument: "after", session: mongoSession }
  )
})
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

## Mutation & Toast Discipline

### Toast — single source, call site only
TanStack Query fires BOTH hook-level `onSuccess`/`onError` AND per-call `mutate()` callbacks. If you put `toast.success()` in both, the user sees two toasts.

**Rule: toasts live exclusively at the call site (`mutate(payload, { onSuccess, onError })`).**
Hook-level `onSuccess`/`onError` do cache invalidation only — never show UI feedback.

```ts
// ✅ CORRECT — hook does only cache work
export const useUpdateAppointmentStatus = () =>
  useMutation({
    mutationFn: ...,
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: appointmentKeys.detail(id) })
      qc.invalidateQueries({ queryKey: ["dashboard"] })
      // NO toast here
    },
    // NO onError here
  })

// ✅ CORRECT — toast at the call site
updateStatus.mutate(
  { id, status, notes },
  {
    onSuccess: () => toast.success("Appointment approved!"),
    onError: (err) => toast.error(err.message || "Failed"),
  }
)
```

If a mutation is used in multiple places, each call site provides its own toast. Do not add toast to the hook to "cover" call sites that forgot — fix the call site.

### mutationFn error handling — always read the response body
```ts
// ❌ WRONG — user sees hardcoded message, backend reason lost
if (!res.ok) throw new Error("Failed to create appointment")

// ✅ CORRECT — backend's { message: "..." } surfaces in the toast
if (!res.ok) {
  const body = await res.json().catch(() => ({}))
  throw new Error(body.message || "Failed to create appointment")
}
```

---

## Mongoose Model Cache & Schema Evolution

In Next.js dev mode, Mongoose models are compiled once and cached via `models.ModelName || model(...)`.
When you add a new field to a schema, the cached model **does not know about it** until the server restarts.

### Consequences
- `Model.create({ newField: ... })` → strict mode silently strips `newField` before write
- `Model.findById(id).lean()` → Mongoose may strip `newField` from read results too

### Patterns that bypass the cache

**For reads** — use the raw collection:
```ts
// Bypasses Mongoose schema entirely, returns every MongoDB field as-is
const doc = await Model.collection.findOne({ _id: new Types.ObjectId(id) })
```

**For writes** — use MongoDB operators:
```ts
// $push / $set bypass Mongoose strict mode — they go straight to MongoDB
await Model.collection.findOneAndUpdate(
  { _id: new Types.ObjectId(id) },
  { $push: { activityHistory: { ... } } },
  { returnDocument: "after" }
)
```

**For creates with new fields** — pass the field in `create()` and restart the server so the schema is compiled fresh. `$push` after create is the safe fallback if you can't restart.

**Always restart the dev server** after adding a field to a Mongoose schema. The `models.X || model(...)` guard exists to prevent hot-reload errors, not to enable live schema updates.

---

## MongoDB Transaction Pattern

Use `mongoSession.withTransaction()` for any write that spans more than one document, or for any write that must be atomic (e.g. credit deduction + access record creation, appointment create + activityHistory seed).

```ts
await connectToDatabase() // must establish connection before startSession
const mongoSession = await mongoose.startSession()

try {
  await mongoSession.withTransaction(async () => {
    // all operations here share the session
    await ModelA.collection.findOneAndUpdate(..., { session: mongoSession })
    await ModelB.create([{ ... }], { session: mongoSession })
  })
} finally {
  await mongoSession.endSession()
}
```

**Requirements:** MongoDB replica set (Atlas works out of the box; local dev needs `--replSet rs0`).
**Single-document atomic writes** (`$push` + `$set` in one `findOneAndUpdate`) do NOT need a transaction — MongoDB guarantees document-level atomicity.

---

## Form Page UX Pattern (viewport-constrained)

For pages that are primarily a form (create appointment, create property), constrain to viewport height with no page scroll:

```tsx
// page.tsx — outer shell
export default function Page() {
  return (
    <div className="h-full overflow-hidden p-6">
      <div className="h-full rounded-2xl overflow-hidden border border-border shadow-sm">
        <Suspense fallback={<Loading />}>
          <TheForm />
        </Suspense>
      </div>
    </div>
  )
}

// form component — two-column layout
// Left: image / preview panel (full height, rounded-2xl m-3)
// Right: form fields (h-full overflow-y-auto, internal scroll only)
<form className="h-full">
  <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
    <div className="hidden lg:block relative h-full rounded-2xl m-3 overflow-hidden bg-muted">
      {/* property image + gradient overlay + booking summary */}
      {/* round back button: absolute top-4 left-4, w-9 h-9 rounded-full */}
    </div>
    <div className="h-full overflow-y-auto flex flex-col bg-background border-l border-border">
      <div className="flex flex-col flex-1 justify-center px-10 lg:px-14 py-10 max-w-lg mx-auto w-full space-y-5">
        {/* title with pb-2 border-b separator */}
        {/* form fields */}
        {/* submit button */}
      </div>
    </div>
  </div>
</form>
```

The `(main)` layout wraps children in `flex-1 min-h-0 overflow-auto`. Setting `h-full overflow-hidden` on the page div stops the outer scroll. Internal form panel uses `overflow-y-auto` so fields scroll within their panel only.

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
15. **No top-level `status` field for audit-trail entities** — embed `activityHistory: [{ status, note, changedAt }]`; current status = last entry
16. **Toasts only at call sites** — hook-level `onSuccess`/`onError` do cache invalidation only; never show UI feedback there
17. **Always read `res.json()` before throwing** in mutationFn — `const body = await res.json().catch(() => ({})); throw new Error(body.message || fallback)`
18. **Use `Model.collection.findOne()` for reads that must include new schema fields** — do not rely on `findById().lean()` when the model cache may be stale
19. **Use `$push`/`$set` MongoDB operators for writes involving new fields** — bypasses Mongoose strict mode regardless of model cache state
20. **`mongoSession.withTransaction()`** for any multi-document write; single-document `$push + $set` in one `findOneAndUpdate` is already atomic and needs no transaction
21. **Restart the dev server after every Mongoose schema change** — `models.X || model(...)` guard preserves the old compiled schema across hot reloads

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
