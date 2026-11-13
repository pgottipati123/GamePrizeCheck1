# GamePriceCheck

A responsive web application that helps gamers and video game collectors search for and compare prices for physical video games, gaming consoles, and gaming accessories across multiple retailers and sellers.

## Purpose

GamePriceCheck does not sell products itself. It does not process payments, transactions, or shipping. Instead, users search for products, compare seller listings, and then follow a link to the seller's website to complete a purchase. The application provides a simple interface that can be used even by people who do not have extensive gaming knowledge.

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
├── api/              # Express/Node backend (see api/README.md, api/openapi.yaml)
├── db/               # Database schema and seed scripts (Specification 2)
│   ├── 01_schema.sql
│   ├── 02_seed.sql
│   └── README.md
├── tests/            # smoke.sh: cURL smoke tests for the API
├── docs/             # Project documentation
│   ├── PRD.md
│   ├── TASKS.md
│   └── WORKSPACE_RULES.md
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

Copy `api/.env.example` to `api/.env` and set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_API_KEY` (see [api/README.md](api/README.md)). `api/.env` is git-ignored. The client needs no variables.

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
2. `db/02_seed.sql` – inserts sample categories, makers, platforms, products, retailers, and listings

See [db/README.md](db/README.md) for the data model.

The API connects to Supabase with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `api/.env` (see `api/.env.example`). The service role key is server-side only and must never be committed or used in the client.

## Project Status

**Current Status**: Prototype 2 – database, React client and local Express API connected (`React client -> Express API -> Supabase`).

## Important Notes

- GamePriceCheck redirects users to external sellers and does not process transactions itself
- No user account or login is required for Version 1
- The application is designed to work on both desktop and mobile devices
- External seller data/API availability may affect implementation and is a future integration decision
