import { describe, expect, it } from 'vitest';
import { createCatalog } from '../src/services/catalog.js';
import * as fixtures from './fixtures/catalogData.js';

const { listings, products, retailers } = fixtures;
const {
  listCategories: getCategories,
  getCategoryBySlug,
  getFilterOptions,
  getProductDetail,
  getProductListings,
  getTopDeals,
} = createCatalog(fixtures);
const { searchProducts } = createCatalog(fixtures);

const names = (results) => results.map((product) => product.name);
const ZELDA_ID = products[0].product_id;
const PS5_ID = products[2].product_id;
const retailerId = (name) => retailers.find((r) => r.name === name).retailer_id;

describe('fixture data integrity', () => {
  it('has valid foreign keys for every listing', () => {
    const productIds = new Set(products.map((p) => p.product_id));
    const retailerIds = new Set(retailers.map((r) => r.retailer_id));
    for (const listing of listings) {
      expect(productIds.has(listing.product_id)).toBe(true);
      expect(retailerIds.has(listing.retailer_id)).toBe(true);
      expect(listing.product_url).toMatch(/^https:\/\//);
    }
  });
});

describe('categories', () => {
  it('returns categories in display order with slugs', () => {
    expect(getCategories().map((c) => c.slug)).toEqual(['games', 'consoles', 'accessories']);
    expect(getCategoryBySlug('consoles').name).toBe('Consoles');
    expect(getCategoryBySlug('nope')).toBeNull();
  });
});

describe('searchProducts', () => {
  it('matches name, maker, and platform terms', () => {
    expect(names(searchProducts({ q: 'zelda' }))).toEqual([
      'The Legend of Zelda: Tears of the Kingdom',
    ]);
    expect(searchProducts({ q: 'capcom' })).toHaveLength(1);
    expect(names(searchProducts({ q: 'switch controller' }))).toEqual([
      'Nintendo Switch Pro Controller',
    ]);
  });

  it('filters by category', () => {
    const consoles = searchProducts({ category: 'consoles' });
    expect(consoles).toHaveLength(3);
    expect(consoles.every((p) => p.category.slug === 'consoles')).toBe(true);
  });

  it('filters listings by condition and summarizes matching prices only', () => {
    const used = searchProducts({ conditions: ['used'] });
    expect(used.length).toBeGreaterThan(0);
    expect(used.every((p) => p.listings.every((l) => l.condition === 'used'))).toBe(true);
    const zelda = used.find((p) => p.product_id === ZELDA_ID);
    expect(zelda.lowestPrice).toBe(52.99);
  });

  it('filters by price range, retailer, maker, and year', () => {
    const cheap = searchProducts({ minPrice: 20, maxPrice: 40 });
    expect(cheap.every((p) => p.listings.every((l) => l.price >= 20 && l.price <= 40))).toBe(true);

    const target = retailerId('Target');
    const atTarget = searchProducts({ retailers: [target] });
    expect(atTarget.every((p) => p.listings.every((l) => l.retailer_id === target))).toBe(true);

    const nintendo = searchProducts({ makers: [products[0].maker_id] });
    expect(nintendo.every((p) => p.maker.name === 'Nintendo')).toBe(true);
    expect(nintendo).toHaveLength(5);

    expect(searchProducts({ year: 2017 }).every((p) => p.release_year === 2017)).toBe(true);
  });

  it('sorts by price, discount, and release year', () => {
    const asc = searchProducts({ sort: 'price_asc' }).map((p) => p.lowestPrice);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    const desc = searchProducts({ sort: 'price_desc' }).map((p) => p.lowestPrice);
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
    const discounts = searchProducts({ sort: 'discount_desc' }).map((p) => p.maxDiscount);
    expect(discounts).toEqual([...discounts].sort((a, b) => b - a));
    const years = searchProducts({ sort: 'newest' }).map((p) => p.release_year);
    expect(years).toEqual([...years].sort((a, b) => b - a));
  });

  it('returns nothing when no listing matches', () => {
    expect(searchProducts({ q: 'zelda', conditions: ['refurbished'] })).toEqual([]);
  });
});

describe('getProductDetail', () => {
  it('excludes inactive retailers and picks the cheapest in-stock offer', () => {
    const ps5 = getProductDetail(PS5_ID);
    expect(ps5.listings.map((l) => l.retailer.name)).not.toContain("Fry's Electronics");
    expect(ps5.lowestPriceListing.price).toBe(399.99);
    expect(ps5.listings[0].in_stock).toBe(true);
  });

  it('computes the regular price from the discount', () => {
    const zelda = getProductDetail(ZELDA_ID);
    const walmart = zelda.listings.find((l) => l.retailer.name === 'Walmart');
    expect(walmart.original_price).toBe(69.99);
  });

  it('returns null for unknown products', () => {
    expect(getProductDetail('missing')).toBeNull();
  });
});

describe('getFilterOptions', () => {
  it('limits choices to the category and hides inactive retailers', () => {
    const options = getFilterOptions('accessories');
    expect(options.makers.map((m) => m.name)).toEqual([
      'Microsoft',
      'Nintendo',
      'Sony Interactive Entertainment',
      'Turtle Beach',
    ]);
    expect(getFilterOptions().retailers.map((r) => r.name)).not.toContain("Fry's Electronics");
  });
});

describe('product listings and deals', () => {
  it("filters and sorts one product's listings", () => {
    const all = getProductListings(ZELDA_ID);
    expect(all.map((l) => l.price)).toEqual([...all.map((l) => l.price)].sort((a, b) => a - b));
    expect(
      getProductListings(ZELDA_ID, { condition: 'used' }).every((l) => l.condition === 'used'),
    ).toBe(true);
    expect(getProductListings(ZELDA_ID, { sort: 'price_desc' })[0].price).toBe(
      Math.max(...all.map((l) => l.price)),
    );
    expect(getProductListings('00000000-0000-4000-8000-000000000000')).toBeNull();
  });

  it('returns discounted products as deals', () => {
    const deals = getTopDeals(3);
    expect(deals).toHaveLength(3);
    expect(deals.every((p) => p.maxDiscount > 0)).toBe(true);
    expect(deals[0].maxDiscount).toBeGreaterThanOrEqual(deals[2].maxDiscount);
  });
});
