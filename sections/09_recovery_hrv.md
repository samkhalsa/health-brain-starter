# 09. RECOVERY & HRV

> Your wearable's HRV is a daily readiness signal. Track the 7-day rolling average, not individual days. A single low day means nothing; three in a row means something.

**Data source:** `[WHOOP / Oura / Garmin / Apple Watch]` (auto-pulled via API — see [../whoop/](../whoop/))

---

## 30-Day Summary (`[date range]`)

Paste the latest output from `python3 ../whoop/pull_data.py 30` here.

| Metric | Your Average | Longevity Target | Assessment |
|--------|-------------|------------------|------------|
| **HRV (rMSSD)** | `[## ms]` (range: `[##–##]`) | Stable/up | |
| **Resting HR** | `[## bpm]` | <60 bpm | |
| **Recovery Score** | `[##%]` | >66% (green) | |
| **SpO2** | `[##.#%]` | >95% | |
| **Skin Temp** | `[##.#°C]` | Stable baseline | |
| **Total Sleep** | `[#.# hrs]` | 7.5–9.0 hrs | |
| **Deep Sleep** | `[##%]` | 15–23% | |
| **REM Sleep** | `[##%]` | 20–25% | |
| **Sleep Efficiency** | `[##%]` | >90% | |

---

## Analysis — What the Data Tells Me

Write 1–2 paragraphs interpreting the numbers above.

- What's strong? What's weak?
- Where does wearable data contradict your bloodwork / subjective state? (That gap is often the most informative thing.)
- What patterns do you see in low-recovery days? (Late alcohol, poor sleep, travel, high stress?)

---

## Red Flag Days (Recovery <50%)

| Date | Recovery % | HRV | RHR | What happened |
|------|-----------|-----|-----|---------------|
| | | | | |

---

## Training Pattern Critique

What does your workout + strain data reveal?

- Frequency: `[## sessions / 30 days]`
- Avg duration: `[## min]`
- Zone 2 minutes/week: `[###]` (target: 150+)
- HIIT sessions/week: `[#]`
- Imbalance or gaps: `[notes]`

---

## Recovery Data Table

Pull automatically. This will be populated by `../whoop/pull_data.py 30`.

| Date | Recovery % | HRV (ms) | RHR (bpm) | SpO2 % | Skin Temp (°C) |
|------|-----------|----------|-----------|--------|---------------|
| | | | | | |

---

## HRV Interpretation Rules

| Signal | Meaning | Action |
|--------|---------|--------|
| HRV trending **up** (7-day rolling) | Good recovery, adaptation | Push training intensity |
| HRV **stable** at baseline | Maintaining | Continue current load |
| HRV trending **down** (3+ days) | Accumulated stress / fatigue | Reduce intensity, prioritize sleep |
| HRV **crashed** (>15% below baseline) | Overtraining / illness / major stressor | Active recovery only |

---

## Recovery Modalities

Track what you actually do, not what you plan to.

| Modality | Target frequency | Actual (last 30 days) | Notes |
|----------|-----------------|----------------------|-------|
| Cold exposure (plunge / cold shower) | 3x/week, 1–3 min @ 50–59°F | | |
| Sauna | 3–4x/week, 20 min @ 170–210°F | | |
| Foam rolling / SMR | Daily, 10 min | | |
| Massage / bodywork | 1–2x/month | | |
| Active recovery (walk, easy swim) | 2x/week | | |
| Meditation / breathwork | Daily, 10 min | | |
| Contrast therapy (hot/cold) | 1–2x/week | | |

---

## Daily Wellness Check-In

Quick 30-second self-report. Log every morning.

| Metric | Scale | Today |
|--------|-------|-------|
| Energy | 1–10 | |
| Mood | 1–10 | |
| Motivation to train | 1–10 | |
| Muscle soreness (10 = no soreness) | 1–10 | |
| Stress level (10 = no stress) | 1–10 | |
| Appetite | Normal / Increased / Decreased | |
| **Composite** | `__/60` | <35 → consider a recovery day |
