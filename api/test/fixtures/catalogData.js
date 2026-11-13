// Fixture catalog used by API and client unit tests (no network access).
// Shapes and field names mirror the Specification 2 tables in db/01_schema.sql.

const id = (prefix, n) => `${prefix}0000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

export const categories = [
  {
    category_id: id(1, 1),
    name: 'Games',
    description: 'Physical video games on disc or cartridge.',
    display_order: 1,
  },
  {
    category_id: id(1, 2),
    name: 'Consoles',
    description: 'Home and handheld gaming consoles.',
    display_order: 2,
  },
  {
    category_id: id(1, 3),
    name: 'Accessories',
    description: 'Controllers, headsets, and other gaming accessories.',
    display_order: 3,
  },
];

export const makers = [
  {
    maker_id: id(2, 1),
    name: 'Nintendo',
    website_url: 'https://www.nintendo.com',
    description: 'Maker of the Nintendo Switch and franchises like Mario and Zelda.',
  },
  {
    maker_id: id(2, 2),
    name: 'Sony Interactive Entertainment',
    website_url: 'https://www.playstation.com',
    description: 'Maker of PlayStation consoles, controllers, and games.',
  },
  {
    maker_id: id(2, 3),
    name: 'Microsoft',
    website_url: 'https://www.xbox.com',
    description: 'Maker of Xbox consoles and accessories.',
  },
  {
    maker_id: id(2, 4),
    name: 'FromSoftware',
    website_url: 'https://www.fromsoftware.jp',
    description: 'Developer of Dark Souls and Elden Ring.',
  },
  {
    maker_id: id(2, 5),
    name: 'Rockstar Games',
    website_url: 'https://www.rockstargames.com',
    description: 'Developer of Grand Theft Auto and Red Dead Redemption.',
  },
  {
    maker_id: id(2, 6),
    name: 'Capcom',
    website_url: 'https://www.capcom.com',
    description: 'Developer of Resident Evil, Street Fighter, and Monster Hunter.',
  },
  {
    maker_id: id(2, 7),
    name: 'Turtle Beach',
    website_url: 'https://www.turtlebeach.com',
    description: 'Maker of gaming headsets and controllers.',
  },
];

export const platforms = [
  {
    platform_id: id(3, 1),
    name: 'Nintendo Switch',
    manufacturer: 'Nintendo',
    release_year: 2017,
  },
  {
    platform_id: id(3, 2),
    name: 'PlayStation 5',
    manufacturer: 'Sony Interactive Entertainment',
    release_year: 2020,
  },
  {
    platform_id: id(3, 3),
    name: 'Xbox Series X|S',
    manufacturer: 'Microsoft',
    release_year: 2020,
  },
  {
    platform_id: id(3, 4),
    name: 'PlayStation 4',
    manufacturer: 'Sony Interactive Entertainment',
    release_year: 2013,
  },
];

const [GAMES, CONSOLES, ACCESSORIES] = categories.map((c) => c.category_id);
const [NINTENDO, SONY, MICROSOFT, FROMSOFTWARE, ROCKSTAR, CAPCOM, TURTLE_BEACH] = makers.map(
  (m) => m.maker_id,
);

export const products = [
  {
    product_id: id(4, 1),
    category_id: GAMES,
    maker_id: NINTENDO,
    name: 'The Legend of Zelda: Tears of the Kingdom',
    image_url: null,
    release_year: 2023,
    description:
      'Open-world action adventure across the skies and depths of Hyrule. Physical game card.',
  },
  {
    product_id: id(4, 2),
    category_id: GAMES,
    maker_id: FROMSOFTWARE,
    name: 'Elden Ring',
    image_url: null,
    release_year: 2022,
    description: 'Open-world action RPG set in the Lands Between.',
  },
  {
    product_id: id(4, 3),
    category_id: CONSOLES,
    maker_id: SONY,
    name: 'PlayStation 5 Console (Slim, Disc Edition)',
    image_url: null,
    release_year: 2023,
    description:
      'Slim PlayStation 5 with Ultra HD Blu-ray disc drive, 1TB SSD, and a DualSense controller.',
  },
  {
    product_id: id(4, 4),
    category_id: ACCESSORIES,
    maker_id: SONY,
    name: 'DualSense Wireless Controller - Midnight Black',
    image_url: null,
    release_year: 2021,
    description: 'PlayStation 5 controller with haptic feedback and adaptive triggers.',
  },
  {
    product_id: id(4, 5),
    category_id: ACCESSORIES,
    maker_id: MICROSOFT,
    name: 'Xbox Wireless Controller - Carbon Black',
    image_url: null,
    release_year: 2020,
    description: 'Wireless controller for Xbox Series X|S with textured grips and a hybrid D-pad.',
  },
  {
    product_id: id(4, 6),
    category_id: GAMES,
    maker_id: NINTENDO,
    name: 'Super Mario Bros. Wonder',
    image_url: null,
    release_year: 2023,
    description: 'Side-scrolling Mario adventure in the Flower Kingdom with Wonder Flowers.',
  },
  {
    product_id: id(4, 7),
    category_id: GAMES,
    maker_id: NINTENDO,
    name: 'Mario Kart 8 Deluxe',
    image_url: null,
    release_year: 2017,
    description: 'Kart racing with 48 courses and local and online multiplayer.',
  },
  {
    product_id: id(4, 8),
    category_id: GAMES,
    maker_id: ROCKSTAR,
    name: 'Red Dead Redemption 2',
    image_url: null,
    release_year: 2018,
    description: 'Western epic following outlaw Arthur Morgan and the Van der Linde gang.',
  },
  {
    product_id: id(4, 9),
    category_id: GAMES,
    maker_id: CAPCOM,
    name: 'Resident Evil 4',
    image_url: null,
    release_year: 2023,
    description: 'Remake of the survival horror classic following agent Leon S. Kennedy.',
  },
  {
    product_id: id(4, 10),
    category_id: CONSOLES,
    maker_id: MICROSOFT,
    name: 'Xbox Series X Console (1TB)',
    image_url: null,
    release_year: 2020,
    description: 'Microsoft’s most powerful Xbox with a 4K Blu-ray drive and 1TB SSD.',
  },
  {
    product_id: id(4, 11),
    category_id: CONSOLES,
    maker_id: NINTENDO,
    name: 'Nintendo Switch - OLED Model',
    image_url: null,
    release_year: 2021,
    description: 'Switch with a 7-inch OLED screen, wide adjustable stand, and 64GB storage.',
  },
  {
    product_id: id(4, 12),
    category_id: ACCESSORIES,
    maker_id: NINTENDO,
    name: 'Nintendo Switch Pro Controller',
    image_url: null,
    release_year: 2017,
    description: 'Full-size wireless controller with motion controls and HD rumble.',
  },
  {
    product_id: id(4, 13),
    category_id: ACCESSORIES,
    maker_id: TURTLE_BEACH,
    name: 'Turtle Beach Stealth 600 Gen 3 Wireless Headset',
    image_url: null,
    release_year: 2024,
    description: 'Wireless gaming headset with 80-hour battery life and a flip-to-mute mic.',
  },
];

const [SWITCH, PS5, XBOX_SERIES, PS4] = platforms.map((p) => p.platform_id);

const productPlatformPairs = [
  [1, SWITCH],
  [2, PS5],
  [2, XBOX_SERIES],
  [2, PS4],
  [3, PS5],
  [4, PS5],
  [5, XBOX_SERIES],
  [6, SWITCH],
  [7, SWITCH],
  [8, PS4],
  [9, PS5],
  [9, XBOX_SERIES],
  [10, XBOX_SERIES],
  [11, SWITCH],
  [12, SWITCH],
  [13, PS5],
  [13, XBOX_SERIES],
];

export const productPlatforms = productPlatformPairs.map(([productNumber, platformId], index) => ({
  product_platform_id: id(5, index + 1),
  product_id: id(4, productNumber),
  platform_id: platformId,
}));

export const retailers = [
  {
    retailer_id: id(6, 1),
    name: 'Best Buy',
    website_url: 'https://www.bestbuy.com',
    active: true,
  },
  {
    retailer_id: id(6, 2),
    name: 'GameStop',
    website_url: 'https://www.gamestop.com',
    active: true,
  },
  { retailer_id: id(6, 3), name: 'Target', website_url: 'https://www.target.com', active: true },
  { retailer_id: id(6, 4), name: 'Walmart', website_url: 'https://www.walmart.com', active: true },
  { retailer_id: id(6, 5), name: 'Amazon', website_url: 'https://www.amazon.com', active: true },
  // Inactive retailers are kept for history but hidden from results.
  {
    retailer_id: id(6, 6),
    name: "Fry's Electronics",
    website_url: 'https://www.frys.com',
    active: false,
  },
];

// Each retailer's real product search page; product_url = template + product name.
const RETAILER_SEARCH_URLS = {
  1: 'https://www.bestbuy.com/site/searchpage.jsp?st=',
  2: 'https://www.gamestop.com/search/?q=',
  3: 'https://www.target.com/s?searchTerm=',
  4: 'https://www.walmart.com/search?q=',
  5: 'https://www.amazon.com/s?k=',
  6: 'https://www.frys.com/search?search_type=regular&query_string=',
};

// [product, retailer, price, condition, in_stock, discount_amount, last_updated]
const listingRows = [
  [1, 1, 69.99, 'new', true, 0, '2026-11-12T09:15:00Z'],
  [1, 2, 52.99, 'used', true, 0, '2026-11-12T08:40:00Z'],
  [1, 4, 57.99, 'new', true, 12.0, '2026-11-11T22:05:00Z'],
  [1, 5, 59.99, 'new', false, 10.0, '2026-11-12T07:30:00Z'],
  [2, 4, 39.99, 'new', true, 20.0, '2026-11-12T06:10:00Z'],
  [2, 2, 29.99, 'used', true, 0, '2026-11-11T18:45:00Z'],
  [2, 1, 49.99, 'new', true, 10.0, '2026-11-12T10:00:00Z'],
  [3, 3, 499.99, 'new', false, 0, '2026-11-12T05:20:00Z'],
  [3, 1, 449.99, 'new', true, 50.0, '2026-11-12T09:50:00Z'],
  [3, 2, 399.99, 'refurbished', true, 0, '2026-11-11T16:30:00Z'],
  [3, 6, 479.99, 'new', true, 20.0, '2021-02-24T12:00:00Z'],
  [4, 2, 54.99, 'refurbished', true, 15.0, '2026-11-12T08:00:00Z'],
  [4, 3, 74.99, 'new', true, 0, '2026-11-12T07:00:00Z'],
  [4, 5, 64.99, 'new', true, 10.0, '2026-11-12T09:05:00Z'],
  [5, 4, 49.99, 'new', true, 10.0, '2026-11-11T20:15:00Z'],
  [5, 1, 59.99, 'new', true, 0, '2026-11-12T10:20:00Z'],
  [5, 2, 34.99, 'used', false, 0, '2026-11-10T14:00:00Z'],
  [6, 3, 59.99, 'new', true, 0, '2026-11-12T06:45:00Z'],
  [6, 5, 49.99, 'new', true, 10.0, '2026-11-12T08:25:00Z'],
  [7, 4, 49.99, 'new', true, 10.0, '2026-11-12T07:55:00Z'],
  [7, 2, 37.99, 'used', true, 0, '2026-11-11T19:10:00Z'],
  [7, 1, 59.99, 'new', true, 0, '2026-11-12T09:35:00Z'],
  [8, 2, 14.99, 'used', true, 0, '2026-11-11T17:20:00Z'],
  [8, 4, 24.99, 'new', true, 15.0, '2026-11-12T05:55:00Z'],
  [9, 5, 29.99, 'new', true, 30.0, '2026-11-12T08:50:00Z'],
  [9, 3, 39.99, 'new', false, 20.0, '2026-11-11T21:40:00Z'],
  [10, 1, 549.99, 'new', true, 50.0, '2026-11-12T10:10:00Z'],
  [10, 4, 599.99, 'new', true, 0, '2026-11-12T06:30:00Z'],
  [10, 2, 449.99, 'refurbished', false, 0, '2026-11-10T15:45:00Z'],
  [11, 3, 349.99, 'new', true, 0, '2026-11-12T07:40:00Z'],
  [11, 2, 279.99, 'used', true, 0, '2026-11-11T18:00:00Z'],
  [11, 5, 329.99, 'new', true, 20.0, '2026-11-12T09:20:00Z'],
  [12, 1, 69.99, 'new', true, 0, '2026-11-12T08:15:00Z'],
  [12, 2, 49.99, 'refurbished', true, 0, '2026-11-11T20:50:00Z'],
  [13, 1, 99.99, 'new', true, 0, '2026-11-12T09:45:00Z'],
  [13, 5, 79.99, 'new', true, 20.0, '2026-11-12T07:10:00Z'],
  [13, 4, 89.99, 'new', false, 10.0, '2026-11-11T23:30:00Z'],
];

export const listings = listingRows.map(
  ([productNumber, retailerNumber, price, condition, inStock, discount, lastUpdated], index) => {
    const product = products[productNumber - 1];
    return {
      listing_id: id(7, index + 1),
      product_id: product.product_id,
      retailer_id: id(6, retailerNumber),
      price,
      condition,
      in_stock: inStock,
      discount_amount: discount,
      product_url: RETAILER_SEARCH_URLS[retailerNumber] + encodeURIComponent(product.name),
      last_updated: lastUpdated,
    };
  },
);

export const CONDITIONS = ['new', 'used', 'refurbished'];
