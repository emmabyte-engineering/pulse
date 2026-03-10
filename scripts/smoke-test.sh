#!/usr/bin/env bash
#
# Post-deploy smoke tests
# Usage: ./scripts/smoke-test.sh [base-url]
#   Defaults to http://localhost:3000
#
# Exits 0 if all checks pass, 1 if any fail.
#
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
FAILED=0

check() {
  local name="$1"
  local url="$2"
  local expected_status="${3:-200}"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$url" 2>/dev/null || echo "000")

  if [ "$STATUS" = "$expected_status" ]; then
    echo "  PASS  ${name} (${STATUS})"
  else
    echo "  FAIL  ${name} — expected ${expected_status}, got ${STATUS}"
    FAILED=1
  fi
}

check_contains() {
  local name="$1"
  local url="$2"
  local needle="$3"

  BODY=$(curl -s --max-time 10 "$url" 2>/dev/null || echo "")

  if echo "$BODY" | grep -qi "$needle"; then
    echo "  PASS  ${name}"
  else
    echo "  FAIL  ${name} — response missing '${needle}'"
    FAILED=1
  fi
}

echo "==> Smoke tests against ${BASE_URL}"
echo ""

# Core endpoints
check "Health endpoint" "${BASE_URL}/api/health"
check_contains "Health response" "${BASE_URL}/api/health" '"status":"ok"'

# Landing page
check "Landing page" "${BASE_URL}/"
check_contains "Landing page content" "${BASE_URL}/" "Pulse"

# Login page
check "Login page" "${BASE_URL}/login"

# Admin guard (should redirect to login)
check "Admin redirect" "${BASE_URL}/admin" "302"

# Ingest endpoint (POST-only, should require auth)
STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 -X POST "${BASE_URL}/api/ingest" 2>/dev/null || echo "000")
if [ "$STATUS" = "401" ] || [ "$STATUS" = "403" ]; then
  echo "  PASS  Ingest auth guard (${STATUS})"
else
  echo "  FAIL  Ingest auth guard — expected 401/403, got ${STATUS}"
  FAILED=1
fi

# Invalid invite token
check "Invalid invite" "${BASE_URL}/signup/invalid-token" "404"

echo ""
if [ "$FAILED" -eq 0 ]; then
  echo "==> All smoke tests passed"
  exit 0
else
  echo "==> SMOKE TESTS FAILED"
  exit 1
fi
