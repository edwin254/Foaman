# Foaman Backend – Worker Flow

NestJS backend for Foaman’s USSD worker-matching flow. It exposes a webhook for Africa’s Talking, drives multi-step menus from configuration, and matches customers with verified fundis.

## Architecture

```
Africa's Talking Sandbox ──POST──► zrok2 public URL ──► NestJS :3000
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
            UssdController        UssdService         WorkerMatchingService
            POST /ussd            (menu state)        (match + notify)
                    │                    │                    │
                    │            SessionStoreService          │
                    │            (in-memory)                   │
                    │                    │                    ▼
                    │            ussd-menu.config.ts    SmsService (stub)
                    │                    │
                    └──────── handleFinalState ──────────┘
                              │                    │
                         Prisma (Job, User)   TypeORM (workers)
                              │                    │
                              └────── Postgres (foaman_worker) ──────┘
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Entry | `src/main.ts` | Boots NestJS on port `3000`, global validation |
| HTTP | `src/ussd/ussd.controller.ts` | `POST /ussd` (AT webhook), `POST /ussd/match` (dev API) |
| USSD engine | `src/ussd/ussd.service.ts` | Session steps, `CON`/`END` responses, final-state side effects |
| Menu config | `src/config/ussd-menu.config.ts` | All USSD screens (choice / input / final) |
| Matching | `src/worker/services/worker.service.ts` | Fundi lookup, SMS notify, job assignment |
| SMS | `src/common/services/sms.service.ts` | Africa’s Talking integration (currently logs only) |
| Sessions | `src/ussd/session-store.service.ts` | In-process `Map` (Redis in compose is not wired yet) |

The app uses **two data access layers** on the same Postgres database:

- **Prisma** (`prisma/schema.prisma`) — `User`, `Worker` (profile linked to user), `Job` for customer job posting via USSD.
- **TypeORM** (`src/worker/entities/worker.entity.ts`) — `workers` table for fundi registration and matching queries.

Worker onboarding via USSD writes to TypeORM; job posting writes to Prisma and then triggers matching.

## Entry points

| Method | Path | Handler | Purpose |
|--------|------|---------|---------|
| `POST` | `/ussd` | `UssdController.handleUssd` | Africa’s Talking USSD callback (`sessionId`, `phoneNumber`, `serviceCode`, `text`) |
| `POST` | `/ussd/match` | `UssdController.handleMatch` | Direct fundi matching (JSON body, for local testing) |

Application bootstrap: `src/main.ts` → `AppModule` (`src/app.module.ts`).

## Database schema

**Prisma** (`prisma/schema.prisma`):

| Model | Key fields |
|-------|------------|
| `User` | `phone` (unique), `fullName`, `location`, `role` (`CUSTOMER`, `WORKER`, `SUPPLIER`, `ADMIN`) |
| `Worker` | `userId`, `idNumber`, `skill`, `isVerified` — 1:1 with `User` |
| `Job` | `customerId`, `skillNeeded`, `location`, `description`, `status` (`PENDING`, `MATCHED`, …) |

**TypeORM** (`workers` table, auto-created via `synchronize: true`):

| Column | Notes |
|--------|-------|
| `phone`, `fullName`, `skill`, `idNumber` | Fundi profile |
| `verified`, `available` | Matching filters |
| `lastJobTimestamp`, `rating`, job counters | Round-robin / stats |

Apply Prisma tables after changing the schema:

```bash
npx prisma db push
npx prisma generate
```

## Core business logic

| Concern | File |
|---------|------|
| USSD state machine & AT `CON`/`END` formatting | `src/ussd/ussd.service.ts` |
| Menu definitions & routing | `src/config/ussd-menu.config.ts` |
| Worker registration (USSD final `workerSuccess`) | `WorkerMatchingService.createWorker` in `src/worker/services/worker.service.ts` |
| Job create + match + notify (USSD final `jobPosted`) | `UssdService.handleFinalState` + `WorkerMatchingService.findAndNotifyWorkers` |
| Fundi matching algorithm | `WorkerMatchingService.matchFundi` — verified + available workers by skill, top 5 SMS, assign first |
| SMS notifications | `src/common/services/sms.service.ts` |

---

## Local setup

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- [zrok2 CLI](https://docs.zrok.io/docs/zrok/) (v2 — **not** the legacy `zrok` v1 binary)
- Free account at [myzrok.io](https://myzrok.io/) (hosted zrok2; no self-hosted controller required for dev)

### 1. Environment

```bash
cp .env_example .env
```

Set at minimum:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=foaman
DB_PASSWORD=foaman123
DB_DATABASE=foaman_worker
DATABASE_URL=postgresql://foaman:foaman123@localhost:5432/foaman_worker

AFRICASTALKING_USERNAME=sandbox
AFRICASTALKING_APIKEY=your_sandbox_api_key
```

### 2. Start Postgres and Redis

```bash
docker compose up -d postgres redis
```

(Postgres image includes PostGIS; the worker flow does not use geo queries yet.)

### 3. Install dependencies and sync schema

```bash
npm install
npx prisma db push
npx prisma generate
npm run start:dev
```

The API listens at `http://localhost:3000`. TypeORM creates the `workers` table on first boot (`synchronize: true`).

### 4. Expose localhost with zrok2 (Africa’s Talking sandbox)

Africa’s Talking must reach your machine over HTTPS. Use **zrok2**, not ngrok and not the v1 `zrok` command.

**Install and enable zrok2** (one-time):

```bash
# Install per https://docs.zrok.io/docs/zrok/ — package name is zrok2
zrok2 enable <your-account-token-from-myzrok.io>
```

**Share the NestJS port** (keep this terminal open while testing USSD):

```bash
zrok2 share public 3000
```

Copy the public URL printed by the CLI (e.g. `https://….share.zrok.io`). For a stable URL in scripts:

```bash
zrok2 share public --headless 3000
```

**Configure Africa’s Talking sandbox:**

1. Open [USSD sandbox](https://sandbox.africastalking.com/).
2. Create or edit your USSD channel / service.
3. Set the **callback URL** to your zrok2 URL with the USSD path:

   ```
   https://<your-zrok2-host>/ussd
   ```

4. Use the sandbox test dial code to exercise menus. The backend expects `POST` with `sessionId`, `phoneNumber`, `serviceCode`, and `text` (form body), and responds with plain text `CON …` or `END …`.

**Notes:**

- Use the `zrok2` binary only. Commands like `zrok share` belong to v1 and will not work with myzrok.io / api-v2.
- The share is ephemeral: it stops when you press `Ctrl+C`. For a long-running tunnel, use the [zrok agent](https://docs.zrok.io/docs/guides/agent/).
- Self-hosting a zrok2 controller is optional (`zrok-setup.sh.sh` is for operators running their own instance, not required for myzrok.io dev).

### 5. Test matching without USSD

```http
POST http://localhost:3000/ussd/match
Content-Type: application/json

{
  "skill": "plumber",
  "location": { "lat": -1.215, "lng": 36.885 },
  "description": "Leaking sink in Kahawa West"
}
```

---

## Updating `ussd-menu.config.ts`

USSD menus are configuration-driven from `src/config/ussd-menu.config.ts`.

Each screen has a key and a type:

- `choice`: numbered input (`1`, `2`, `0`) routed via `options`
- `input`: free text stored in `property`, then `next`
- `final`: terminal screen; service returns `END …`

Africa’s Talking session rules:

- First request has empty `text` → respond with `CON` and the first menu
- Ongoing steps → `CON …`
- Last step → `END …`
- Avoid special characters in menu text for telco compatibility

### Example: Add “Track Application” under Main Menu

1. In `main`, add option `8` and update `main.text`.
2. Add `trackAppPhone` (input) and `trackAppResult` (final).

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

- Wire `SmsService` to Africa’s Talking sandbox API
- Use Redis for USSD session persistence
- Unify Prisma `Worker` and TypeORM `workers` into one model
- Add Supplier and Ready-to-Occupy flows
