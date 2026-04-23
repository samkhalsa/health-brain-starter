"""
WHOOP OAuth 2.0 Authentication.

Run this script once to authenticate with WHOOP:
    python3 auth.py

It will open your browser, you log in, and it saves tokens locally.
After that, the main script uses refresh tokens automatically.
"""

import json
import secrets
import string
import webbrowser
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlencode, urlparse, parse_qs
import requests

from config import (
    CLIENT_ID, CLIENT_SECRET, REDIRECT_URI,
    SCOPES, AUTH_URL, TOKEN_URL, TOKEN_FILE,
)


class CallbackHandler(BaseHTTPRequestHandler):
    """Handles the OAuth callback from WHOOP."""

    auth_code = None

    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)
        if "code" in query:
            CallbackHandler.auth_code = query["code"][0]
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(
                b"<html><body><h2>WHOOP authenticated successfully!</h2>"
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
        pass  # Suppress request logs


def generate_state():
    """Generate an 8-character state string (WHOOP requirement)."""
    chars = string.ascii_letters + string.digits
    return "".join(secrets.choice(chars) for _ in range(8))


def get_authorization_code():
    """Open browser for WHOOP login and capture the auth code."""
    state = generate_state()

    params = {
        "response_type": "code",
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": " ".join(SCOPES),
        "state": state,
    }

    auth_url = f"{AUTH_URL}?{urlencode(params)}"

    parsed = urlparse(REDIRECT_URI)
    port = parsed.port or 8080

    server = HTTPServer(("localhost", port), CallbackHandler)

    print(f"\nOpening browser for WHOOP authentication...")
    print(f"If the browser doesn't open, go to:\n{auth_url}\n")
    webbrowser.open(auth_url)

    print("Waiting for authentication callback...")
    server.handle_request()
    server.server_close()

    if CallbackHandler.auth_code is None:
        raise RuntimeError("Failed to receive authorization code")

    return CallbackHandler.auth_code


def exchange_code_for_tokens(code):
    """Exchange authorization code for access + refresh tokens."""
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "redirect_uri": REDIRECT_URI,
    }

    resp = requests.post(TOKEN_URL, data=data)
    resp.raise_for_status()
    return resp.json()


def save_tokens(tokens):
    """Save tokens to local file."""
    with open(TOKEN_FILE, "w") as f:
        json.dump(tokens, f, indent=2)
    print(f"Tokens saved to {TOKEN_FILE}")


def load_tokens():
    """Load tokens from local file."""
    try:
        with open(TOKEN_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        return None


def refresh_access_token(refresh_token):
    """Use refresh token to get a new access token."""
    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }

    resp = requests.post(TOKEN_URL, data=data)
    resp.raise_for_status()
    return resp.json()


def get_valid_token():
    """Get a valid access token, refreshing if needed."""
    tokens = load_tokens()
    if tokens is None:
        raise RuntimeError(
            "No tokens found. Run 'python3 auth.py' first to authenticate."
        )

    # Always refresh to ensure we have a valid token
    try:
        new_tokens = refresh_access_token(tokens["refresh_token"])
        save_tokens(new_tokens)
        return new_tokens["access_token"]
    except requests.HTTPError:
        raise RuntimeError(
            "Token refresh failed. Run 'python3 auth.py' to re-authenticate."
        )


def main():
    if not CLIENT_ID or not CLIENT_SECRET:
        print("ERROR: WHOOP_CLIENT_ID and WHOOP_CLIENT_SECRET not set.")
        print("Copy .env.example to .env and paste your credentials, or export:")
        print("  export WHOOP_CLIENT_ID=...")
        print("  export WHOOP_CLIENT_SECRET=...")
        return

    code = get_authorization_code()
    print(f"Authorization code received.")

    tokens = exchange_code_for_tokens(code)
    save_tokens(tokens)

    print(f"\nAuthentication complete!")
    print(f"Access token expires in {tokens.get('expires_in', '?')} seconds.")
    print(f"Refresh token saved for automatic renewal.")
    print(f"\nYou can now run: python3 pull_data.py")


if __name__ == "__main__":
    main()
