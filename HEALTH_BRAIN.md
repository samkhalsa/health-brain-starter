# HEALTH BRAIN — Longevity & Performance Tracking System

> *"Don't die."*

**Patient:** `[Your Name]` | **Age:** `[##]` | **Height:** `[### cm / #'##"]` | **Weight:** `[### lbs / ### kg]` | **BMI:** `[##.#]`
**Doctor:** `[Your Physician]` | **Wearable:** `[WHOOP / Oura / Garmin / etc.]` | **Location:** `[City, Country]` | **Lab:** `[Lab Name]`
**Allergies:** `[Known allergies]` | **Alcohol:** `[frequency]`
**Supplements:** `[current stack — see 08_supplements.md]`
**Injuries:** `[active issues — see 13_injuries_physio.md]`
**Training:** `[frequency × duration × type]`

---

## STATUS DASHBOARD

### The Big 5 Longevity Predictors

| Metric | Your Value | Date | Target | Status |
|--------|-----------|------|--------|--------|
| **VO2 Max** | `[##]` | `[date]` | Top 25% for age | `[NEEDS TESTING / GOOD / OPTIMAL]` |
| **Grip Strength** | `[## kg]` or `[dead hang ##s]` | `[date]` | Dead hang 2 min | `[status]` |
| **Lean Muscle Mass** | `[### lbs / ##% BW]` | `[date]` | >70% BW (DEXA) | `[status]` |
| **ApoB** | `[## mg/dL]` | `[date]` | <90 (aggressive: <60) | `[status]` |
| **HbA1c** | `[#.#%]` | `[date]` | 4.8–5.2% | `[status]` |

### Wearable 30-Day Averages (`[date range]`)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| HRV (rMSSD) | `[## ms]` | Stable/up | `[status]` |
| Resting HR | `[## bpm]` | <60 | `[status]` |
| Recovery | `[##%]` | >66% | `[status]` |
| Sleep | `[#.# hrs]` | 7.5–9.0 | `[status]` |
| Deep Sleep | `[##%]` | 15–23% | `[status]` |
| REM Sleep | `[##%]` | 20–25% | `[status]` |
| Sleep Efficiency | `[##%]` | >90% | `[status]` |

### Bloodwork Red Flags (`[date]`)

| # | Finding | Value | Target | Severity |
|---|---------|-------|--------|----------|
| 1 | `[marker]` | `[value]` | `[target]` | `[CRITICAL / HIGH / MODERATE]` |
| 2 | `[marker]` | `[value]` | `[target]` | |
| 3 | `[marker]` | `[value]` | `[target]` | |
| 4 | `[marker]` | `[value]` | `[target]` | |
| 5 | `[marker]` | `[value]` | `[target]` | |

### Root Cause

> **One paragraph.** What single keystone issue is driving most of your red flags? (Often: excess body fat, chronic sleep debt, chronic stress, sedentary lifestyle, or a specific nutrient deficiency.) If you fix the keystone, most downstream markers follow.

---

## FILES

| Section | File | Description |
|---------|------|-------------|
| **ACTION PLAN** | [00_action_plan.md](sections/00_action_plan.md) | **START HERE.** Complete protocol — workout program, daily habits, eating rules, supplements, 3-phase timeline |
| Bloodwork | [01_bloodwork.md](sections/01_bloodwork.md) | Full blood panel with analysis, red flags, root cause diagram, all biomarker tables |
| Body Composition | [02_body_composition.md](sections/02_body_composition.md) | DEXA tracking, body fat %, lean mass, bone density |
| Cardiovascular | [03_cardiovascular.md](sections/03_cardiovascular.md) | VO2 max, RHR tracking, Zone 2 / HIIT logs, benchmarks |
| Strength | [04_strength.md](sections/04_strength.md) | Longevity benchmarks (dead hang, grip, sit-rise), training log, split template |
| Mobility | [05_mobility.md](sections/05_mobility.md) | Joint-by-joint framework, ROM tracking, CARs protocol, FMS, PAILs/RAILs |
| Sleep | [06_sleep.md](sections/06_sleep.md) | Sleep targets, protocol, wearable sleep log |
| Nutrition | [07_nutrition.md](sections/07_nutrition.md) | Macro targets, eating window, longevity foods, weekly log |
| Supplements | [08_supplements.md](sections/08_supplements.md) | Current stack, recommended additions, DO NOT supplement list |
| Recovery & HRV | [09_recovery_hrv.md](sections/09_recovery_hrv.md) | Wearable analysis, HRV data, recovery modalities, wellness check-in |
| Cognitive Health | [10_cognitive.md](sections/10_cognitive.md) | Cognitive testing, mental health tracking, neuroprotective habits |
| Daily Log | [11_daily_log.md](sections/11_daily_log.md) | Copy/paste daily tracking template |
| Testing Schedule | [12_testing_schedule.md](sections/12_testing_schedule.md) | When to test what, estimated costs, next due dates |
| Injuries & Physio | [13_injuries_physio.md](sections/13_injuries_physio.md) | Injury log, physio assessment, rehab protocols |
| Goals | [14_goals.md](sections/14_goals.md) | 90-day, 1-year, 5-year longevity targets |
| Reference | [15_appendix.md](sections/15_appendix.md) | Providers, labs, red flag quick card |
| Protocol Changes | [16_protocol_changes.md](sections/16_protocol_changes.md) | Change log with 4-week review |

---

## DATA INTEGRATIONS

### WHOOP (HRV, recovery, sleep, strain)
```bash
cd whoop/ && python3 pull_data.py 30
```

### Withings (weight, body composition)
```bash
cd withings/ && python3 pull_data.py 90
```

See [whoop/README.md](whoop/README.md) and [withings/README.md](withings/README.md) for setup.

### Telegram reminders (supplements, daily workout)
```bash
cd telegram_bot/ && python3 bot.py
```

See [telegram_bot/README.md](telegram_bot/README.md) for setup.

---

*Last updated: `[YYYY-MM-DD]`*
*Next review: update continuously as data comes in*
