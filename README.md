# Health Brain Starter

A skeleton for building your own personal longevity & performance tracking system — a **health operating system** that treats your body like a complex system you can measure, diagnose, and optimize.

> **This is a template, not medical advice.** Fill it in with your own data, your own doctor's guidance, and your own protocols.

---

## What's in the box

```
.
├── HEALTH_BRAIN.md          # Central dashboard (template)
├── sections/                # 17 markdown templates covering every dimension of health
│   ├── 00_action_plan.md
│   ├── 01_bloodwork.md
│   ├── 02_body_composition.md
│   ├── 03_cardiovascular.md
│   ├── 04_strength.md
│   ├── 05_mobility.md
│   ├── 06_sleep.md
│   ├── 07_nutrition.md
│   ├── 08_supplements.md
│   ├── 09_recovery_hrv.md
│   ├── 10_cognitive.md
│   ├── 11_daily_log.md
│   ├── 12_testing_schedule.md
│   ├── 13_injuries_physio.md
│   ├── 14_goals.md
│   ├── 15_appendix.md
│   └── 16_protocol_changes.md
├── whoop/                   # Python client for WHOOP API — pulls HRV, sleep, strain, workouts
├── withings/                # Python client for Withings API — pulls weight & body composition
└── telegram_bot/            # Daily supplement + workout reminders via Telegram
```

The **section files** are the product. The Python integrations automate data collection so you're not copy-pasting numbers from apps every week.

---

## Philosophy

1. **Data over feelings.** Measure everything. Trust numbers, not vibes.
2. **Root cause over symptoms.** Don't treat elevated estrogen; fix the body fat that causes aromatization.
3. **One keystone change.** Most health issues trace to a single root cause. Find yours.
4. **Minimum viable tracking.** Start with 5 things. Add complexity only when the basics are locked.
5. **Automate the reminders.** Willpower is finite. Bots don't forget.
6. **Quarterly accountability.** Retest at 90 days. Data tells you if the protocol is working.

---

## Quick start

### 1. Fork and clone

```bash
git clone https://github.com/YOUR_USERNAME/health-brain-starter.git
cd health-brain-starter
```

### 2. Fill in the section files

Work through `sections/` in this order:

1. **`01_bloodwork.md`** — Get a comprehensive panel done (see [bloodwork guide](#bloodwork-panel-what-to-ask-for)). Fill in every marker with value + reference range + your interpretation.
2. **`00_action_plan.md`** — Based on your red flags, draft your protocol: nutrition, training, supplements, sleep, phased over 16 weeks.
3. **`HEALTH_BRAIN.md`** — The dashboard: summarize your patient profile, top 5 red flags, wearable baseline, and the single root cause.
4. The rest — fill in as you have data.

### 3. Wire up integrations

- **[WHOOP](#whoop-setup)** — auto-pull HRV, sleep, recovery, workouts
- **[Withings](#withings-setup)** — auto-pull weight & body composition
- **[Telegram bot](#telegram-bot-setup)** — daily supplement + workout reminders

---

## WHOOP setup

Pulls recovery, sleep, strain, and workout data from your WHOOP band.

### 1. Register a WHOOP Developer App

1. Go to [developer-dashboard.whoop.com](https://developer-dashboard.whoop.com)
2. Sign in with your WHOOP account
3. Create a **Team** (any name, e.g., "Health Brain")
4. Click **Create App** and configure:
   - **App Name:** Health Brain
   - **Scopes:** check ALL of these:
     - `read:recovery`
     - `read:cycles`
     - `read:sleep`
     - `read:workout`
     - `read:profile`
     - `read:body_measurement`
   - **Redirect URI:** `http://localhost:8080/callback`
5. Copy your **Client ID** and **Client Secret**

### 2. Configure credentials

```bash
cd whoop
cp .env.example .env
```

Edit `.env` and paste your credentials:

```bash
WHOOP_CLIENT_ID=your_client_id_here
WHOOP_CLIENT_SECRET=your_client_secret_here
```

### 3. Install dependencies

```bash
pip3 install -r requirements.txt
```

### 4. Authenticate (once)

```bash
python3 auth.py
```

Your browser opens, you approve, tokens are saved to `whoop_tokens.json` (gitignored).

### 5. Pull data

```bash
python3 pull_data.py              # Last 7 days
python3 pull_data.py 30           # Last 30 days
python3 pull_data.py 2026-03-01 2026-04-13  # Date range
```

Output files (gitignored):
- `whoop_report.md` — formatted markdown report ready to paste into `sections/09_recovery_hrv.md`
- `whoop_raw.json` — raw API data

---

## Withings setup

Pulls weight & body-composition data from your Withings scale (Body+, Body Comp, Body Cardio, or Body Scan).

### 1. Register a Withings Developer App

1. Go to [developer.withings.com/dashboard](https://developer.withings.com/dashboard)
2. Sign in and create an application
3. Configure:
   - **Registered URLs (callback):** `http://localhost:8080/callback`
   - **Scope:** `user.metrics`
4. Copy your **Client ID** and **Client Secret**

### 2. Configure credentials

```bash
cd withings
cp .env.example .env
```

Edit `.env`:

```bash
WITHINGS_CLIENT_ID=your_client_id_here
WITHINGS_CLIENT_SECRET=your_client_secret_here
```

### 3. Install & authenticate

```bash
pip3 install -r requirements.txt
python3 auth.py
```

### 4. Pull data

```bash
python3 pull_data.py              # Last 30 days
python3 pull_data.py 90           # Last 90 days
python3 pull_data.py 2026-01-01 2026-04-21
```

Output (gitignored):
- `withings_report.md` — paste into `sections/02_body_composition.md`
- `withings_raw.json` — raw measurements

**Note:** Bioimpedance body-fat % is ±3–5% noisy. Track the *trend*, not absolute values. DEXA is source of truth.

---

## Telegram bot setup

Daily supplement reminders + daily workout plan, pushed to your phone via Telegram.

### 1. Create a bot

1. Open Telegram, message `@BotFather`
2. Send `/newbot`, follow the prompts, save the bot token
3. Message your new bot from your personal Telegram account (just send "hello")
4. Get your chat ID by visiting:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
   Look for `"chat":{"id": 123456789,...}` — that number is your chat ID.

### 2. Configure

```bash
cd telegram_bot
cp .env.example .env
```

Edit `.env`:

```bash
BOT_TOKEN=123456:ABC-your-bot-token-here
CHAT_ID=123456789
TIMEZONE=America/New_York
```

### 3. Customize your reminders

Edit `telegram_bot/config.py` (local) or `telegram_bot/shared/config.py` (Vercel):
- `REMINDERS` — your supplement schedule
- `WORKOUTS` — your weekly workout program (day 0 = Monday)
- `GYM_REMINDER_TIME` — when to send today's workout

### 4. Run locally

```bash
pip3 install -r requirements.txt
python3 bot.py
```

The bot stays alive in the terminal, sending reminders at the scheduled times and responding to `/done`, `/status`, `/workout`, `/remind`, `/timezone`.

### 5. (Optional) Deploy to Vercel for 24/7 reliability

```bash
npx vercel link
npx vercel env add BOT_TOKEN
npx vercel env add CHAT_ID
npx vercel env add TIMEZONE
npx vercel env add CRON_SECRET   # any random string
npx vercel --prod
```

`vercel.json` already defines the cron schedule. Adjust the times (UTC) to match your preferred local hours.

---

## Bloodwork panel — what to ask for

At minimum, request a comprehensive panel covering:

| Category | Key markers |
|----------|------------|
| **Metabolic** | HbA1c, fasting glucose, fasting insulin, HOMA-IR |
| **Lipids** | Total cholesterol, LDL, HDL, triglycerides, ApoB, Lp(a) |
| **Inflammation** | hs-CRP, homocysteine, ESR |
| **Hormones** | Total/free testosterone, estradiol, SHBG, cortisol AM, DHEA-S, thyroid (TSH, fT3, fT4) |
| **Organ function** | ALT, AST, GGT, bilirubin, creatinine, eGFR, BUN, uric acid |
| **Nutrients** | Vitamin D (25-OH), B12, folate, ferritin, iron, transferrin saturation, magnesium |
| **Blood count** | CBC with differential |

**Where:** InsideTracker, Marek Health, Function Health, Quest/Labcorp, or your local lab.

---

## The Big 5 longevity predictors

These are the five numbers that matter most. Get a baseline on each, then retest every 3–6 months:

| Metric | How to test |
|--------|-------------|
| **VO2 Max** | Cardiopulmonary exercise test at a sports-performance lab |
| **Grip Strength** | Hand dynamometer (or dead hang time) |
| **Lean Muscle Mass** | DEXA scan |
| **ApoB** | Bloodwork |
| **HbA1c** | Bloodwork |

---

## How to personalize this

This skeleton is opinionated, but your protocol should not copy anyone else's:

1. **Start with YOUR bloodwork.** Your red flags will be different. Supplements, nutrition priorities, and phased interventions all flow from bloodwork findings.
2. **Adapt training to YOUR injuries and level.** Mobility, exercise substitutions, and rehab work are specific to individual history.
3. **Set YOUR targets.** Use age/sex-appropriate reference ranges. Longevity benchmarks differ by demographic.
4. **Respect YOUR constraints.** Allergies, food traditions, budget, cooking ability — the framework transfers, the specifics don't.
5. **Use YOUR wearable.** If you use Oura or Garmin instead of WHOOP, swap the API integration. The metrics (HRV, RHR, sleep, recovery) are universal.

---

## Using AI to build this

This system is designed to be built in conversation with an AI assistant (Claude Code, Cursor, ChatGPT, etc.). A starting prompt:

> *"I want to build a comprehensive health tracking system. Here's my bloodwork [paste PDF], here's my wearable data, here are my injuries and current habits. Analyze everything, identify root causes, and build me a complete protocol across these 17 section files."*

The AI is good at:
- Connecting dots across bloodwork markers to identify root causes
- Drafting training programs grounded in your injury history
- Writing supplement protocols that map to specific bloodwork findings
- Building API integrations (both the WHOOP and Withings clients here were written by AI in a single session)

---

## Security notes

- **Secrets are read from environment variables.** Never commit `.env` files or `*_tokens.json`. They're already in `.gitignore`.
- **Your raw health data stays on your machine.** The Python scripts write `*_raw.json` and `*_report.md` locally — these are gitignored.
- **If you fork this repo privately and commit your data,** remove the `*_report.md` and `*_raw.json` lines from `.gitignore` so your data is tracked. But **never** commit tokens or API secrets.

---

## Disclaimer

**This is not medical advice.** The templates, benchmarks, and example protocols here are for educational purposes. Consult a licensed physician before making any decisions about your health, training, nutrition, or supplements based on what you build with this starter.

---

## License

MIT — see [LICENSE](LICENSE).
