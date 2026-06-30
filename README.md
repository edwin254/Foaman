# Foaman Backend – Worker Flow

NestJS backend for Foaman’s USSD worker-matching flow. It exposes a webhook for Africa’s Talking, drives multi-step menus from configuration, matches customers with verified fundis, and collects payments via **M-Pesa STK Push** for paid actions (e.g. job posting).

## Architecture

```
Africa's Talking ──POST──► HTTPS /ussd ──► NestJS :3000
                                │
           ┌────────────────────┼────────────────────┐
           ▼                    ▼                    ▼
   UssdController        UssdService         WorkerMatchingService
   POST /ussd            (menu state)        (match + notify)
           │                    │                    │
           │            SessionStoreService          │
           │            (in-memory locally)         │
           │                    │                    ▼
           │            ussd-menu.config.ts    SmsService
           │                    │
           │                    ▼
           │              PaymentsService ──STK Push──► Safaricom Daraja
           │                    ▲
           └──── payment step ──┘         POST /payments/mpesa/callback
                     │                    │
                Prisma (Job, User, Skill, Payment)  TypeORM (workers)
                     │                    │
                     └────── Postgres ──────┘
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Entry | `src/main.ts` | Boots NestJS on port `3000` |
| HTTP | `src/ussd/ussd.controller.ts` | `POST /ussd` (AT webhook), `POST /ussd/match` (dev API) |
| Payments | `src/payments/payments.controller.ts` | `POST /payments/stk-push`, `POST /payments/mpesa/callback`, `GET /payments/:id` |
| Onboarded users | `src/users/users.controller.ts` | `GET /onboarded` (no auth yet — dev/ops) |
| USSD engine | `src/ussd/ussd.service.ts` | Session steps, `CON`/`END` responses, payment step triggers |
| Menu config | `src/config/ussd-menu.config.ts` | All USSD screens (including `payment` steps) |
| Payment actions | `src/config/payment-actions.config.ts` | Amount + label per paid action type |
| M-Pesa client | `src/payments/mpesa.service.ts` | Daraja OAuth, STK push, phone normalization |
| Payment orchestration | `src/payments/payments.service.ts` | Initiate payment, handle callback, execute paid action |
| Matching | `src/worker/services/worker.service.ts` | Fundi lookup, SMS, job assignment |
| SMS | `src/common/services/sms.service.ts` | Africa’s Talking (logs only until wired) |
| Sessions | `src/ussd/session-store.service.ts` | In-memory `Map` (Redis planned) |

**Data access:** Prisma (`User`, `Skill`, `Worker`, `Job`, `Payment`) and TypeORM (`workers` table for matching) share one Postgres database. USSD worker signup uses Prisma; job posting is created after a successful M-Pesa payment.

### Entry points

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/ussd` | Africa’s Talking callback (`sessionId`, `phoneNumber`, `serviceCode`, `text`) |
| `POST` | `/ussd/match` | Direct matching API (local/dev testing) |
| `POST` | `/payments/stk-push` | Initiate M-Pesa STK Push for a paid action |
| `POST` | `/payments/mpesa/callback` | Safaricom Daraja STK callback (must be public HTTPS) |
| `GET` | `/payments/:id` | Look up payment status by ID |
| `GET` | `/onboarded` | List USSD-onboarded users (`?role=CUSTOMER` optional). **No auth yet.** |

### Database schema (Prisma)

| Model | Key fields |
|-------|------------|
| `User` | `phone`, `fullName`, `location`, `role` |
| `Skill` | `name` (unique catalog; populated via USSD lookup or optional `db:seed`) |
| `Worker` | `userId`, `idNumber`, `skill`, `isVerified` |
| `Job` | `customerId`, `skillNeeded`, `location`, `description`, `status`, `paymentId` |
| `Payment` | `phone`, `amount`, `actionType`, `status`, `mpesaReceipt`, `checkoutRequestId`, `metadata` |

**Payment action types:** `JOB_POSTING`, `WORKER_VERIFICATION`, `SUPPLIER_LISTING`

**Payment statuses:** `PENDING`, `SUCCESS`, `FAILED`, `CANCELLED`

TypeORM `workers` table: `phone`, `fullName`, `skill`, `idNumber`, `verified`, `available`, `lastJobTimestamp`, ratings/counters.

### NPM scripts

| Script | Command | Use |
|--------|---------|-----|
| `db:generate` | `prisma generate` | Regenerate client after schema changes |
| `db:push` | `prisma db push` | Apply schema to DB (local/dev) |
| `db:seed` | `tsx prisma/prisma.seed.ts` | Optional: preload skill catalog (not required for onboarding) |

---

## Local vs production

| Topic | Local development | Production |
|-------|-------------------|------------|
| **Purpose** | USSD sandbox testing, menu dev, matching API | Live USSD short code, real users |
| **Public URL** | [zrok2](https://docs.zrok.io/docs/zrok/) tunnel to `localhost:3000` | HTTPS on your domain (load balancer / reverse proxy) — **no zrok** |
| **Africa’s Talking** | [Sandbox](https://sandbox.africastalking.com/) credentials | Production app username + API key |
| **USSD callback** | `https://<zrok2-host>/ussd` | `https://<your-api-domain>/ussd` |
| **Postgres** | Docker Compose (`postgres` service) or local install | Managed Postgres (RDS, Supabase, etc.) |
| **Redis** | Optional via Compose; not required yet | Recommended when session store is wired |
| **Schema changes** | `npm run db:push` | `prisma migrate deploy` (use migrations, not `db push`) |
| **TypeORM** | `synchronize: true` (auto-creates `workers`) | Set `synchronize: false`; use migrations |
| **Prisma client** | `npm run db:generate` (Node **≥ 20.19**, or Docker — see below) | Same, in CI/CD before `npm run build` |
| **Run mode** | `npm run start:dev` or `docker compose up web` | `npm run build` then `npm run start` |
| **SMS** | Logged to console | Real AT SMS API in `SmsService` |
| **M-Pesa** | `MPESA_MOCK=true` auto-completes payments | Real Daraja credentials + public callback URL |

---

## Local setup

For day-to-day development: sandbox USSD, zrok2 tunnel, and a local Postgres instance.

### Prerequisites

- **Node.js ≥ 20.19** (required for `prisma generate` on the host; Prisma 7 fails on 20.18 with an ESM error)
- Docker & Docker Compose
- [zrok2 CLI](https://docs.zrok.io/docs/zrok/) — **not** legacy `zrok` v1 / ngrok
- [myzrok.io](https://myzrok.io/) account (free hosted zrok2)

### 1. Environment

```bash
cp .env_example .env
```

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=foaman
DB_PASSWORD=foaman123
DB_DATABASE=foaman_worker
DATABASE_URL=postgresql://foaman:foaman123@localhost:5432/foaman_worker

AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_APIKEY=your_sandbox_api_key

REDIS_URL=redis://localhost:6379

# M-Pesa (set MPESA_MOCK=true for local dev without Daraja credentials)
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_PASSKEY=your_lipa_na_mpesa_passkey
MPESA_SHORTCODE=174379
MPESA_CALLBACK_URL=https://<your-zrok2-host>/payments/mpesa/callback
MPESA_TRANSACTION_TYPE=CustomerPayBillOnline
MPESA_MOCK=true
```

### 2. Database (Docker)

```bash
docker compose up -d postgres redis
```

### 3. Install, schema, seed

```bash
npm install
```

**Prisma generate** (pick one):

```bash
# Host (Node ≥ 20.19)
npm run db:generate

# Or via Docker if host Node is 20.18
docker compose run --rm -e DATABASE_URL=postgresql://foaman:foaman123@postgres:5432/foaman_worker web npx prisma generate
```

```bash
npm run db:push
npm run start:dev
```

Skill names are created on the fly during USSD skill lookup when no catalog match exists. Optional catalog preload: `npm run db:seed`.

API: `http://localhost:3000`. TypeORM creates the `workers` table on first boot.

**All-in-one with Docker** (app + DB + auto `prisma generate`):

```bash
docker compose up web
```

Uses `DB_HOST=postgres` from `docker-compose.yml` overrides.

### 4. zrok2 + Africa’s Talking sandbox

AT must POST to a public HTTPS URL. On your machine, expose port 3000 with **zrok2**:

```bash
zrok2 enable <account-token-from-myzrok.io>
zrok2 share public 3000
# optional: zrok2 share public --headless 3000
```

In [USSD sandbox](https://sandbox.africastalking.com/):

1. Create or edit your USSD channel.
2. Set callback URL: `https://<your-zrok2-host>/ussd`
3. Dial the sandbox test code.

**Notes:**

- Commands are `zrok2 …`, not `zrok share` (v1).
- The tunnel stops when you close the terminal; use the [zrok agent](https://docs.zrok.io/docs/guides/agent/) for a persistent dev tunnel.
- `zrok-setup.sh.sh` is only for **self-hosted** zrok2 controllers, not myzrok.io dev.

### 5. View onboarded users (no auth yet)

After users complete customer or worker onboarding via USSD:

```http
GET http://localhost:3000/onboarded
GET http://localhost:3000/onboarded?role=WORKER
GET http://localhost:3000/onboarded?role=CUSTOMER
```

Example response:

```json
{
  "count": 1,
  "users": [
    {
      "id": "clx…",
      "phone": "+2547…",
      "fullName": "Jane Doe",
      "location": "Roysambu",
      "role": "CUSTOMER",
      "createdAt": "2026-05-20T…",
      "workerProfile": null
    }
  ]
}
```

Authentication will be added before exposing this in production.

### 6. Quick tests

**USSD flow:** use the sandbox dial code after zrok2 is running.

**Matching API (no USSD):**

```http
POST http://localhost:3000/ussd/match
Content-Type: application/json

{
  "skill": "plumber",
  "location": { "lat": -1.215, "lng": 36.885 },
  "description": "Leaking sink in Kahawa West"
}
```

**M-Pesa STK Push (direct API):**

```http
POST http://localhost:3000/payments/stk-push
Content-Type: application/json

{
  "phone": "254712345678",
  "actionType": "JOB_POSTING",
  "metadata": {
    "matchedSkill": "Plumber",
    "jobLocation": "Roysambu"
  }
}
```

With `MPESA_MOCK=true`, the payment is auto-completed and the job is created immediately. Check status:

```http
GET http://localhost:3000/payments/<paymentId>
```

---

## M-Pesa STK Push payments

Paid actions are defined in `src/config/payment-actions.config.ts`:

| Action type | Default amount (KES) | What happens on success |
|-------------|----------------------|-------------------------|
| `JOB_POSTING` | 50 | Creates a `Job` linked to the payment |
| `WORKER_VERIFICATION` | 100 | Sets `Worker.isVerified = true` |
| `SUPPLIER_LISTING` | 200 | Logged (supplier flow TBD) |

### How it works

1. **USSD or API** initiates payment with `phone`, `actionType`, optional `amount`, and `metadata` (session data such as skill and location).
2. **`MpesaService`** sends an STK Push prompt to the user's phone via Safaricom Daraja.
3. User enters M-Pesa PIN on their phone.
4. **Safaricom** POSTs the result to `POST /payments/mpesa/callback`.
5. **`PaymentsService`** marks the payment `SUCCESS` and runs the action handler (e.g. create job).

Session data collected during USSD (skill, location, etc.) is stored in `Payment.metadata` so the callback can complete the action even after the USSD session ends.

### USSD integration

The **Request a Fundi** flow ends with a `payment` step instead of creating the job immediately:

```
jobSkillInput → jobSkillLookup → jobLocation → jobPayment (STK) → job created on callback
```

When the user reaches a `payment` screen, the USSD session ends with `END` and an M-Pesa prompt is sent to their phone.

### Adding payment to another USSD action

1. Add the action type to `prisma/schema.prisma` (`PaymentActionType` enum) and run `npm run db:push`.
2. Register amount/label in `src/config/payment-actions.config.ts`.
3. Add a handler in `PaymentsService.executePaidAction()`.
4. Insert a `payment` step in `ussd-menu.config.ts` before the final screen:

```ts
workerPayment: {
  text: "Pay KES 100 via M-Pesa to fast-track verification.\nWe will send a prompt to your phone.",
  type: "payment",
  paymentAction: "WORKER_VERIFICATION",
  amount: 100,
  next: "workerSuccess",
},
```

5. Point the preceding step's `next` to your new payment screen (e.g. change `workerIdNumber.next` from `workerSuccess` to `workerPayment`).

### Dynamic STK trigger design (flexible by action)

STK Push is dynamic by design in this project:

- Any USSD step can trigger STK by setting `type: "payment"` in `ussd-menu.config.ts`.
- Amount is configurable per screen (`amount`) or falls back to action defaults in `payment-actions.config.ts`.
- Business intent is configurable using `paymentAction` (`JOB_POSTING`, `WORKER_VERIFICATION`, `SUPPLIER_LISTING`, or new enums you add).
- Callback handling is action-aware in `PaymentsService.executePaidAction()`.
- This lets you attach payments to different USSD options without changing the core state engine.

### M-Pesa environment variables

| Variable | Purpose |
|----------|---------|
| `MPESA_ENV` | `sandbox` or `production` (selects Daraja base URL) |
| `MPESA_CONSUMER_KEY` | Daraja app consumer key |
| `MPESA_CONSUMER_SECRET` | Daraja app consumer secret |
| `MPESA_PASSKEY` | Lipa Na M-Pesa Online passkey |
| `MPESA_SHORTCODE` | Paybill or till number (sandbox default: `174379`) |
| `MPESA_CALLBACK_URL` | Public HTTPS URL for STK callbacks |
| `MPESA_TRANSACTION_TYPE` | `CustomerPayBillOnline` (Paybill) or `CustomerBuyGoodsOnline` (Till) |
| `MPESA_MOCK` | `true` = skip Daraja, auto-complete payment (local dev only) |

**Callback URL** must be reachable by Safaricom. In local dev, expose port 3000 with zrok2 and set:

```
MPESA_CALLBACK_URL=https://<your-zrok2-host>/payments/mpesa/callback
```

Register the same URL in the [Safaricom Daraja portal](https://developer.safaricom.co.ke/) for your app.

---

## Production setup

Production runs the same NestJS app on infrastructure with a **stable public HTTPS endpoint** and **Africa’s Talking production** credentials. You do not use zrok2 in prod.

### 1. Infrastructure checklist

- [ ] Postgres (managed, backups, SSL)
- [ ] App host (VM, container platform, or PaaS) with TLS termination
- [ ] Process manager or orchestrator (`systemd`, Kubernetes, etc.)
- [ ] Secrets store for env vars (not committed `.env`)
- [ ] (Recommended) Redis for USSD sessions when implemented

### 2. Environment variables

Set on the server (example names — adjust to your host):

```env
NODE_ENV=production

DB_HOST=<managed-postgres-host>
DB_PORT=5432
DB_USERNAME=<user>
DB_PASSWORD=<secret>
DB_DATABASE=foaman_worker
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/foaman_worker?sslmode=require

AFRICASTALKING_USERNAME=<production_username>
AFRICASTALKING_APIKEY=<production_api_key>

REDIS_URL=redis://<redis-host>:6379

MPESA_ENV=production
MPESA_CONSUMER_KEY=<daraja_consumer_key>
MPESA_CONSUMER_SECRET=<daraja_consumer_secret>
MPESA_PASSKEY=<lipa_na_mpesa_passkey>
MPESA_SHORTCODE=<paybill_or_till>
MPESA_CALLBACK_URL=https://<your-production-domain>/payments/mpesa/callback
MPESA_TRANSACTION_TYPE=CustomerPayBillOnline
# Do NOT set MPESA_MOCK in production
```

### 3. Database

1. Create the production database and user with least privilege.
2. Use **Prisma migrations** (not `db push`):

   ```bash
   npx prisma migrate deploy
   npm run db:generate
   ```

3. **Disable TypeORM auto-sync** in `src/config/database.config.ts`:

   ```ts
   synchronize: false,
   ```

   Manage the `workers` table via migrations or a one-time DDL aligned with `src/worker/entities/worker.entity.ts`.

### 4. Build and run

```bash
npm ci
npm run db:generate
npm run build
npm run start
```

Run behind nginx, Caddy, or a cloud load balancer that forwards `POST /ussd` and `POST /payments/mpesa/callback` to port `3000`.

### 5. Africa’s Talking (production)

1. Register your production USSD service in the [Africa’s Talking dashboard](https://account.africastalking.com/).
2. Set callback URL to your public API:

   ```
   https://<your-production-domain>/ussd
   ```

3. Implement real SMS in `src/common/services/sms.service.ts` (replace console logging).
4. Confirm responses use `CON` / `END` plain text as required by AT.

### 6. M-Pesa (production)

1. Create a production app on the [Safaricom Daraja portal](https://developer.safaricom.co.ke/).
2. Set `MPESA_CALLBACK_URL` to `https://<your-production-domain>/payments/mpesa/callback`.
3. Whitelist the callback URL in Daraja and ensure TLS is valid.
4. Use production shortcode, passkey, and consumer credentials.
5. Never set `MPESA_MOCK=true` in production.

### 7. Production test plan (go-live checks)

Run this checklist after deploying:

1. **Health/config check**
   - App boots cleanly (no Prisma startup errors).
   - `MPESA_MOCK` is unset/false and `MPESA_ENV=production`.
2. **USSD non-payment flow**
   - Dial live code and complete one free path.
   - Confirm expected `CON`/`END` responses and no session errors.
3. **STK success flow**
   - Trigger a paid USSD option.
   - Confirm STK prompt appears on handset and payment is completed.
   - Confirm callback received at `POST /payments/mpesa/callback` and payment status becomes `SUCCESS`.
   - Confirm paid action side effect occurred (for example: `Job` record created for `JOB_POSTING`).
4. **STK failure flow**
   - Trigger STK and cancel/timeout on phone.
   - Confirm payment status becomes `FAILED` and no paid action is applied.
5. **Idempotency check**
   - Re-send a previous callback payload once.
   - Confirm no duplicate side-effects are created.

### 8. Testing M-Pesa (sandbox and production)

1. **Sandbox test**
   - Use `MPESA_ENV=sandbox`.
   - Set callback URL to a public endpoint: `https://<host>/payments/mpesa/callback`.
   - Trigger via USSD payment step or `POST /payments/stk-push`.
   - Verify `PENDING -> SUCCESS` and `PENDING -> FAILED` both work.
2. **Local mock test**
   - Set `MPESA_MOCK=true`.
   - Trigger payment and confirm action executes immediately (no Daraja call).
3. **Production smoke test**
   - Use a low amount and approved test account/number.
   - Verify callback receipt, status update, and exact business action output.
   - Keep request/callback logs for audit.

### 9. Security and ops

| Item | Recommendation |
|------|----------------|
| TLS | Terminate HTTPS at the edge; do not expose plain HTTP publicly |
| Secrets | Rotate `AFRICASTALKING_APIKEY` and DB passwords independently |
| Logging | Log `sessionId` / `phoneNumber` carefully; avoid PII in public logs |
| Health | Monitor process restarts and DB connectivity |
| Dev endpoints | Restrict `GET /onboarded`, `POST /ussd/match`, and `POST /payments/stk-push` behind auth before production |
| M-Pesa callbacks | Validate callback origin where possible; idempotent handling on `checkoutRequestId` |

---

## Updating `ussd-menu.config.ts`

Menus live in `src/config/ussd-menu.config.ts`.

| Type | Behavior |
|------|----------|
| `choice` | Numbered input routed via `options` |
| `input` | Free text → `property`, then `next` |
| `dynamic-lookup` | DB skill search, numbered list, selection → `property` |
| `payment` | Triggers M-Pesa STK Push (`paymentAction`, optional `amount`), then `END` |
| `final` | Terminal screen → `END …` (side effects via `saveFinalPayload`) |

Africa’s Talking rules:

- First request: empty `text` → `CON` + first menu
- Mid-flow → `CON …`
- End → `END …`
- Avoid special characters in menu text

### Example: “Track Application” on main menu

```ts
trackAppPhone: {
  text: `Track Application\nEnter ID or Phone Number:`,
  type: 'input',
  property: 'lookupValue',
  next: 'trackAppResult',
},
trackAppResult: {
  text: `Status: Pending Verification.\nYou will receive an SMS update.`,
  type: 'final',
},
```

## Roadmap

- Wire `SmsService` to Africa’s Talking (sandbox + production)
- Payment confirmation SMS after successful STK push
- Redis-backed USSD sessions
- Unify Prisma `Worker` and TypeORM `workers`
- Supplier and Ready-to-Occupy flows (with `SUPPLIER_LISTING` payment)
- Auth on dev/ops and payment initiation endpoints
