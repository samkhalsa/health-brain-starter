/**
 * Daily supplement stack — source of truth for the Today page checklist.
 * Matches the Telegram bot's `SUPPLEMENT_REMINDERS` (telegram_bot/shared/config.py)
 * but structured for per-item check-off.
 */

export type SupplementBlock = "morning" | "evening";

export type Supplement = {
  key: string; // stable DB key
  name: string; // display name
  dose: string; // dose/instruction
  block: SupplementBlock;
  note?: string; // optional second-line hint
};

export const SUPPLEMENTS: Supplement[] = [
  {
    key: "mg-glycinate-am",
    name: "Magnesium Glycinate",
    dose: "240mg",
    block: "morning",
  },
  {
    key: "d3",
    name: "Vitamin D3",
    dose: "5,000 IU",
    block: "morning",
    note: "Daily (vit D 31.2 → low end)",
  },
  {
    key: "k2",
    name: "Vitamin K2 (MK-7)",
    dose: "100mcg",
    block: "morning",
    note: "Pair with D3",
  },
  {
    key: "omega-3",
    name: "Omega-3 EPA/DHA",
    dose: "with first meal",
    block: "morning",
  },
  {
    key: "mg-glycinate-pm",
    name: "Magnesium Glycinate",
    dose: "240mg",
    block: "evening",
    note: "30 min before bed",
  },
];

export function supplementsByBlock(block: SupplementBlock): Supplement[] {
  return SUPPLEMENTS.filter((s) => s.block === block);
}

export function allKeys(): string[] {
  return SUPPLEMENTS.map((s) => s.key);
}
