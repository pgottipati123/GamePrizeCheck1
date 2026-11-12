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
├── api/              # Express/Node backend
├── supabase/         # Database migrations, schema, and seed data
│   ├── migrations/
│   └── seed-data/
├── docs/             # Project documentation
│   ├── PRD.md
│   ├── TASKS.md
│   └── WORKSPACE_RULES.md
├── README.md
└── .gitignore
```

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Git
- Supabase account (for database)

### Environment Variables

Create `.env` files in both the `client` and `api` directories. See `.env.example` files for required variables.

### Running the Client

```bash
cd client
npm install
npm run dev
```

The client will typically start at `http://localhost:5173`.

### Running the API

```bash
cd api
npm install
npm run dev
```

The API will typically start at `http://localhost:3000`.

### Database Setup

Database migrations and seed data are located in the `supabase/` directory. Follow Supabase documentation to apply migrations and set up your local development database.

## Project Status

**Current Status**: Scaffolding / Initial Development

The project is currently in the scaffolding phase. The foundation has been created for iterative development of Version 1 features.

## Important Notes

- GamePriceCheck redirects users to external sellers and does not process transactions itself
- No user account or login is required for Version 1
- The application is designed to work on both desktop and mobile devices
- External seller data/API availability may affect implementation and is a future integration decision
