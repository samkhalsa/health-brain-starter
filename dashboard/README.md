# Health Brain Dashboard

A Next.js dashboard for the Health Brain starter. Pulls WHOOP + Withings data automatically every morning via Vercel Cron, renders a Today view with recovery ring, sleep breakdown, weight sparkline, and today's prescribed workout.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Neon Postgres (time-series + OAuth tokens)
- Drizzle ORM + drizzle-kit
- NextAuth Credentials (single password login)
- Recharts for trends
- Vercel Cron for daily data pulls

## One-time setup

### 1. Install deps

```bash
cd dashboard
npm install
```

### 2. Provision Vercel + Neon

```bash
npx vercel login
npx vercel link            # create new project
npx vercel env pull .env.local
```

In the Vercel dashboard for this project:

- **Storage → Create → Neon (Serverless Postgres).** Attach to the project — env vars auto-added.
- **Settings → Environment Variables.** Add:
  - `AUTH_SECRET` — generate with `openssl rand -hex 32`
  - `AUTH_PASSWORD_HASH` — bcrypt hash of your login password:
    ```bash
    node -e "console.log(require('bcryptjs').hashSync('YOUR_PASSWORD', 10))"
    ```
  - `WHOOP_CLIENT_ID`, `WHOOP_CLIENT_SECRET` (from the WHOOP developer dashboard — see [../whoop/](../whoop/))
  - `WITHINGS_CLIENT_ID`, `WITHINGS_CLIENT_SECRET` (from the Withings developer dashboard — see [../withings/](../withings/))
  - `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` (optional — for failure alerts; see [../telegram_bot/](../telegram_bot/))
  - `CRON_SECRET` — generate with `openssl rand -hex 32` (Vercel also auto-injects this for cron routes)
  - `USER_TIMEZONE` — e.g. `America/New_York`, `Europe/London` (defaults to `America/New_York`)

Pull the latest env down:

```bash
npx vercel env pull .env.local
```

### 3. Create DB schema

```bash
npm run db:push
```

### 4. Seed OAuth tokens from the Python CLIs

First authenticate via the Python scripts (see [../whoop/README.md](../whoop/README.md) and [../withings/README.md](../withings/README.md)), which produces `whoop_tokens.json` and `withings_tokens.json`. Then:

```bash
npm run seed:tokens
```

This reads `../whoop/whoop_tokens.json` + `../withings/withings_tokens.json` and upserts into the `oauth_tokens` Postgres table.

### 5. Backfill historical data

```bash
npm run backfill:whoop -- 180     # 180 days of WHOOP history
npm run backfill:withings -- 365  # 12 months of Withings weigh-ins
```

### 6. Seed your bloodwork (optional)

Edit [data/biomarkers.seed.json](data/biomarkers.seed.json) with your panel values, then:

```bash
npm run seed:biomarkers
```

### 7. Cross-check data parity (optional)

```bash
npm run verify:parity
```

Confirms one WHOOP HRV value and one Withings weight value match between the Python `*_raw.json` files and the Drizzle/Postgres rows.

### 8. Deploy

```bash
npx vercel --prod
```

Open the deployed URL, log in with your password. Manually fire the crons once:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-project>.vercel.app/api/cron/whoop-pull
curl -H "Authorization: Bearer $CRON_SECRET" https://<your-project>.vercel.app/api/cron/withings-pull
```

Each should return `{ ok: true, recordsUpserted: N }`.

## Daily schedule

Crons defined in `vercel.json`. Times are UTC — adjust to your preferred local wake window.

| Schedule (UTC) | Path | Purpose |
|---|---|---|
| 09:30 | `/api/cron/sync-all` | Pre-wake sync (WHOOP recovery, weight) |
| 12:00 | `/api/cron/sync-all` | Safety net — catches late-scored WHOOP recovery |

On any failure, a Telegram alert fires to your configured `TELEGRAM_CHAT_ID` (if set).

## Local dev

```bash
# Option A: use your Neon remote DB (simplest)
npm run dev

# Option B: local Postgres via Docker
docker run --name hb-postgres -e POSTGRES_PASSWORD=dev -p 5432:5432 -d postgres:16
export POSTGRES_URL="postgres://postgres:dev@localhost:5432/postgres"
npm run db:push
npm run dev
```

The UI falls back to synthetic demo data ([src/lib/demo-data.ts](src/lib/demo-data.ts)) when Postgres is unavailable, so you can develop the UI before provisioning anything.

## Directory map

```
dashboard/
├── src/
│   ├── app/
│   │   ├── (auth)/login/          — password login
│   │   ├── (app)/                 — protected dashboard
│   │   │   ├── page.tsx           — / Today (the payoff)
│   │   │   ├── trends/            — wearable trends
│   │   │   ├── biomarkers/        — bloodwork explorer
│   │   │   └── body/              — weight + body comp
│   │   └── api/
│   │       ├── cron/whoop-pull/
│   │       ├── cron/withings-pull/
│   │       ├── cron/sync-all/
│   │       └── auth/[...nextauth]/
│   ├── lib/
│   │   ├── db/                    — Drizzle schema + client + queries
│   │   ├── whoop/                 — TS port of whoop/*.py
│   │   ├── withings/              — TS port of withings/*.py
│   │   ├── biomarkers/            — severity ranges & seed loader
│   │   ├── prescribe/             — "what to do today" rule engine
│   │   ├── auth.ts                — NextAuth config
│   │   ├── telegram.ts            — failure alerts
│   │   ├── timezone.ts            — user-TZ helpers (set via USER_TIMEZONE env)
│   │   └── dashboard-data.ts      — aggregates Today page data
│   ├── components/                — UI components
│   └── middleware.ts              — gate non-public routes
├── scripts/
│   ├── seed-tokens.ts
│   ├── backfill-whoop.ts
│   ├── backfill-withings.ts
│   ├── seed-biomarkers.ts
│   ├── apply-migration.ts
│   └── verify-parity.ts
├── data/
│   └── biomarkers.seed.json       — template; edit with your panel values
├── drizzle/                       — schema migrations
└── vercel.json                    — cron schedule
```

## Customization

Before shipping, you'll likely want to tweak:

- [src/lib/timezone.ts](src/lib/timezone.ts) — default timezone (also settable via `USER_TIMEZONE` env)
- [src/lib/whoop/labels.ts](src/lib/whoop/labels.ts) — how WHOOP sport names map to display names (depends on how you label workouts in the WHOOP app)
- [src/lib/prescribe/workouts.ts](src/lib/prescribe/workouts.ts) — your weekly workout template
- [src/lib/prescribe/engine.ts](src/lib/prescribe/engine.ts) — rules for adjusting prescription based on recovery, sleep, weight trend
- [src/lib/biomarkers/ranges.ts](src/lib/biomarkers/ranges.ts) — age/sex-specific optimal ranges
- [data/biomarkers.seed.json](data/biomarkers.seed.json) — your actual panel values
- [tailwind.config.ts](tailwind.config.ts) — color palette

## Roadmap

- **Phase 1:** Today view + daily WHOOP/Withings pulls + password login
- **Phase 2:** `/trends` charts, `/biomarkers` explorer seeded from your panel, full `/body` page
- **Phase 3:** Full prescription rules, `/journal`, morning Telegram brief with dashboard link
