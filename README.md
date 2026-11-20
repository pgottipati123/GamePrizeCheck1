# GamePriceCheck

A responsive web application that helps gamers and video game collectors search for and compare prices for physical video games, gaming consoles, and gaming accessories across multiple retailers and sellers.

## Purpose

GamePriceCheck does not sell products itself. It does not process payments, transactions, or shipping. Instead, users search for products, compare seller listings, and then follow a link to the seller's website to complete a purchase. The application provides a simple interface that can be used even by people who do not have extensive gaming knowledge.

## System Functionality (Prototype 3)

Built from the Level 3 Specification. Main navigation: **Home · Search / Browse · Filter / Sort · Favorites / Watchlist · About / Help**.

| Screen | What it does | Data |
| --- | --- | --- |
| Home | Search box with category selector, category cards, top deals | Live from Supabase via the API |
| Search / Browse | Search games, consoles and accessories; browse by category | Live |
| Filter / Sort | Filter by condition, price range, retailer, developer/maker and release year; sort by relevance, price, discount or newest | Live |
| Product page | Image, name, maker, platform, category, year, description; **price comparison** of every retailer listing (price, discount, condition, availability, retailer) with condition tabs and sorting; Save to Favorites; optional price-change alerts | Live |
| Go to retailer | Confirmation dialog ("You are leaving GamePriceCheck") before opening the retailer's page in a new tab | Listing `product_url` |
| Favorites / Watchlist | Saved products with live best price and stock; select one to return to its Product page; remove; optional price-change alerts | Saved IDs in the browser; product data live |
| Price-change alerts | Email **or** phone number, no account; validated in the browser and by the API, stored in `price_notification` | `POST /api/notifications` |
| About / Help | How it works, aggregator info, condition guide | Static |

Architecture: `React client (AWS Amplify) -> Express API (AWS Lambda + API Gateway, Serverless Framework) -> Supabase`. The client never talks to Supabase directly; only the API holds the service role key.

## Live Deployed Application

- **App (AWS Amplify):** _add the Amplify URL here after deployment_
- **API (AWS Lambda):** _add the API Gateway URL here after deployment_ (health check: `<API URL>/api/health`)

Deployment steps: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Version 1 Scope

The first version focuses on core search and comparison functionality without requiring user accounts or login. Accepted user stories include:

- **US-01** – Search for Games
- **US-02** – Search for Consoles
- **US-03** – Search for Accessories
- **US-08** – View Product Prices
- **US-09** – Compare Sellers
- **US-13** – Check Product Availability
- **US-16** – Filter by Condition
- **US-18** – Filter by Price
- **US-23** – View Product Details
- **US-29** – Go to Seller Website

## Core Features

- Search for physical games, consoles, and accessories
- View prices from multiple sellers
- Compare seller listings side-by-side
- Check product availability
- Filter results by condition (new, used, refurbished)
- Filter results by price range
- View detailed product information
- Compare every retailer listing directly on each Product page
- Confirmation before redirecting to an external seller website
- Favorites / Watchlist (saved in the browser, no account) with optional price-change notifications by email or phone
- Navigate to external seller websites to complete purchases

## Technical Stack

- **Frontend**: React with Vite
- **Backend/API**: Node.js with Express
- **Database**: Supabase/PostgreSQL
- **Version Control**: Git/GitHub
- **Documentation**: Markdown

## Repository Structure

```
GamePriceCheck/
├── client/           # React/Vite frontend
├── api/              # Express API (api/README.md, api/openapi.yaml, serverless.yml for AWS Lambda)
├── db/               # Database schema and seed scripts
│   ├── 01_schema.sql
│   ├── 02_seed.sql
│   └── README.md
├── tests/            # smoke.sh: cURL smoke tests for the API
├── docs/             # Project documentation
│   ├── PRD.md
│   ├── TASKS.md
│   ├── DEPLOYMENT.md   # AWS Lambda (Serverless) + AWS Amplify steps
│   └── WORKSPACE_RULES.md
├── amplify.yml       # AWS Amplify build settings (app root: client/)
├── README.md
└── .gitignore
```

## Local Development Setup

### Prerequisites

- Node.js 22 or higher
- npm or yarn
- Git
- Supabase account (for database)

### Environment Variables

Copy `api/.env.example` to `api/.env` and set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_API_KEY` (see [api/README.md](api/README.md)). `api/.env` is git-ignored. Locally the client needs no variables (Vite forwards `/api` to `http://localhost:3000`); for a deployed build, set `VITE_API_BASE_URL` to the API URL.

### Running the Client

```bash
cd client
npm install
npm run dev
```

The client starts at `http://localhost:5173`. It gets all data from the Express API with `fetch` (Vite forwards `/api` to `http://localhost:3000`), so start the API first. The client never talks to Supabase directly.

Other client scripts: `npm test`, `npm run lint`, `npm run format:check`, `npm run build`.

### Running the API

```bash
cd api
npm install
npm run dev
```

The API starts at `http://localhost:3000`. Endpoints are documented in [api/openapi.yaml](api/openapi.yaml). With the API running, `BASE_URL=http://localhost:3000 ADMIN_API_KEY=... bash tests/smoke.sh` runs the smoke tests.

### Database Setup

The database scripts are in the `db/` directory. In your Supabase project's SQL Editor, run them in this order:

1. `db/01_schema.sql` – creates the tables, constraints, and Row Level Security policies
2. `db/02_seed.sql` – inserts sample categories, makers, platforms, products (with images), retailers, listings, and notification requests

See [db/README.md](db/README.md) for the data model.

The API connects to Supabase with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `api/.env` (see `api/.env.example`). The service role key is server-side only and must never be committed or used in the client.

## Project Status

**Current Status**: Prototype 3 (Level 3 Specification) – price comparison on the Product page, Favorites / Watchlist, price-change notification requests, and a redirect confirmation, on the same `React client -> Express API -> Supabase` architecture.

## Demo / Testing Instructions

Use the deployed URL (or `http://localhost:5173` locally). The seed data in `db/02_seed.sql` provides these test records:

1. **Search:** type `zelda` and press Search → *The Legend of Zelda: Tears of the Kingdom*. Try `PlayStation 5` and `controller` too.
2. **Browse:** on Search / Browse, click **Consoles** or **Accessories**.
3. **Filter / Sort:** open Filter / Sort, tick **New**, set Max price `100`, Apply, then sort by *Price: low to high*. Entering Min `60` and Max `20` shows a validation error.
4. **Product page + price comparison:** open Zelda → two retailer listings (GameStop used $52.99, Best Buy new $69.99). Use the condition tabs and *Sort offers*.
5. **Redirect confirmation:** click **Go to GameStop** → confirmation dialog → *Continue to GameStop* opens the retailer in a new tab; *Stay on GamePriceCheck* closes it.
6. **Favorites / Watchlist:** click **Save to Favorites**, then open the Favorites / Watchlist tab → the product is listed with its best price; click it to return to the Product page; **Remove** deletes it.
7. **Price-change alerts:** on a product, click **Price-change alerts**, choose Email or Phone, and submit (try an invalid value first to see validation). The request is saved in the `price_notification` table (visible in the Supabase Table Editor).
8. **Not found:** open `/does-not-exist`.

Automated checks:

```bash
cd api && npm test && npm run lint          # API unit/integration tests
cd client && npm test && npm run lint && npm run build
BASE_URL=<API URL> ADMIN_API_KEY=<admin key> bash tests/smoke.sh   # 18 cURL checks against a running API
```

## Known Issues and Incomplete Areas

- **Notifications are only collected, not sent.** Email/SMS delivery would need a paid provider (e.g. Amazon SES/SNS) and price-change detection; neither is implemented.
- **Favorites are stored per browser** (localStorage) because there are no accounts; they do not sync across devices and are lost if browser data is cleared.
- **Sample data only.** Prices and stock come from the seed data, not live retailer feeds; "Go to retailer" links open each retailer's search page for the product.
- **Product images are hot-linked** from Wikipedia/Wikimedia; if those URLs change, the product falls back to a placeholder illustration.
- One seeded product (Xbox Wireless Controller) has no active listing, so it does not appear in search results (its Product page still opens).
- **AWS Academy Learner Lab:** credentials expire with each lab session, so redeploying requires refreshing them (see docs/DEPLOYMENT.md).
- The API rate limit is kept in memory per Lambda instance, so it is approximate.

## Important Notes

- GamePriceCheck redirects users to external sellers and does not process transactions itself
- No user account or login is required; favorites are stored in the browser and notification requests only need an email or phone number
- The application is designed to work on both desktop and mobile devices
- External seller data/API availability may affect implementation and is a future integration decision
