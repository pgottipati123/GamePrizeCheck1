# GamePriceCheck API

Express 5 API for GamePriceCheck Prototype 3. It runs as its own Node process,
independent of the React client and the database. It reads and updates the
Supabase database (`db/`) and serves the React client:

```
React client (localhost:5173) -> Express API (localhost:3000) -> Supabase
```

The client never talks to Supabase. Only this API holds Supabase credentials,
and it uses the service role key on the server side only.

## Prerequisites

- Node.js 22 or newer (`node --version`)
- A Supabase project where `db/01_schema.sql` and then `db/02_seed.sql` have been run
  (see [../db/README.md](../db/README.md))
- `curl` and `bash` for the smoke tests

## Setup

```bash
cd api
npm install
cp .env.example .env
```

Then edit `api/.env` (it is git-ignored; never commit it):

| Variable                    | Required               | Description                                                                                                                      |
| --------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `SUPABASE_URL`              | yes                    | Project URL, from Supabase **Project Settings > API** (e.g. `https://<project-ref>.supabase.co`)                                 |
| `SUPABASE_SERVICE_ROLE_KEY` | yes                    | The **service_role** secret key from the same page. Server-side only.                                                            |
| `ADMIN_API_KEY`             | for the write endpoint | Any random string of 16+ characters, e.g. `openssl rand -hex 24`. Clients send it as `X-Admin-Key` to `PATCH /api/listings/:id`. |
| `PORT`                      | no                     | Defaults to `3000`                                                                                                               |
| `CORS_ORIGIN`               | no                     | Comma-separated allowed origins. Defaults to `http://localhost:5173`                                                             |
| `RATE_LIMIT_PER_MINUTE`     | no                     | Requests per minute per IP on `/api`. Defaults to `120`                                                                          |
| `NODE_ENV`                  | no                     | `development` (default), `test` or `production`. Production hides 500 error details.                                             |

## Run

```bash
npm run dev     # restarts on file changes
# or
npm start
```

The API listens on `http://localhost:3000`. Check it with:

```bash
curl http://localhost:3000/api/health
```

Then start the client (`cd client && npm run dev`) and open `http://localhost:5173`.
Vite forwards the client's `/api` requests to `http://localhost:3000`.

The API does not depend on the client: any HTTP tool (curl, Postman) can call it.
If the client is served from another origin, set the client's `VITE_API_BASE_URL`
to the API origin and add the client origin to `CORS_ORIGIN`.

## Endpoints

Full documentation, with parameters, schemas and examples: [openapi.yaml](openapi.yaml) (OpenAPI 3.0).

| Method | Path                         | Purpose (site map)                                                                                                                |
| ------ | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/health`                | Health check                                                                                                                      |
| GET    | `/api/categories`            | Categories for Search/Browse                                                                                                      |
| GET    | `/api/products`              | Search/Browse and Filter/Sort: `q`, `category`, `condition`, `retailer`, `maker`, `minPrice`, `maxPrice`, `year`, `sort`, `limit` |
| GET    | `/api/products/:id`          | Product page and Favorites: product, maker, category, platforms and active listings                                               |
| GET    | `/api/products/:id/listings` | Price comparison on the Product page: listings with `condition` filter and `sort`                                                 |
| GET    | `/api/filters`               | Filter options (makers, retailers, years), optionally per `category`                                                              |
| GET    | `/api/deals`                 | Home page top deals                                                                                                               |
| POST   | `/api/notifications`         | Price-change notification request: `product_id` plus exactly one of `email` or `phone` (no account)                               |
| PATCH  | `/api/listings/:id`          | Update a listing's `price`, `discount_amount`, `in_stock`, `condition` or `product_url` (requires `X-Admin-Key`)                  |

Examples:

```bash
curl "http://localhost:3000/api/products?q=zelda"
curl "http://localhost:3000/api/products?category=consoles&condition=new&sort=price_asc"
curl "http://localhost:3000/api/products/40000000-0000-4000-8000-000000000001/listings"

curl -X PATCH "http://localhost:3000/api/listings/70000000-0000-4000-8000-000000000002" \
  -H "Content-Type: application/json" -H "X-Admin-Key: $ADMIN_API_KEY" \
  -d '{"price": 52.99, "in_stock": true}'

curl -X POST "http://localhost:3000/api/notifications" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "40000000-0000-4000-8000-000000000001", "email": "fan@example.com"}'
```

Status codes: `200` for success; `201` when a new notification request is saved
(`200` if the identical request already exists); `400` for invalid input (the body lists each bad
field); `401` for a missing or wrong `X-Admin-Key`; `404` for unknown products,
listings or routes; `429` when rate-limited; `503` if `ADMIN_API_KEY` is not set
and a write is attempted. Errors look like `{ "error": { "message": "...", "details": [...] } }`.

## Deploy to AWS Lambda

The same Express app runs on AWS Lambda through `src/lambda.js` (serverless-http) and
`serverless.yml` (Serverless Framework v3, API Gateway HTTP API):

```bash
npx serverless@3 deploy --region us-east-1
```

Full steps, including AWS Academy Learner Lab notes and CORS for the Amplify site:
[../docs/DEPLOYMENT.md](../docs/DEPLOYMENT.md).

## Tests

```bash
npm test               # Vitest + Supertest, uses fixture data (no database needed)
npm run lint
npm run format:check
```

Smoke tests against the running API and your Supabase data, from the repo root:

```bash
set -a; source api/.env; set +a      # exports ADMIN_API_KEY for the write test
BASE_URL=http://localhost:3000 bash tests/smoke.sh
```

The script uses the fixed IDs from `db/02_seed.sql`, exits non-zero if any check
fails. Its PATCH test restores the listing to its seed values, and its POST test
reuses a single `smoke-test@example.com` notification row on repeat runs.

## Structure

```
src/
  server.js            loads .env and starts the server (local)
  lambda.js            AWS Lambda handler (serverless-http)
  app.js               middleware (helmet, CORS, rate limit, JSON) and routes
  config.js            environment validation (zod)
  routes/index.js      URL -> controller mapping
  controllers/         request validation and responses
  services/catalog.js  search, filter, sort and comparison logic
  services/catalogRepository.js  Supabase queries (service role)
  schemas.js           zod schemas for query, path and body input
  middleware/          admin key check, 404 and error handlers
  lib/                 Supabase client, HttpError, validation helper
test/                  Vitest + Supertest tests and fixture data
```
