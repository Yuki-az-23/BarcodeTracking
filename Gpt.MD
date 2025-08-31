# Echo Inventory Tracker — Psycho‑Clear MVP README

> 📡 You scan. It echoes. The system remembers.  
> Built with **Capacitor.js**. Offline-first. Sync when the world returns. Minimal moving parts. Maximum signal.

---

## 🎯 BLUF
- **One job**: scan → store local → sync → query. Everything else is noise.
- **Keep Capacitor.js** as the mobile runtime; ship an MVP fast, attract contributors.
- **Stack (MVP-lock)**: Capacitor + Vue 3 + Ionic · Fastify + TypeScript · PostgreSQL (Prisma) · Supabase Auth (JWT).  
- **Principles**: tiny surface area • boring, reliable deps • readable & reusable code • safe-by-default errors.

---

## 🗺️ Architecture (you can draw this in your sleep)
```
           ┌───────────────────────────────┐
           │  Mobile (Capacitor + Vue)   │
           │  Ionic UI + ZXing            │
           └──────────────┬────────────────┘
                          │ scan + cache (SQLite/Storage)
                          ▼
           ┌───────────────────────────────┐
           │  Sync Service (in-app)       │
           │  queue → backoff → retry     │
           └──────────────┬────────────────┘
                          │ HTTPS (JWT)
                          ▼
           ┌───────────────────────────────┐
           │  API (Fastify + TypeScript)  │
           │  Zod validate + logger       │
           └──────────────┬────────────────┘
                          │ SQL
                          ▼
           ┌───────────────────────────────┐
           │  PostgreSQL (Prisma)         │
           └───────────────────────────────┘
```

### Core Flows
- **Scan** → parse barcode → generate *internal code* → save locally.
- **Offline-first** → enqueue ops → exponential backoff → idempotent server writes.
- **Sync** → POST `/scan` → resolve conflicts → persist.
- **Query** → GET `/product/:barcode` → show details/warranty.

---

## 🚦 MVP Scope (what ships)
- Mobile: Scanner screen, manual entry fallback, offline queue, sync indicator, toasts.
- API: `/scan` (create), `/product/:barcode` (read), `/health` (ping).
- DB: `products`, `scans` tables + seed script.
- Auth: Supabase (email/password or magic link) → JWT → Authorization header.
- Docs: README (this), CONTRIBUTING.md, 5 “good first issue” tickets.

Non-goals (later): ERP integrations, heavy analytics, queues, microservices, AWS labyrinths.

---

## ⚙️ Tech Choices (MVP)
- **Mobile**: Capacitor 5, Vue 3 (Composition API), Ionic, `@zxing/browser` for barcode; Storage via Capacitor Storage or SQLite.
- **Backend**: Fastify, TypeScript, Zod schemas, pino logger, CORS, helmet.
- **DB**: PostgreSQL 15+, Prisma ORM.
- **Auth**: Supabase Auth (JWT). Can be swapped later (Auth0, Cognito) with the same header contract.

---

## 🧪 API Contracts
### POST `/scan`
**Request**
```json
{
  "barcode": "EAN-13 or CODE128 string",
  "internalBarcode": "INV-0001-ABC123-9Z",
  "userId": "uuid",
  "timestamp": "2025-08-31T10:00:00Z"
}
```
**Response**
```json
{ "ok": true, "scanId": "uuid" }
```

### GET `/product/:barcode`
**Response**
```json
{
  "barcode": "string",
  "name": "Product name",
  "supplier": "ACME",
  "warrantyMonths": 12
}
```

### GET `/health`
**Response**: `{ status: "ok" }`

---

## 🧱 Data Model (Prisma)
```prisma
model Product {
  id              String   @id @default(uuid())
  barcode         String   @unique
  name            String
  supplier        String?
  warrantyMonths  Int?     @default(12)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  scans           Scan[]
}

model Scan {
  id         String   @id @default(uuid())
  product    Product  @relation(fields: [productId], references: [id])
  productId  String
  userId     String
  timestamp  DateTime @default(now())
}
```

Seed idea: a few common barcodes with fake suppliers and warranty months.

---

## 🧯 Error Handling (clear, user-safe, dev-loud)
**Frontend (Capacitor/Vue)**
- Wrap scan pipeline in `try/catch`; route all errors to a global `handleError(e)`.
- Show **ion-toast** with short human message; log full details to console (dev) or Sentry (prod, optional).
- Categorize: `RETRYABLE` (network) → auto‑retry/backoff; `FATAL` (bad permission) → CTA to Settings.

**Backend (Fastify)**
- Validate every request body/params with Zod.
- Consistent error envelope:
```json
{ "ok": false, "code": "VALIDATION_ERROR", "message": "...", "details": {"field":"reason"}, "traceId": "uuid" }
```
- Map known errors (409 conflict, 404 not found) → typed responses; hide stack traces from users.

**Conflict resolution (when syncing)**
- `LAST_WRITE_WINS` for MVP, guard by server timestamps.
- Keep a `traceId` header to correlate mobile→API logs.

---

## 🧹 Refactor Rules (readable & reusable by default)
- **Small modules**: one file = one role (e.g., `ScannerService`, `SyncManager`).
- **Pure core**: parsing/generation functions are pure and unit-tested.
- **Dependency injection lite**: pass services as params, avoid global singletons.
- **Naming**: nouns for models (`Product`), verbs for actions (`syncQueue.enqueue`).
- **Boundaries**: `app/modules/*` vs `app/shared/*`.
- **Testing targets**: barcode parsing, internal code generator, sync retry/backoff.

---

## 🧭 Quickstart
### Prereqs
- Node 20+, pnpm or npm
- Postgres 15+, Supabase project (or local docker)

### Backend
```bash
cd api
pnpm i
cp .env.example .env   # set DATABASE_URL, SUPABASE_JWT_SECRET
pnpm dev
```

### Mobile
```bash
cd app
pnpm i
pnpm dev
# to run native:
pnpm build && npx cap sync
npx cap open ios   # or android
```

---

## 📋 Task Board (grab one, make it real)
### Mobile (Capacitor)
- [ ] Scanner screen (ZXing; manual entry fallback)
- [ ] Offline queue (SQLite/Storage) + backoff
- [ ] Sync on reconnect + status indicator
- [ ] Global error toast + Sentry hook (optional)

### Backend (Fastify)
- [ ] `/scan` (create scan) with Zod + idempotency key
- [ ] `/product/:barcode` (read product)
- [ ] Error handler + pino + request ID middleware

### Database (Postgres)
- [ ] `products` & `scans` migration
- [ ] Seed script
- [ ] Indexes on `barcode`, `timestamp`

### Infra / Auth
- [ ] Supabase Auth wired to mobile, pass JWT to API
- [ ] Render/Railway deploy manifests
- [ ] Healthcheck endpoint + uptime monitor

### Docs
- [ ] CONTRIBUTING.md with setup steps
- [ ] Open 5 “good first issue” tickets
- [ ] Screenshots/GIF of scan flow in README

---

## 🛣️ Roadmap (next)
- ERP connector (Priority/SAP) as **separate service**
- Metrics dashboard (later): CloudWatch/Supabase logs + traceId correlation
- PWA build as alternative client
- Background sync and conflict UI

---

## 🤝 Contributing
Fork → Clone → Run → Break → Fix → PR.  
Small PRs win. Describe your echo in the PR body.

---


> Join. Build. Echo.
