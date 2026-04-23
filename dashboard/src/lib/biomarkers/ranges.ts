/**
 * Per-marker metadata: display name, category, optimal direction, clinical context.
 * Stable across panels — biomarker rows in Postgres only store the *measured* values.
 */

export type BiomarkerCategory =
  | "metabolic"
  | "lipids"
  | "inflammation"
  | "hormones"
  | "organ"
  | "nutrients";

export type OptimalDirection =
  | "lower" // lower is better
  | "higher" // higher is better
  | "middle" // middle-of-range is best
  | "band"; // inside a specific band is best

export type BiomarkerMeta = {
  key: string;
  name: string;
  category: BiomarkerCategory;
  direction: OptimalDirection;
  why: string; // one-line "why it matters"
  lever?: string; // lifestyle / intervention lever
};

const META_LIST: BiomarkerMeta[] = [
  // --- Metabolic ---
  {
    key: "fasting_glucose",
    name: "Fasting Glucose",
    category: "metabolic",
    direction: "lower",
    why: "Steady-state blood sugar. High = insulin can't keep up.",
  },
  {
    key: "hba1c",
    name: "HbA1c",
    category: "metabolic",
    direction: "lower",
    why: "3-month average blood sugar. Diabetes gatekeeper.",
    lever: "Lose visceral fat, cut refined carbs, Zone 2 cardio 4×/wk",
  },
  {
    key: "fasting_insulin",
    name: "Fasting Insulin",
    category: "metabolic",
    direction: "lower",
    why: "How hard your pancreas has to work. High = insulin resistance.",
  },
  {
    key: "homa_ir",
    name: "HOMA-IR",
    category: "metabolic",
    direction: "lower",
    why: "Composite insulin-resistance score. <1 = optimal.",
  },

  // --- Lipids ---
  {
    key: "apo_b",
    name: "ApoB",
    category: "lipids",
    direction: "lower",
    why: "Counts every atherogenic particle. Best CV risk marker.",
  },
  {
    key: "apo_a1",
    name: "ApoA1",
    category: "lipids",
    direction: "higher",
    why: "HDL's protein partner. Higher protects against atherosclerosis.",
  },
  {
    key: "lp_a",
    name: "Lp(a)",
    category: "lipids",
    direction: "lower",
    why: "Genetic CV risk. Non-modifiable — you either got lucky or didn't.",
  },
  {
    key: "triglycerides",
    name: "Triglycerides",
    category: "lipids",
    direction: "lower",
    why: "Circulating fat. Reflects recent carb/alcohol intake.",
  },
  {
    key: "hdl_c",
    name: "HDL-C",
    category: "lipids",
    direction: "higher",
    why: "The 'good' cholesterol. Low HDL = metabolic syndrome signal.",
    lever: "Zone 2 cardio, omega-3, reduce refined carbs",
  },
  {
    key: "ldl_c",
    name: "LDL-C",
    category: "lipids",
    direction: "lower",
    why: "Traditional bad cholesterol. ApoB is a better marker.",
  },
  {
    key: "total_cholesterol",
    name: "Total Cholesterol",
    category: "lipids",
    direction: "lower",
    why: "Sum of all cholesterol fractions. Less useful than ApoB.",
  },
  {
    key: "non_hdl_cholesterol",
    name: "Non-HDL Cholesterol",
    category: "lipids",
    direction: "lower",
    why: "All the bad stuff minus the good. Proxy for ApoB.",
  },
  {
    key: "tc_hdl_ratio",
    name: "TC/HDL Ratio",
    category: "lipids",
    direction: "lower",
    why: "Cheap proxy for CV risk. <3.5 is protective.",
  },

  // --- Inflammation ---
  {
    key: "hs_crp",
    name: "hs-CRP",
    category: "inflammation",
    direction: "lower",
    why: "Systemic inflammation marker. High = silent damage accumulating.",
    lever: "Lose visceral fat, sleep, omega-3, resolve illness",
  },
  {
    key: "homocysteine",
    name: "Homocysteine",
    category: "inflammation",
    direction: "lower",
    why: "CV + brain risk. Elevated = B-vitamin methylation issue.",
    lever: "Methylfolate, B6, B12",
  },
  {
    key: "esr",
    name: "ESR",
    category: "inflammation",
    direction: "lower",
    why: "Non-specific inflammation. Good for ruling out chronic process.",
  },

  // --- Hormones ---
  {
    key: "total_testosterone",
    name: "Total Testosterone",
    category: "hormones",
    direction: "higher",
    why: "Primary male hormone. Low = muscle loss, fatigue, low drive.",
    lever: "Lose fat, lift heavy, sleep, fix estradiol",
  },
  {
    key: "free_testosterone",
    name: "Free Testosterone",
    category: "hormones",
    direction: "higher",
    why: "The bio-available fraction. What your tissues actually see.",
  },
  {
    key: "shbg",
    name: "SHBG",
    category: "hormones",
    direction: "middle",
    why: "Binds sex hormones. Low SHBG = hallmark of insulin resistance.",
  },
  {
    key: "lh",
    name: "LH",
    category: "hormones",
    direction: "middle",
    why: "Pituitary signal to testes. Low + low T = secondary hypogonadism.",
  },
  {
    key: "dhea_s",
    name: "DHEA-S",
    category: "hormones",
    direction: "higher",
    why: "Adrenal reserve. Declines with age and chronic stress.",
  },
  {
    key: "cortisol_am",
    name: "Cortisol (AM)",
    category: "hormones",
    direction: "band",
    why: "Your stress-response engine. Low AM = HPA axis burned out.",
    lever: "Reduce chronic stress, sleep 8h, morning sunlight",
  },
  {
    key: "tsh",
    name: "TSH",
    category: "hormones",
    direction: "middle",
    why: "Thyroid signal. High = thyroid sluggish, low = hyper.",
  },
  {
    key: "free_t3",
    name: "Free T3",
    category: "hormones",
    direction: "higher",
    why: "Active thyroid hormone. Drives metabolism.",
  },
  {
    key: "free_t4",
    name: "Free T4",
    category: "hormones",
    direction: "middle",
    why: "Thyroid prohormone. Converts to T3 peripherally.",
  },
  {
    key: "estradiol",
    name: "Estradiol",
    category: "hormones",
    direction: "band",
    why: "Men need *some*. Too much (from adipose aromatase) wrecks T:E2.",
    lever: "Lose body fat — aromatase lives in adipose tissue",
  },

  // --- Organ function ---
  {
    key: "egfr",
    name: "eGFR",
    category: "organ",
    direction: "higher",
    why: "Kidney filtration rate. Higher = cleaner filters.",
  },
  {
    key: "creatinine",
    name: "Creatinine",
    category: "organ",
    direction: "middle",
    why: "Muscle metabolism byproduct filtered by kidneys.",
  },
  {
    key: "uric_acid",
    name: "Uric Acid",
    category: "organ",
    direction: "lower",
    why: "High = gout + CV risk. Linked to fructose + alcohol.",
  },
  {
    key: "alt",
    name: "ALT (SGPT)",
    category: "organ",
    direction: "lower",
    why: "Liver enzyme. Leaks when hepatocytes are stressed.",
    lever: "Fat loss, reduce alcohol, milk thistle, check iron",
  },
  {
    key: "ast",
    name: "AST (SGOT)",
    category: "organ",
    direction: "lower",
    why: "Liver + muscle enzyme. AST/ALT ratio hints at cause.",
  },
  {
    key: "ggt",
    name: "GGT",
    category: "organ",
    direction: "lower",
    why: "Metabolic liver marker. Most sensitive to fatty liver.",
  },
  {
    key: "alk_phos",
    name: "Alk Phosphatase",
    category: "organ",
    direction: "band",
    why: "Liver + bone + bile-duct enzyme.",
  },
  {
    key: "bilirubin_total",
    name: "Bilirubin (Total)",
    category: "organ",
    direction: "band",
    why: "Red-cell breakdown product. Liver clears it.",
  },
  {
    key: "albumin",
    name: "Albumin",
    category: "organ",
    direction: "higher",
    why: "Primary serum protein. Low = liver or nutrition issue.",
  },

  // --- Nutrients ---
  {
    key: "vitamin_d",
    name: "Vitamin D (25-OH)",
    category: "nutrients",
    direction: "higher",
    why: "Hormone, not vitamin. Drives immunity, T, bone, mood.",
    lever: "5,000 IU D3 + K2 daily, sun exposure",
  },
  {
    key: "vitamin_b12",
    name: "Vitamin B12",
    category: "nutrients",
    direction: "higher",
    why: "Nerve + blood + methylation. Low = brain + anemia risk.",
  },
  {
    key: "ferritin",
    name: "Ferritin",
    category: "nutrients",
    direction: "band",
    why: "Iron storage. Too high = oxidative stress, inflammation.",
    lever: "Blood donation every 8-12 weeks can lower iron",
  },
  {
    key: "transferrin_sat",
    name: "Transferrin Saturation",
    category: "nutrients",
    direction: "band",
    why: "How saturated iron transport is. >45% = iron overload pattern.",
  },
  {
    key: "serum_iron",
    name: "Serum Iron",
    category: "nutrients",
    direction: "middle",
    why: "Circulating iron. Fluctuates with intake — ferritin is steadier.",
  },
  {
    key: "calcium",
    name: "Calcium",
    category: "nutrients",
    direction: "band",
    why: "Bones, muscles, nerves. Tightly regulated.",
  },
  {
    key: "sodium",
    name: "Sodium",
    category: "nutrients",
    direction: "band",
    why: "Fluid balance. Tightly regulated.",
  },
  {
    key: "potassium",
    name: "Potassium",
    category: "nutrients",
    direction: "band",
    why: "Muscle + nerve. High = cardiac risk if persistent.",
  },
];

export const BIOMARKER_META: Record<string, BiomarkerMeta> = Object.fromEntries(
  META_LIST.map((m) => [m.key, m])
);

export const CATEGORIES: BiomarkerCategory[] = [
  "metabolic",
  "lipids",
  "inflammation",
  "hormones",
  "organ",
  "nutrients",
];

export const CATEGORY_LABEL: Record<BiomarkerCategory, string> = {
  metabolic: "Metabolic",
  lipids: "Lipids",
  inflammation: "Inflammation",
  hormones: "Hormones",
  organ: "Organ",
  nutrients: "Nutrients",
};
