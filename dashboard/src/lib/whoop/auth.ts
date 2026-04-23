import { getTokens, setTokens } from "@/lib/tokens";

const TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";

export type WhoopTokens = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope?: string;
  token_type?: string;
  expires_at?: number;
};

export async function loadTokens(): Promise<WhoopTokens | null> {
  return (await getTokens<WhoopTokens>("whoop")) as WhoopTokens | null;
}

export async function saveTokens(tokens: WhoopTokens): Promise<void> {
  await setTokens("whoop", {
    ...tokens,
    expires_at: Date.now() + (tokens.expires_in ?? 3600) * 1000,
  });
}

export async function refreshAccessToken(refreshToken: string): Promise<WhoopTokens> {
  const clientId = process.env.WHOOP_CLIENT_ID;
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("WHOOP_CLIENT_ID / WHOOP_CLIENT_SECRET not set in env");
  }

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const resp = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`WHOOP token refresh failed: ${resp.status} ${text}`);
  }

  return (await resp.json()) as WhoopTokens;
}

/**
 * Always refreshes (matches whoop/auth.py behavior — safer than expiry math,
 * since WHOOP refresh tokens are long-lived and the OAuth spec allows reuse).
 */
export async function getValidAccessToken(): Promise<string> {
  const tokens = await loadTokens();
  if (!tokens) {
    throw new Error(
      "No WHOOP tokens in oauth_tokens table. Run `npm run seed:tokens` locally to seed from whoop/whoop_tokens.json."
    );
  }
  const fresh = await refreshAccessToken(tokens.refresh_token);
  await saveTokens(fresh);
  return fresh.access_token;
}
