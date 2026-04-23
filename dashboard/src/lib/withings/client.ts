import { getValidAccessToken } from "./auth";

const API_BASE = "https://wbsapi.withings.net";

export const MEAS_TYPES: Record<number, keyof WithingsRecord> = {
  1: "weight_kg",
  5: "fat_free_mass_kg",
  6: "fat_ratio_pct",
  8: "fat_mass_kg",
  11: "heart_pulse_bpm",
  76: "muscle_mass_kg",
  77: "hydration_kg",
  88: "bone_mass_kg",
  91: "pulse_wave_velocity",
  155: "vascular_age",
  226: "visceral_fat",
};

export type WithingsRecord = {
  grpid: string;
  timestamp: number;
  date: string;
  datetime: string;
  weight_kg?: number;
  fat_free_mass_kg?: number;
  fat_ratio_pct?: number;
  fat_mass_kg?: number;
  heart_pulse_bpm?: number;
  muscle_mass_kg?: number;
  hydration_kg?: number;
  bone_mass_kg?: number;
  pulse_wave_velocity?: number;
  vascular_age?: number;
  visceral_fat?: number;
};

export type WithingsMeasureGroup = {
  grpid: number;
  date: number;
  measures: Array<{ value: number; type: number; unit: number }>;
};

/** Withings returns (value, unit) where actual = value * 10^unit. */
export function computeValue(value: number, unit: number): number {
  return value * Math.pow(10, unit);
}

export class WithingsClient {
  constructor(private readonly token: string) {}

  static async create(): Promise<WithingsClient> {
    return new WithingsClient(await getValidAccessToken());
  }

  private async post(
    path: string,
    data: Record<string, string>
  ): Promise<Record<string, unknown>> {
    const resp = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(data),
    });
    if (!resp.ok) {
      const text = await resp.text();
      throw new Error(`Withings POST ${path} failed: ${resp.status} ${text}`);
    }
    const payload = (await resp.json()) as { status: number; body?: Record<string, unknown>; error?: string };
    if (payload.status !== 0) {
      throw new Error(`Withings API error: ${JSON.stringify(payload)}`);
    }
    return payload.body ?? {};
  }

  async getMeasurements(start: Date, end: Date): Promise<WithingsRecord[]> {
    const body = await this.post("/measure", {
      action: "getmeas",
      meastypes: Object.keys(MEAS_TYPES).join(","),
      category: "1",
      startdate: String(Math.floor(start.getTime() / 1000)),
      enddate: String(Math.floor(end.getTime() / 1000)),
    });
    const groups = (body.measuregrps as WithingsMeasureGroup[] | undefined) ?? [];
    return this.flatten(groups);
  }

  private flatten(groups: WithingsMeasureGroup[]): WithingsRecord[] {
    const records: WithingsRecord[] = groups.map((g) => {
      const d = new Date(g.date * 1000);
      const r: WithingsRecord = {
        grpid: String(g.grpid),
        timestamp: g.date,
        date: d.toISOString().slice(0, 10),
        datetime: d.toISOString(),
      };
      for (const m of g.measures ?? []) {
        const field = MEAS_TYPES[m.type];
        if (!field) continue;
        const val = computeValue(m.value, m.unit);
        // 3-decimal rounding matches withings/api.py:compute_value downstream
        (r as Record<string, unknown>)[field] = Math.round(val * 1000) / 1000;
      }
      return r;
    });
    records.sort((a, b) => a.timestamp - b.timestamp);
    return records;
  }

  async pullLastNDays(days: number): Promise<WithingsRecord[]> {
    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - days);
    return this.getMeasurements(start, end);
  }

  async pullRange(start: Date, end: Date): Promise<WithingsRecord[]> {
    return this.getMeasurements(start, end);
  }
}
