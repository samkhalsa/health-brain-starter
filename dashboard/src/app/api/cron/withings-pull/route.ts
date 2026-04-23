import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { syncRuns } from "@/lib/db/schema";
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

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  let recordsUpserted = 0;
  let errorMsg: string | null = null;

  try {
    const client = await WithingsClient.create();
    // 3-day window catches the same day's weigh-in even if the cron fires pre-weigh
    const records = await retryWithBackoff(() => client.pullLastNDays(3));
    recordsUpserted = await upsertWithings(records);
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[cron/withings-pull] failed", err);
    await alertTelegram(`🔴 *Withings pull failed*\n\`${errorMsg}\``);
  }

  const endedAt = new Date();
  await db.insert(syncRuns).values({
    kind: "withings",
    startedAt,
    endedAt,
    recordsUpserted,
    error: errorMsg,
  });

  if (errorMsg) {
    return NextResponse.json(
      { ok: false, error: errorMsg, recordsUpserted },
      { status: 500 }
    );
  }
  return NextResponse.json({
    ok: true,
    recordsUpserted,
    durationMs: endedAt.getTime() - startedAt.getTime(),
  });
}
