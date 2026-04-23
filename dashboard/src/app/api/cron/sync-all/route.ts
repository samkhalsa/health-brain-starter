import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { syncRuns } from "@/lib/db/schema";
import { WhoopClient } from "@/lib/whoop/client";
import { upsertWhoop } from "@/lib/whoop/sync";
import { WithingsClient } from "@/lib/withings/client";
import { upsertWithings } from "@/lib/withings/sync";
import { alertTelegram } from "@/lib/telegram";
import { retryWithBackoff } from "@/lib/retry";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  const header = req.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

async function runWhoop(): Promise<{ ok: boolean; records: number; error: string | null }> {
  const startedAt = new Date();
  try {
    const client = await WhoopClient.create();
    const pull = await retryWithBackoff(() => client.pullLastNDays(3));
    const records = await upsertWhoop(pull);
    await db.insert(syncRuns).values({
      kind: "whoop", startedAt, endedAt: new Date(), recordsUpserted: records, error: null,
    });
    return { ok: true, records, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    await db.insert(syncRuns).values({
      kind: "whoop", startedAt, endedAt: new Date(), recordsUpserted: 0, error,
    });
    await alertTelegram(`🔴 *WHOOP pull failed*\n\`${error}\``);
    return { ok: false, records: 0, error };
  }
}

async function runWithings(): Promise<{ ok: boolean; records: number; error: string | null }> {
  const startedAt = new Date();
  try {
    const client = await WithingsClient.create();
    const records = await retryWithBackoff(() => client.pullLastNDays(3));
    const upserted = await upsertWithings(records);
    await db.insert(syncRuns).values({
      kind: "withings", startedAt, endedAt: new Date(), recordsUpserted: upserted, error: null,
    });
    return { ok: true, records: upserted, error: null };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    await db.insert(syncRuns).values({
      kind: "withings", startedAt, endedAt: new Date(), recordsUpserted: 0, error,
    });
    await alertTelegram(`🔴 *Withings pull failed*\n\`${error}\``);
    return { ok: false, records: 0, error };
  }
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const [whoop, withings] = await Promise.all([runWhoop(), runWithings()]);
  const anyFailure = !whoop.ok || !withings.ok;
  return NextResponse.json(
    { whoop, withings },
    { status: anyFailure ? 500 : 200 }
  );
}
