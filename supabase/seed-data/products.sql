-- Sample product data
INSERT INTO products (name, category, developer, manufacturer, release_year, description) VALUES
  -- Games
  ('The Legend of Zelda: Tears of the Kingdom', 'game', 'Nintendo', 'Nintendo', 2023, 'An epic adventure through the skies and lands of Hyrule'),
  ('Elden Ring', 'game', 'FromSoftware', 'Bandai Namco', 2022, 'An action RPG set in a vast fantasy world'),
  ('Super Mario Odyssey', 'game', 'Nintendo', 'Nintendo', 2017, 'A 3D platforming adventure featuring Mario'),
  -- Consoles
  ('PlayStation 5', 'console', NULL, 'Sony', 2020, 'Next-generation gaming console from Sony'),
  ('Xbox Series X', 'console', NULL, 'Microsoft', 2020, 'Most powerful Xbox console ever'),
  ('Nintendo Switch OLED', 'console', NULL, 'Nintendo', 2021, 'Enhanced Nintendo Switch with OLED screen'),
  -- Accessories
  ('DualSense Wireless Controller', 'accessory', NULL, 'Sony', 2020, 'PS5 controller with haptic feedback'),
  ('Xbox Wireless Controller', 'accessory', NULL, 'Microsoft', 2020, 'Xbox Series X/S controller'),
  ('Pro Controller', 'accessory', NULL, 'Nintendo', 2017, 'Premium controller for Nintendo Switch');
