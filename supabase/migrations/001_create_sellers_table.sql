-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  website_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on seller name for search performance
CREATE INDEX IF NOT EXISTS idx_sellers_name ON sellers(name);

-- Add trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
