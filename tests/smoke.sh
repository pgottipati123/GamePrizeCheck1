#!/usr/bin/env bash
# Smoke tests for the GamePriceCheck API (Prototype 2, Step 3).
#
# Usage:
#   BASE_URL=http://localhost:3000 ADMIN_API_KEY=... bash tests/smoke.sh
#
# Environment:
#   BASE_URL       API origin (default: http://localhost:3000)
#   ADMIN_API_KEY  Must match the API's ADMIN_API_KEY; required for the write test.
#
# Uses the fixed seed IDs from db/02_seed.sql. The write test sets listing
# 70000000-...-000000000002 back to its seed values (52.99, used, in stock),
# so running it repeatedly leaves the database unchanged.
# Exits non-zero if any check fails.

set -uo pipefail

BASE_URL="${BASE_URL:-http://localhost:3000}"
BASE_URL="${BASE_URL%/}"
API="$BASE_URL/api"

PRODUCT_ID="40000000-0000-4000-8000-000000000001" # The Legend of Zelda: Tears of the Kingdom
LISTING_ID="70000000-0000-4000-8000-000000000002" # GameStop listing for that product
MISSING_ID="00000000-0000-4000-8000-000000000000"

PASS=0
FAIL=0
BODY_FILE="$(mktemp)"
trap 'rm -f "$BODY_FILE"' EXIT

# check NAME EXPECTED_STATUS EXPECTED_SUBSTRING curl-args...
check() {
  local name="$1" expected_status="$2" expected_text="$3"
  shift 3
  local status
  status="$(curl -sS -o "$BODY_FILE" -w '%{http_code}' --max-time 15 "$@")" || status="000"
  if [[ "$status" == "$expected_status" ]] && grep -qF -- "$expected_text" "$BODY_FILE"; then
    PASS=$((PASS + 1))
    printf 'PASS  %-55s %s\n' "$name" "$status"
  else
    FAIL=$((FAIL + 1))
    printf 'FAIL  %-55s got %s, expected %s containing %s\n' "$name" "$status" "$expected_status" "$expected_text"
    head -c 300 "$BODY_FILE"
    echo
  fi
}

echo "GamePriceCheck API smoke tests against $BASE_URL"

# Reads
check "GET /api/health" 200 '"status":"ok"' "$API/health"
check "GET /api/categories" 200 '"name":"Games"' "$API/categories"
check "GET /api/products?q=zelda (search)" 200 'Tears of the Kingdom' "$API/products?q=zelda"
check "GET /api/products?category=consoles&sort=price_asc" 200 '"slug":"consoles"' \
  "$API/products?category=consoles&sort=price_asc"
check "GET /api/products/:id (detail)" 200 "\"product_id\":\"$PRODUCT_ID\"" "$API/products/$PRODUCT_ID"
check "GET /api/products/:id/listings (compare)" 200 '"retailer"' \
  "$API/products/$PRODUCT_ID/listings?sort=price_asc"
check "GET /api/filters?category=games" 200 '"retailers"' "$API/filters?category=games"
check "GET /api/deals?limit=3" 200 '"maxDiscount"' "$API/deals?limit=3"

# Read validation errors
check "GET /api/products?minPrice=60&maxPrice=20 -> 400" 400 'maxPrice' \
  "$API/products?minPrice=60&maxPrice=20"
check "GET /api/products/not-a-uuid -> 400" 400 'valid UUID' "$API/products/not-a-uuid"
check "GET /api/products/:unknown -> 404" 404 'not found' "$API/products/$MISSING_ID"

# Write
if [[ -z "${ADMIN_API_KEY:-}" ]]; then
  FAIL=$((FAIL + 1))
  echo "FAIL  PATCH /api/listings/:id: ADMIN_API_KEY is not set in the environment"
else
  check "PATCH /api/listings/:id (update price/stock)" 200 '"price":52.99' \
    -X PATCH "$API/listings/$LISTING_ID" \
    -H 'Content-Type: application/json' -H "X-Admin-Key: $ADMIN_API_KEY" \
    -d '{"price":52.99,"discount_amount":0,"condition":"used","in_stock":true}'
  check "PATCH /api/listings/:id invalid body -> 400" 400 'price' \
    -X PATCH "$API/listings/$LISTING_ID" \
    -H 'Content-Type: application/json' -H "X-Admin-Key: $ADMIN_API_KEY" \
    -d '{"price":-5}'
  check "PATCH /api/listings/:unknown -> 404" 404 'not found' \
    -X PATCH "$API/listings/$MISSING_ID" \
    -H 'Content-Type: application/json' -H "X-Admin-Key: $ADMIN_API_KEY" \
    -d '{"in_stock":true}'
fi
check "PATCH /api/listings/:id without key -> 401" 401 'X-Admin-Key' \
  -X PATCH "$API/listings/$LISTING_ID" -H 'Content-Type: application/json' -d '{"in_stock":true}'

echo "Passed: $PASS  Failed: $FAIL"
[[ "$FAIL" -eq 0 ]]
