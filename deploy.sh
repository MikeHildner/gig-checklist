#!/usr/bin/env bash
#
# Deploy the static web export to DiscountASP.NET over FTP/FTPS.
#
# Usage:
#   ./deploy.sh              build a fresh web export, then upload
#   ./deploy.sh --no-build   upload the existing dist/ without rebuilding
#
# Credentials are read from deploy/.env (gitignored). Copy deploy/.env.example
# to deploy/.env and fill it in first.
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

ENV_FILE="$ROOT/deploy/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: $ENV_FILE not found." >&2
  echo "       Copy deploy/.env.example to deploy/.env and fill in your FTP details." >&2
  exit 1
fi
# Parse the env file manually (do NOT `source` it): values are read literally,
# so passwords with shell-special characters (\ " ) : $ etc.) work without quoting.
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in ''|'#'*) continue ;; esac      # skip blanks and comments
  case "$line" in *=*) ;; *) continue ;; esac     # require KEY=VALUE
  key=${line%%=*}
  val=${line#*=}
  key=${key//[[:space:]]/}                         # trim whitespace from key
  # Strip one matching pair of surrounding quotes, if present.
  case "$val" in
    \"*\") val=${val#\"}; val=${val%\"} ;;
    \'*\') val=${val#\'}; val=${val%\'} ;;
  esac
  case "$key" in
    FTP_HOST|FTP_USER|FTP_PASS|FTP_REMOTE_DIR|FTP_PORT|FTP_SECURE|FTP_TLS_INSECURE)
      printf -v "$key" '%s' "$val" ;;
  esac
done < "$ENV_FILE"

: "${FTP_HOST:?Set FTP_HOST in deploy/.env}"
: "${FTP_USER:?Set FTP_USER in deploy/.env}"
: "${FTP_PASS:?Set FTP_PASS in deploy/.env}"
FTP_REMOTE_DIR="${FTP_REMOTE_DIR:-/}"
FTP_PORT="${FTP_PORT:-21}"
FTP_SECURE="${FTP_SECURE:-true}"
FTP_TLS_INSECURE="${FTP_TLS_INSECURE:-false}"

# Make the locally-installed Node toolchain available.
export PATH="$HOME/.local/node/bin:$PATH"

# 1. Build the web export (unless --no-build).
if [ "${1:-}" != "--no-build" ]; then
  echo "==> Building web export (expo export)..."
  rm -rf dist
  npx expo export --platform web
fi

if [ ! -d dist ]; then
  echo "ERROR: dist/ does not exist. Run without --no-build to create it." >&2
  exit 1
fi

# Always ship the IIS config.
cp deploy/web.config dist/web.config

# Normalize the remote directory: ensure a single leading slash, no trailing slash.
REMOTE="${FTP_REMOTE_DIR%/}"
case "$REMOTE" in /*) ;; *) REMOTE="/$REMOTE";; esac

# Assemble curl options.
CURL_OPTS=(--silent --show-error --fail --ftp-create-dirs --user "$FTP_USER:$FTP_PASS")
[ "$FTP_SECURE" = "true" ] && CURL_OPTS+=(--ssl-reqd)
[ "$FTP_TLS_INSECURE" = "true" ] && CURL_OPTS+=(--insecure)

scheme_desc="FTP"; [ "$FTP_SECURE" = "true" ] && scheme_desc="FTPS"
echo "==> Uploading dist/ via $scheme_desc to $FTP_HOST:$FTP_PORT$REMOTE ..."

count=0
total=$(find dist -type f | wc -l | tr -d ' ')
cd dist
while IFS= read -r f; do
  rel="${f#./}"
  url="ftp://${FTP_HOST}:${FTP_PORT}${REMOTE}/${rel}"
  curl "${CURL_OPTS[@]}" -T "$f" "$url"
  count=$((count + 1))
  printf '  [%d/%s] %s\n' "$count" "$total" "$rel"
done < <(find . -type f)
cd "$ROOT"

echo "==> Done. Uploaded $count file(s)."
echo "    Open your site and hard-refresh (Cmd-Shift-R) to verify."
