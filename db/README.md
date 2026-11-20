# Database (Level 3 Specification)

GamePriceCheck uses PostgreSQL on Supabase. The schema follows the Analyst's data model (Specification 2 tables, plus `price_notification` added for the Level 3 Specification); table and field names match it exactly.

## Setup

In the Supabase SQL Editor, run the scripts in this order on a clean project:

1. `01_schema.sql` – tables, keys, constraints, indexes, trigger, and Row Level Security
2. `02_seed.sql` – sample data (3–5 rows per table) with fixed UUIDs so every foreign key is valid

Both scripts can be re-run safely: existing tables and seed rows are skipped (re-running `02_seed.sql` only refreshes `product.image_url`).

**Upgrading a Prototype 2 database:** re-run `01_schema.sql` and then `02_seed.sql`. This adds the `price_notification` table and its 3 sample rows and fills in product images; existing data is not changed.

## Entities

| Table | Fields | Notes |
| --- | --- | --- |
| `category` | category_id, name, description, display_order | Games, Consoles, Accessories. `name` and `display_order` are unique. |
| `maker` | maker_id, name, website_url, description | Developer or manufacturer of a product. |
| `platform` | platform_id, name, manufacturer, release_year | Hardware a product runs on or works with. |
| `product` | product_id, category_id → category, maker_id → maker, name, image_url, release_year, description | One physical game, console, or accessory. |
| `product_platform` | product_platform_id, product_id → product, platform_id → platform | Many-to-many link; each pair is unique. |
| `retailer` | retailer_id, name, website_url, active | Store that sells products. Deactivate with `active = false` instead of deleting. |
| `listing` | listing_id, product_id → product, retailer_id → retailer, price, condition, in_stock, discount_amount, product_url, last_updated | One retailer's offer for one product. |
| `price_notification` | notification_id, product_id → product, email, phone, created_at | Optional price-change notification request. Exactly one of `email` or `phone`; no user profile. |

## Relationships

- A category has many products; a maker has many products.
- A product runs on many platforms, and a platform has many products (through `product_platform`).
- A product has many listings; a retailer has many listings.
- A product has many price notification requests. Each (product, email) and (product, phone) pair is unique; email matching is case-insensitive.
- Deleting a product deletes its `product_platform` rows and listings. Deleting a category, maker, platform, or retailer that is still referenced is blocked.

## Field rules

- IDs are `uuid` with `gen_random_uuid()` defaults. Strings are `text`; money is `numeric(10,2)`; `last_updated` is `timestamptz`.
- `listing.condition` is one of `new`, `used`, `refurbished`.
- `listing.price` is the current selling price. `listing.discount_amount` is the dollar amount off the regular price (0 when not on sale), so the regular price is `price + discount_amount`. Both must be ≥ 0.
- `listing.last_updated` defaults to `now()` and is refreshed automatically by a trigger whenever the row changes.
- `release_year` must be between 1970 and 2100. URLs must start with `http://` or `https://`.
- `price_notification.phone` is 10–15 digits with an optional leading `+`; `email` must look like `name@domain.tld` (max 254 characters).
- Product images are public URLs: game covers from English Wikipedia and hardware photos from Wikimedia Commons.

## Access

Row Level Security is enabled on every table. Catalog tables have a read-only policy that lets anyone `SELECT`; there are no insert/update/delete policies. `price_notification` holds contact details, so it has **no policies at all**: only the API's service role key can read or write it. The API connects with the Supabase service role key (`SUPABASE_SERVICE_ROLE_KEY` in `api/.env`, never committed), which is server-side only and never sent to the client.
