/**
 * OAuth token store — backed by Postgres `oauth_tokens` table.
 * Replaces the earlier KV/Upstash implementation.
 */
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { oauthTokens } from "@/lib/db/schema";

export type TokenKind = "whoop" | "withings";

export type StoredTokens<T = unknown> = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  expires_in?: number;
  scope?: string;
  [k: string]: unknown;
} & Partial<T>;

function sqlExcluded(col: string) {
  return sql.raw(`excluded."${col}"`);
}

export async function getTokens<T>(
  kind: TokenKind
): Promise<StoredTokens<T> | null> {
  const rows = await db
    .select()
    .from(oauthTokens)
    .where(sql`${oauthTokens.kind} = ${kind}`)
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  const raw = (row.raw as Record<string, unknown>) ?? {};
  return {
    ...raw,
    access_token: row.accessToken,
    refresh_token: row.refreshToken,
    expires_at: row.expiresAt ? row.expiresAt.getTime() : undefined,
    scope: row.scope ?? undefined,
  } as StoredTokens<T>;
}

export async function setTokens<T>(
  kind: TokenKind,
  tokens: StoredTokens<T>
): Promise<void> {
  const expiresAt =
    tokens.expires_at !== undefined
      ? new Date(tokens.expires_at)
      : tokens.expires_in !== undefined
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null;

  await db
    .insert(oauthTokens)
    .values({
      kind,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt,
      scope: tokens.scope ?? null,
      raw: tokens,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: oauthTokens.kind,
      set: {
        accessToken: sqlExcluded("access_token"),
        refreshToken: sqlExcluded("refresh_token"),
        expiresAt: sqlExcluded("expires_at"),
        scope: sqlExcluded("scope"),
        raw: sqlExcluded("raw"),
        updatedAt: sqlExcluded("updated_at"),
      },
    });
}
