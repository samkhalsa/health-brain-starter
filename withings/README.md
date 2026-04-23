# Withings Scale Integration

Pulls weight + body-composition data from the Withings cloud (Body+, Body Comp, Body Cardio, Body Scan) into the Health Brain.

## One-time setup

### 1. Register a Withings developer app

1. Go to [developer.withings.com/dashboard](https://developer.withings.com/dashboard)
2. Create an application:
   - **Registered URLs (callback):** `http://localhost:8080/callback`
   - **Scope:** `user.metrics`
3. Copy your Client ID and Client Secret

### 2. Configure credentials

```bash
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

## Pull data

```bash
python3 pull_data.py                         # Last 30 days
python3 pull_data.py 90                      # Last 90 days
python3 pull_data.py 2026-01-01 2026-04-21   # Specific range
```

### Outputs (gitignored)

- `withings_report.md` — formatted markdown to paste into `sections/02_body_composition.md`
- `withings_raw.json` — raw measurements for reference

## What gets captured

Depending on your scale model, any of: weight, body fat %, fat mass, lean mass, muscle mass, bone mass, hydration, heart rate at weigh-in, pulse wave velocity (Body Cardio), visceral fat (Body Comp), vascular age (Body Scan).

## Notes

- Bioimpedance body-fat % is ±3–5% noisy. Track the **trend**, not absolute values — DEXA is source of truth.
- Refresh tokens last 1 year. If `pull_data.py` fails with a token error, re-run `auth.py`.
