import { getValidAccessToken } from "./auth";

const API_BASE = "https://api.prod.whoop.com/developer";

export type WhoopRecord = Record<string, unknown>;

export type WhoopPull = {
  recovery: WhoopRecord[];
  sleep: WhoopRecord[];
  cycles: WhoopRecord[];
  workouts: WhoopRecord[];
  period: { start: string; end: string };
};

async function authedGet(
  path: string,
  token: string,
  params: Record<string, string | undefined>
): Promise<Record<string, unknown>> {
  const url = new URL(API_BASE + path);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, v);
  }

  const resp = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`WHOOP GET ${path} failed: ${resp.status} ${text}`);
  }

  return (await resp.json()) as Record<string, unknown>;
}

async function getPaginated(
  path: string,
  token: string,
  start: Date,
  end: Date,
  limit = 25
): Promise<WhoopRecord[]> {
  const all: WhoopRecord[] = [];
  let nextToken: string | undefined;

  while (true) {
    const data = await authedGet(path, token, {
      limit: String(limit),
      start: start.toISOString(),
      end: end.toISOString(),
      nextToken,
    });
    const records = (data.records as WhoopRecord[] | undefined) ?? [];
    all.push(...records);
    nextToken = (data.next_token as string | undefined) || undefined;
    if (!nextToken) break;
  }
  return all;
}

export class WhoopClient {
  constructor(private readonly token: string) {}

  static async create(): Promise<WhoopClient> {
    return new WhoopClient(await getValidAccessToken());
  }

  getRecovery(start: Date, end: Date) {
    return getPaginated("/v2/recovery", this.token, start, end);
  }
  getSleep(start: Date, end: Date) {
    return getPaginated("/v2/activity/sleep", this.token, start, end);
  }
  getCycles(start: Date, end: Date) {
    return getPaginated("/v2/cycle", this.token, start, end);
  }
  getWorkouts(start: Date, end: Date) {
    return getPaginated("/v2/activity/workout", this.token, start, end);
  }

  async pullRange(start: Date, end: Date): Promise<WhoopPull> {
    const [recovery, sleep, cycles, workouts] = await Promise.all([
      this.getRecovery(start, end),
      this.getSleep(start, end),
      this.getCycles(start, end),
      this.getWorkouts(start, end),
    ]);
    return {
      recovery,
      sleep,
      cycles,
      workouts,
      period: { start: start.toISOString(), end: end.toISOString() },
    };
  }

  async pullLastNDays(days: number): Promise<WhoopPull> {
    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - days);
    return this.pullRange(start, end);
  }
}
