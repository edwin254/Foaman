# Foaman Backend – Worker Flow

NestJS backend for Foaman’s USSD worker-matching flow. It exposes a webhook for Africa’s Talking, drives multi-step menus from configuration, and matches customers with verified fundis.

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
           └──────── handleFinalState ──────────┘
                     │                    │
                Prisma (Job, User, Skill)  TypeORM (workers)
                     │                    │
                     └────── Postgres ──────┘
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Entry | `src/main.ts` | Boots NestJS on port `3000` |
| HTTP | `src/ussd/ussd.controller.ts` | `POST /ussd` (AT webhook), `POST /ussd/match` (dev API) |
| Onboarded users | `src/users/users.controller.ts` | `GET /onboarded` (no auth yet — dev/ops) |
| USSD engine | `src/ussd/ussd.service.ts` | Session steps, `CON`/`END` responses |
| Menu config | `src/config/ussd-menu.config.ts` | All USSD screens |
| Matching | `src/worker/services/worker.service.ts` | Fundi lookup, SMS, job assignment |
| SMS | `src/common/services/sms.service.ts` | Africa’s Talking (logs only until wired) |
| Sessions | `src/ussd/session-store.service.ts` | In-memory `Map` (Redis planned) |

**Data access:** Prisma (`User`, `Skill`, `Worker`, `Job`) and TypeORM (`workers` table for matching) share one Postgres database. USSD worker signup uses TypeORM; job posting uses Prisma.

### Entry points

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/ussd` | Africa’s Talking callback (`sessionId`, `phoneNumber`, `serviceCode`, `text`) |
| `POST` | `/ussd/match` | Direct matching API (local/dev testing) |
| `GET` | `/onboarded` | List USSD-onboarded users (`?role=CUSTOMER` optional). **No auth yet.** |

### Database schema (Prisma)

| Model | Key fields |
|-------|------------|
| `User` | `phone`, `fullName`, `location`, `role` |
| `Skill` | `name` (unique catalog; populated via USSD lookup or optional `db:seed`) |
| `Worker` | `userId`, `idNumber`, `skill`, `isVerified` |
| `Job` | `customerId`, `skillNeeded`, `location`, `description`, `status` |

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

Run behind nginx, Caddy, or a cloud load balancer that forwards `POST /ussd` to port `3000`.

### 5. Africa’s Talking (production)

1. Register your production USSD service in the [Africa’s Talking dashboard](https://account.africastalking.com/).
2. Set callback URL to your public API:

   ```
   https://<your-production-domain>/ussd
   ```

3. Implement real SMS in `src/common/services/sms.service.ts` (replace console logging).
4. Confirm responses use `CON` / `END` plain text as required by AT.

### 6. Security and ops

| Item | Recommendation |
|------|----------------|
| TLS | Terminate HTTPS at the edge; do not expose plain HTTP publicly |
| Secrets | Rotate `AFRICASTALKING_APIKEY` and DB passwords independently |
| Logging | Log `sessionId` / `phoneNumber` carefully; avoid PII in public logs |
| Health | Monitor process restarts and DB connectivity |
| Dev endpoints | Restrict `GET /onboarded` and `POST /ussd/match` behind auth before production |

---

## Updating `ussd-menu.config.ts`

Menus live in `src/config/ussd-menu.config.ts`.

| Type | Behavior |
|------|----------|
| `choice` | Numbered input routed via `options` |
| `input` | Free text → `property`, then `next` |
| `final` | Terminal screen → `END …` |

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
- Redis-backed USSD sessions
- Unify Prisma `Worker` and TypeORM `workers`
- Supplier and Ready-to-Occupy flows
