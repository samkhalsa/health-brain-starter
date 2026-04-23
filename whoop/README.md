# WHOOP Integration

Pulls recovery, sleep, strain, and workout data from your WHOOP band and generates a markdown report for the Health Brain.

## Setup (one time)

### 1. Register a WHOOP developer app

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
cp .env.example .env
```

Edit `.env`:

```bash
WHOOP_CLIENT_ID=your_client_id_here
WHOOP_CLIENT_SECRET=your_client_secret_here
```

### 3. Install dependencies

```bash
pip3 install -r requirements.txt
```

### 4. Authenticate

```bash
python3 auth.py
```

Your browser opens, you log in, and tokens are saved to `whoop_tokens.json` (gitignored).

## Usage

```bash
python3 pull_data.py              # Last 7 days (default)
python3 pull_data.py 30           # Last 30 days
python3 pull_data.py 2026-03-01 2026-04-13  # Specific date range
```

### Output files (gitignored)

- `whoop_report.md` — formatted markdown ready to paste into `sections/09_recovery_hrv.md`
- `whoop_raw.json` — raw API response for reference

## What gets tracked

| Category | Metrics |
|----------|---------|
| **Recovery** | Recovery score (%), HRV (rMSSD ms), Resting HR, SpO2, Skin Temp |
| **Sleep** | Total sleep, Deep/REM/Light/Awake durations, Efficiency %, Performance %, Respiratory Rate |
| **Strain** | Day strain (0–21), Average/Max HR, Calories (kJ) |
| **Workouts** | Activity type, Workout strain, HR zones, Duration |

## Security

- Tokens are stored locally in `whoop_tokens.json` (gitignored)
- `.env` stays local (gitignored)
- No data leaves your machine
