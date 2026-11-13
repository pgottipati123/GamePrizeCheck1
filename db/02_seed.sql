-- GamePriceCheck Prototype 2: development seed data (Specification 2)
-- Run after db/01_schema.sql on the same database.
-- Fixed UUIDs keep every foreign key valid without manual edits.
-- Safe to re-run: rows that already exist (same primary key) are skipped.
-- Product URLs point at each retailer's real search page for the product.

begin;

-- ---------------------------------------------------------------------------
-- category (3 rows)
-- ---------------------------------------------------------------------------
insert into public.category (category_id, name, description, display_order) values
  ('10000000-0000-4000-8000-000000000001', 'Games',
    'Physical video games on disc or cartridge.', 1),
  ('10000000-0000-4000-8000-000000000002', 'Consoles',
    'Home and handheld gaming consoles.', 2),
  ('10000000-0000-4000-8000-000000000003', 'Accessories',
    'Controllers, headsets, and other gaming accessories.', 3)
on conflict (category_id) do nothing;

-- ---------------------------------------------------------------------------
-- maker (4 rows)
-- ---------------------------------------------------------------------------
insert into public.maker (maker_id, name, website_url, description) values
  ('20000000-0000-4000-8000-000000000001', 'Nintendo', 'https://www.nintendo.com',
    'Japanese developer and manufacturer of the Nintendo Switch and first-party games such as The Legend of Zelda.'),
  ('20000000-0000-4000-8000-000000000002', 'Sony Interactive Entertainment', 'https://www.playstation.com',
    'Maker of PlayStation consoles, controllers, and first-party games.'),
  ('20000000-0000-4000-8000-000000000003', 'Microsoft', 'https://www.xbox.com',
    'Maker of Xbox consoles and Xbox accessories.'),
  ('20000000-0000-4000-8000-000000000004', 'FromSoftware', 'https://www.fromsoftware.jp',
    'Japanese game developer known for Dark Souls and Elden Ring.')
on conflict (maker_id) do nothing;

-- ---------------------------------------------------------------------------
-- platform (3 rows)
-- ---------------------------------------------------------------------------
insert into public.platform (platform_id, name, manufacturer, release_year) values
  ('30000000-0000-4000-8000-000000000001', 'Nintendo Switch', 'Nintendo', 2017),
  ('30000000-0000-4000-8000-000000000002', 'PlayStation 5', 'Sony Interactive Entertainment', 2020),
  ('30000000-0000-4000-8000-000000000003', 'Xbox Series X|S', 'Microsoft', 2020)
on conflict (platform_id) do nothing;

-- ---------------------------------------------------------------------------
-- product (5 rows)
-- ---------------------------------------------------------------------------
insert into public.product (product_id, category_id, maker_id, name, image_url, release_year, description) values
  ('40000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001',
    'The Legend of Zelda: Tears of the Kingdom', null, 2023,
    'Open-world action adventure across the skies and depths of Hyrule. Physical game card.'),
  ('40000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000004',
    'Elden Ring', null, 2022,
    'Open-world action RPG set in the Lands Between. PlayStation 5 disc.'),
  ('40000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002',
    'PlayStation 5 Console (Slim, Disc Edition)', null, 2023,
    'Slim PlayStation 5 with Ultra HD Blu-ray disc drive, 1TB SSD, and DualSense controller.'),
  ('40000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002',
    'DualSense Wireless Controller - Midnight Black', null, 2021,
    'PlayStation 5 controller with haptic feedback and adaptive triggers.'),
  ('40000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000003',
    'Xbox Wireless Controller - Carbon Black', null, 2020,
    'Wireless controller for Xbox Series X|S with textured grips and a hybrid D-pad.')
on conflict (product_id) do nothing;

-- ---------------------------------------------------------------------------
-- product_platform (5 rows)
-- ---------------------------------------------------------------------------
insert into public.product_platform (product_platform_id, product_id, platform_id) values
  ('50000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001', '30000000-0000-4000-8000-000000000001'),
  ('50000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000002', '30000000-0000-4000-8000-000000000002'),
  ('50000000-0000-4000-8000-000000000003',
    '40000000-0000-4000-8000-000000000003', '30000000-0000-4000-8000-000000000002'),
  ('50000000-0000-4000-8000-000000000004',
    '40000000-0000-4000-8000-000000000004', '30000000-0000-4000-8000-000000000002'),
  ('50000000-0000-4000-8000-000000000005',
    '40000000-0000-4000-8000-000000000005', '30000000-0000-4000-8000-000000000003')
on conflict (product_platform_id) do nothing;

-- ---------------------------------------------------------------------------
-- retailer (4 rows)
-- ---------------------------------------------------------------------------
insert into public.retailer (retailer_id, name, website_url, active) values
  ('60000000-0000-4000-8000-000000000001', 'Best Buy', 'https://www.bestbuy.com', true),
  ('60000000-0000-4000-8000-000000000002', 'GameStop', 'https://www.gamestop.com', true),
  ('60000000-0000-4000-8000-000000000003', 'Target', 'https://www.target.com', true),
  ('60000000-0000-4000-8000-000000000004', 'Walmart', 'https://www.walmart.com', true)
on conflict (retailer_id) do nothing;

-- ---------------------------------------------------------------------------
-- listing (5 rows)
-- Covers: two retailers for the same product, new/used/refurbished,
-- an out-of-stock listing, and discounted listings.
-- ---------------------------------------------------------------------------
insert into public.listing (listing_id, product_id, retailer_id, price, condition, in_stock, discount_amount, product_url) values
  ('70000000-0000-4000-8000-000000000001',
    '40000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000001',
    69.99, 'new', true, 0.00,
    'https://www.bestbuy.com/site/searchpage.jsp?st=zelda+tears+of+the+kingdom'),
  ('70000000-0000-4000-8000-000000000002',
    '40000000-0000-4000-8000-000000000001', '60000000-0000-4000-8000-000000000002',
    52.99, 'used', true, 0.00,
    'https://www.gamestop.com/search/?q=zelda+tears+of+the+kingdom'),
  ('70000000-0000-4000-8000-000000000003',
    '40000000-0000-4000-8000-000000000002', '60000000-0000-4000-8000-000000000004',
    39.99, 'new', true, 20.00,
    'https://www.walmart.com/search?q=elden+ring+ps5'),
  ('70000000-0000-4000-8000-000000000004',
    '40000000-0000-4000-8000-000000000003', '60000000-0000-4000-8000-000000000003',
    499.99, 'new', false, 0.00,
    'https://www.target.com/s?searchTerm=playstation+5+slim+disc'),
  ('70000000-0000-4000-8000-000000000005',
    '40000000-0000-4000-8000-000000000004', '60000000-0000-4000-8000-000000000002',
    54.99, 'refurbished', true, 15.00,
    'https://www.gamestop.com/search/?q=dualsense+wireless+controller')
on conflict (listing_id) do nothing;

commit;
