# 02. BODY COMPOSITION

> DEXA is the gold standard. BIA scales (Withings, RENPHO) are ±3–5% noisy — useful for trend, not absolute numbers.

---

## A. Scale Data (Withings / BIA)

Daily weigh-ins — pull from Withings automatically:

```bash
cd ../withings && python3 pull_data.py 90
```

Paste the generated `withings_report.md` below, or link to the latest report.

### Latest weigh-in (`[YYYY-MM-DD]`)

| Metric | Value | Target | Delta vs 30d ago |
|--------|-------|--------|------------------|
| Weight | `[## lbs / ## kg]` | `[target]` | |
| Body fat % | `[##%]` | `[target]` | |
| Lean mass | `[## lbs]` | >70% of body weight | |
| Muscle mass | `[## lbs]` | trending up | |
| Bone mass | `[## lbs]` | stable | |
| Hydration | `[## lbs]` | | |

### Weigh-in log (last 30 days)

| Date | Weight (lbs) | Weight (kg) | Body Fat % | Lean (lbs) | Muscle (lbs) | Notes |
|------|-------------|-------------|-----------|-----------|-------------|-------|
| | | | | | | |

---

## B. DEXA Scans (source of truth)

Schedule every 3–6 months during an active cut or bulk.

| Date | Weight | Body fat % | Lean mass | Visceral fat | Bone density (Z-score) | Report link |
|------|--------|-----------|-----------|--------------|-----------------------|-------------|
| | | | | | | |

---

## C. Body Measurements (tape)

| Date | Waist | Hips | Chest | Arm | Thigh | Neck |
|------|-------|------|-------|-----|-------|------|
| | | | | | | |

**Waist-to-height ratio target:** <0.5

---

## D. Progress Photos

Front / side / back photos every 4 weeks, same lighting, same time of day.

Store locally (don't commit to a public repo). Link paths or iCloud album here.
