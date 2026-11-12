-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('game', 'console', 'accessory')),
  developer TEXT,
  manufacturer TEXT,
  release_year INTEGER,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on product name for search performance
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Add trigger to automatically update updated_at timestamp
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
