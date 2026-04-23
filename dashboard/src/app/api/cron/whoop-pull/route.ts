import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { syncRuns } from "@/lib/db/schema";
import { WhoopClient } from "@/lib/whoop/client";
import { upsertWhoop } from "@/lib/whoop/sync";
import { alertTelegram } from "@/lib/telegram";
import { retryWithBackoff } from "@/lib/retry";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // local dev
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
    const client = await WhoopClient.create();
    // 3-day overlap catches late-scored records from WHOOP
    const pull = await retryWithBackoff(() => client.pullLastNDays(3));
    recordsUpserted = await upsertWhoop(pull);
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[cron/whoop-pull] failed", err);
    await alertTelegram(`🔴 *WHOOP pull failed*\n\`${errorMsg}\``);
  }

  const endedAt = new Date();
  await db.insert(syncRuns).values({
    kind: "whoop",
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
