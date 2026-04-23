"""
Withings OAuth 2.0 Authentication.

Run this script once to authenticate:
    python3 auth.py

Opens the browser, you approve, and tokens are saved locally.
After that, pull_data.py uses refresh tokens automatically.

Withings quirk: the token endpoint is action-based, not a standard OAuth2 endpoint.
POST to /v2/oauth2 with action=requesttoken or action=refreshtoken.
Response is wrapped as {status, body: {access_token, refresh_token, ...}}.
"""

import json
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlencode, urlparse, parse_qs
import requests

from config import (
    CLIENT_ID, CLIENT_SECRET, REDIRECT_URI,
    SCOPES, AUTH_URL, TOKEN_URL, TOKEN_FILE,
)


class CallbackHandler(BaseHTTPRequestHandler):
    """Handles the OAuth callback from Withings."""

    auth_code = None

    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)
        if "code" in query:
            CallbackHandler.auth_code = query["code"][0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(
                b"<html><body><h2>Withings authenticated successfully!</h2>"
                b"<p>You can close this tab and return to the terminal.</p>"
                b"</body></html>"
            )
        else:
            error = query.get("error", ["unknown"])[0]
            self.send_response(400)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(f"<html><body><h2>Error: {error}</h2></body></html>".encode())

    def log_message(self, format, *args):
        pass


def get_authorization_code():
    """Open browser for Withings login and capture the auth code."""
    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": ",".join(SCOPES),
        "state": "healthbrain",
    }

    auth_url = f"{AUTH_URL}?{urlencode(params)}"

    parsed = urlparse(REDIRECT_URI)
    port = parsed.port or 8080

    server = HTTPServer(("localhost", port), CallbackHandler)

    print("\nOpening browser for Withings authentication...")
    print(f"If the browser doesn't open, go to:\n{auth_url}\n")
    webbrowser.open(auth_url)

    print("Waiting for authentication callback...")
    server.handle_request()
    server.server_close()

    if CallbackHandler.auth_code is None:
        raise RuntimeError("Failed to receive authorization code")

    return CallbackHandler.auth_code


def _post_token(data):
    """POST to Withings token endpoint and unwrap {status, body} response."""
    resp = requests.post(TOKEN_URL, data=data)
    resp.raise_for_status()
    payload = resp.json()
    if payload.get("status") != 0:
        raise RuntimeError(f"Withings token error: {payload}")
    return payload["body"]


def exchange_code_for_tokens(code):
    """Exchange authorization code for access + refresh tokens."""
    return _post_token({
        "action": "requesttoken",
        "grant_type": "authorization_code",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": code,
        "redirect_uri": REDIRECT_URI,
    })


def refresh_access_token(refresh_token):
    """Use refresh token to get a new access token."""
    return _post_token({
        "action": "requesttoken",
        "grant_type": "refresh_token",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "refresh_token": refresh_token,
    })


def save_tokens(tokens):
    with open(TOKEN_FILE, "w") as f:
        json.dump(tokens, f, indent=2)
    print(f"Tokens saved to {TOKEN_FILE}")


def load_tokens():
    try:
        with open(TOKEN_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return None


def get_valid_token():
    """Get a valid access token, refreshing if needed."""
    tokens = load_tokens()
    if tokens is None:
        raise RuntimeError(
            "No tokens found. Run 'python3 auth.py' first to authenticate."
        )

    try:
        new_tokens = refresh_access_token(tokens["refresh_token"])
        save_tokens(new_tokens)
        return new_tokens["access_token"]
    except (requests.HTTPError, RuntimeError) as e:
        raise RuntimeError(
            f"Token refresh failed ({e}). Run 'python3 auth.py' to re-authenticate."
        )


def main():
    if not CLIENT_ID or not CLIENT_SECRET:
        print("ERROR: WITHINGS_CLIENT_ID and WITHINGS_CLIENT_SECRET not set.")
        print("Copy .env.example to .env and paste your credentials, or export:")
        print("  export WITHINGS_CLIENT_ID=...")
        print("  export WITHINGS_CLIENT_SECRET=...")
        return

    code = get_authorization_code()
    print("Authorization code received.")

    tokens = exchange_code_for_tokens(code)
    save_tokens(tokens)

    print("\nAuthentication complete!")
    print(f"Access token expires in {tokens.get('expires_in', '?')} seconds.")
    print("Refresh token saved for automatic renewal.")
    print("\nYou can now run: python3 pull_data.py")


if __name__ == "__main__":
    main()
