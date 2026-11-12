# Data Architecture Plan

This document outlines the initial data architecture for GamePriceCheck. This is a proposal that may evolve as development progresses.

## Entities

### Product

Represents a physical video game, console, or accessory.

**Fields:**
- `id` (UUID, primary key): Unique identifier for the product
- `name` (text, required): Product name
- `category` (text, required): Product type - 'game', 'console', or 'accessory'
- `developer` (text, nullable): Developer or manufacturer name
- `manufacturer` (text, nullable): Manufacturer name (for consoles/accessories)
- `release_year` (integer, nullable): Year of release
- `image_url` (text, nullable): URL to product image
- `description` (text, nullable): Product description
- `created_at` (timestamp, required): Timestamp when record was created
- `updated_at` (timestamp, required): Timestamp when record was last updated

**Indexes:**
- Index on `name` for search performance
- Index on `category` for filtering

### Seller

Represents a retailer or seller that offers products for sale.

**Fields:**
- `id` (UUID, primary key): Unique identifier for the seller
- `name` (text, required): Seller name
- `website_url` (text, required): Base URL for the seller's website
- `created_at` (timestamp, required): Timestamp when record was created
- `updated_at` (timestamp, required): Timestamp when record was last updated

**Indexes:**
- Index on `name` for search performance

### Listing

Represents a specific product listing from a seller with price, condition, and availability.

**Fields:**
- `id` (UUID, primary key): Unique identifier for the listing
- `product_id` (UUID, foreign key to products.id, required): The product being sold
- `seller_id` (UUID, foreign key to sellers.id, required): The seller offering the product
- `price` (decimal, required): Price of the product
- `condition` (text, required): Condition of the product - 'new', 'used', or 'refurbished'
- `availability` (text, required): Availability status - 'in_stock', 'out_of_stock', or 'limited'
- `external_url` (text, required): Direct URL to the product on the seller's website
- `created_at` (timestamp, required): Timestamp when record was created
- `updated_at` (timestamp, required): Timestamp when record was last updated

**Indexes:**
- Index on `product_id` for quick lookup of listings for a product
- Index on `seller_id` for quick lookup of listings from a seller
- Index on `price` for price filtering and sorting
- Composite index on `(product_id, price)` for price comparison queries

## Relationships

- **Product to Listing**: One-to-many (one product can have multiple listings from different sellers)
- **Seller to Listing**: One-to-many (one seller can have multiple listings for different products)
- **Product to Seller**: Many-to-many (through Listing table)

## Migration Notes

When creating migrations, use the following order:

1. Create `sellers` table (no foreign key dependencies)
2. Create `products` table (no foreign key dependencies)
3. Create `listings` table (depends on both sellers and products)

## Seed Data Structure

Seed data should be organized by entity type:

```
supabase/seed-data/
├── sellers.sql
├── products.sql
└── listings.sql
```

### Sample Data Categories

**Products:**
- Games: Sample video games across different platforms
- Consoles: Sample gaming consoles (PlayStation, Xbox, Nintendo)
- Accessories: Sample controllers, headsets, cables

**Sellers:**
- Example retailer names (can be generic or based on real retailers)
- Valid website URLs for testing external navigation

**Listings:**
- Multiple listings per product to demonstrate comparison
- Varied prices, conditions, and availability statuses
- Valid external URLs for testing navigation

## Future Considerations

This architecture may need to evolve to support:

- **Platform information**: May need to add platform field to products (PS5, Xbox Series X, Switch, etc.)
- **Genre information**: May need to add genre field to games
- **Seller ratings**: May need to add rating fields to sellers table
- **User accounts**: May need to add users, favorites, and search history tables
- **Price history**: May need to add price tracking tables if that feature is added
- **Product variants**: May need to support different editions/versions of products

## Naming Conventions

- Table names: plural, snake_case (e.g., `products`, `sellers`, `listings`)
- Column names: snake_case (e.g., `product_id`, `website_url`, `release_year`)
- Foreign keys: `{table_name}_id` pattern (e.g., `product_id`, `seller_id`)
- Timestamps: `created_at`, `updated_at` (standard Supabase convention)
