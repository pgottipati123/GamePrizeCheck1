-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES sellers(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  condition TEXT NOT NULL CHECK (condition IN ('new', 'used', 'refurbished')),
  availability TEXT NOT NULL CHECK (availability IN ('in_stock', 'out_of_stock', 'limited')),
  external_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on product_id for quick lookup of listings for a product
CREATE INDEX IF NOT EXISTS idx_listings_product_id ON listings(product_id);

-- Create index on seller_id for quick lookup of listings from a seller
CREATE INDEX IF NOT EXISTS idx_listings_seller_id ON listings(seller_id);

-- Create index on price for price filtering and sorting
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);

-- Create composite index on product_id and price for price comparison queries
CREATE INDEX IF NOT EXISTS idx_listings_product_price ON listings(product_id, price);

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
