import { getTokens, setTokens } from "@/lib/tokens";

const TOKEN_URL = "https://wbsapi.withings.net/v2/oauth2";

export type WithingsTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
  userid?: number | string;
  expires_at?: number;
};

export async function loadTokens(): Promise<WithingsTokens | null> {
  return (await getTokens<WithingsTokens>("withings")) as WithingsTokens | null;
}

export async function saveTokens(tokens: WithingsTokens): Promise<void> {
  await setTokens("withings", {
    ...tokens,
    expires_at: Date.now() + (tokens.expires_in ?? 10800) * 1000,
  });
}

async function postToken(data: Record<string, string>): Promise<WithingsTokens> {
  const body = new URLSearchParams(data);
  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Withings token endpoint HTTP ${resp.status}: ${text}`);
  }
  const payload = (await resp.json()) as { status: number; body?: WithingsTokens; error?: string };
  if (payload.status !== 0 || !payload.body) {
    throw new Error(`Withings token error: ${JSON.stringify(payload)}`);
  }
  return payload.body;
}

export async function refreshAccessToken(refreshToken: string): Promise<WithingsTokens> {
  const clientId = process.env.WITHINGS_CLIENT_ID;
  const clientSecret = process.env.WITHINGS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("WITHINGS_CLIENT_ID / WITHINGS_CLIENT_SECRET not set in env");
  }
  return postToken({
    action: "requesttoken",
    grant_type: "refresh_token",
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
  });
}

/**
 * Withings BURNS the old refresh token on every refresh. If we fail to persist
 * the new one, we lock ourselves out. So: refresh → persist FIRST → only then
 * return the access_token.
 */
export async function getValidAccessToken(): Promise<string> {
  const tokens = await loadTokens();
  if (!tokens) {
    throw new Error(
      "No Withings tokens in oauth_tokens table. Run `npm run seed:tokens` locally to seed from withings/withings_tokens.json."
    );
  }
  const fresh = await refreshAccessToken(tokens.refresh_token);
  await saveTokens(fresh);
  return fresh.access_token;
}
