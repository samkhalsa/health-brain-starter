# Telegram Reminder Bot

Daily supplement reminders + daily workout program, pushed to your phone via Telegram. Two deployment options:

- **Local** — run `python3 bot.py` in a terminal or as a background service. Uses `schedule` to fire reminders in-process.
- **Vercel serverless** — deploy `api/index.py` as serverless functions triggered by Vercel Cron. Requires no always-on machine.

## One-time setup

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
cp .env.example .env
```

Edit `.env`:

```bash
BOT_TOKEN=123456:ABC-your-bot-token-here
CHAT_ID=123456789
TIMEZONE=America/New_York
GYM_REMINDER_TIME=11:00
```

### 3. Customize your reminders

Edit the `REMINDERS` and `WORKOUTS` dicts:

- **Local run:** [config.py](config.py)
- **Vercel run:** [shared/config.py](shared/config.py)

Base them on YOUR supplement stack ([../sections/08_supplements.md](../sections/08_supplements.md)) and weekly split ([../sections/04_strength.md](../sections/04_strength.md)).

## Option A: run locally

```bash
pip3 install -r requirements.txt
python3 bot.py
```

The bot stays alive in the terminal, sending reminders at the scheduled times and responding to commands:

| Command | Effect |
|---------|--------|
| `/done` | Confirm supplements taken |
| `/status` | Show current schedule |
| `/remind` | Trigger all supplement reminders now |
| `/workout` | Send today's workout on demand |
| `/timezone` | View or change your timezone |

## Option B: deploy to Vercel

For 24/7 reliability without a local machine running.

```bash
cd telegram_bot
npx vercel login
npx vercel link
npx vercel env add BOT_TOKEN
npx vercel env add CHAT_ID
npx vercel env add TIMEZONE
npx vercel env add CRON_SECRET   # random string: openssl rand -hex 32
npx vercel --prod
```

[vercel.json](vercel.json) already defines the cron schedule. Adjust the times (UTC) to match your preferred local hours:

```json
{
  "crons": [
    { "path": "/api/cron/morning", "schedule": "0 13 * * *" },
    { "path": "/api/cron/gym",     "schedule": "0 15 * * *" },
    { "path": "/api/cron/evening", "schedule": "0 1 * * *"  }
  ]
}
```

After deploy, set the Telegram webhook so incoming messages route to `/api/webhook`:

```bash
curl -X POST "https://api.telegram.org/bot$BOT_TOKEN/setWebhook?url=https://<your-project>.vercel.app/api/webhook"
```
