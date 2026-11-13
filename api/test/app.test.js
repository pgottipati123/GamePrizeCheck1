import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { errorHandler } from '../src/middleware/errorHandler.js';
import { createMemoryRepository } from '../src/services/catalogRepository.js';
import * as fixtures from './fixtures/catalogData.js';

const ADMIN_KEY = 'test-admin-key-0123456789';
const ZELDA = fixtures.products[0];
const LISTING = fixtures.listings.find((l) => l.product_id === ZELDA.product_id);
const MISSING = '00000000-0000-4000-8000-000000000000';

function appWith(env = {}) {
  return createApp(loadConfig({ NODE_ENV: 'test', ADMIN_API_KEY: ADMIN_KEY, ...env }), {
    repository: createMemoryRepository(fixtures),
  });
}

describe('GET /api/health', () => {
  it('returns ok', async () => {
    const res = await request(appWith()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('GET /api/categories', () => {
  it('lists categories in display order with slugs', async () => {
    const res = await request(appWith()).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.data.map((c) => c.slug)).toEqual(['games', 'consoles', 'accessories']);
    expect(res.body.count).toBe(3);
  });
});

describe('GET /api/products', () => {
  it('searches by text and category', async () => {
    const res = await request(appWith()).get('/api/products?q=xbox&category=consoles');
    expect(res.status).toBe(200);
    expect(res.body.data.map((p) => p.name)).toEqual(['Xbox Series X Console (1TB)']);
  });

  it('applies repeated filters and sorting', async () => {
    const res = await request(appWith()).get(
      '/api/products?category=consoles&condition=new&condition=refurbished&sort=price_asc',
    );
    expect(res.status).toBe(200);
    const prices = res.body.data.map((p) => p.lowestPrice);
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  it('supports limit and reports the total', async () => {
    const res = await request(appWith()).get('/api/products?limit=2');
    expect(res.body.count).toBe(2);
    expect(res.body.total).toBe(fixtures.products.length);
  });

  it.each([
    ['q=z', 'q'],
    ['minPrice=60&maxPrice=20', 'maxPrice'],
    ['minPrice=-1', 'minPrice'],
    ['condition=broken', 'condition'],
    ['retailer=abc', 'retailer'],
    ['sort=cheapest', 'sort'],
    ['year=1800', 'year'],
    ['category=toys', 'category'],
  ])('rejects invalid query %s with 400', async (query, field) => {
    const res = await request(appWith()).get(`/api/products?${query}`);
    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.field)).toContain(field);
  });
});

describe('GET /api/products/:id', () => {
  it('returns product details with active listings', async () => {
    const res = await request(appWith()).get(`/api/products/${ZELDA.product_id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(ZELDA.name);
    expect(res.body.data.maker.name).toBe('Nintendo');
    expect(res.body.data.listings.length).toBeGreaterThan(1);
    expect(res.body.data.listings[0].retailer.name).toBeTruthy();
  });

  it('returns 400 for a malformed id and 404 for an unknown id', async () => {
    expect((await request(appWith()).get('/api/products/not-a-uuid')).status).toBe(400);
    expect((await request(appWith()).get(`/api/products/${MISSING}`)).status).toBe(404);
  });
});

describe('GET /api/products/:id/listings', () => {
  it('compares retailer listings with condition filter and sort', async () => {
    const res = await request(appWith()).get(
      `/api/products/${ZELDA.product_id}/listings?sort=price_desc`,
    );
    expect(res.status).toBe(200);
    const prices = res.body.data.map((l) => l.price);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
    const used = await request(appWith()).get(
      `/api/products/${ZELDA.product_id}/listings?condition=used`,
    );
    expect(used.body.data.every((l) => l.condition === 'used')).toBe(true);
  });

  it('validates inputs', async () => {
    const app = appWith();
    expect((await request(app).get(`/api/products/${MISSING}/listings`)).status).toBe(404);
    expect(
      (await request(app).get(`/api/products/${ZELDA.product_id}/listings?sort=x`)).status,
    ).toBe(400);
  });
});

describe('GET /api/filters and /api/deals', () => {
  it('returns filter options scoped to a category', async () => {
    const res = await request(appWith()).get('/api/filters?category=accessories');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('makers');
    expect(res.body.data).toHaveProperty('retailers');
    expect(res.body.data).toHaveProperty('years');
  });

  it('returns discounted deals', async () => {
    const res = await request(appWith()).get('/api/deals?limit=3');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(3);
    expect((await request(appWith()).get('/api/deals?limit=0')).status).toBe(400);
  });
});

describe('PATCH /api/listings/:id', () => {
  const patch = (app, id, body, key = ADMIN_KEY) => {
    const req = request(app).patch(`/api/listings/${id}`).send(body);
    return key ? req.set('X-Admin-Key', key) : req;
  };

  it('updates price and stock, visible in later reads', async () => {
    const app = appWith();
    const res = await patch(app, LISTING.listing_id, { price: 44.5, in_stock: false });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ price: 44.5, in_stock: false });
    const listings = await request(app).get(`/api/products/${ZELDA.product_id}/listings`);
    expect(listings.body.data.find((l) => l.listing_id === LISTING.listing_id).price).toBe(44.5);
  });

  it('requires the admin key', async () => {
    expect((await patch(appWith(), LISTING.listing_id, { price: 1 }, null)).status).toBe(401);
    expect((await patch(appWith(), LISTING.listing_id, { price: 1 }, 'wrong')).status).toBe(401);
    const disabled = appWith({ ADMIN_API_KEY: '' });
    expect((await patch(disabled, LISTING.listing_id, { price: 1 })).status).toBe(503);
  });

  it.each([
    [{}, 'request body'],
    [{ price: -5 }, 'price'],
    [{ price: 10.999 }, 'price'],
    [{ in_stock: 'yes' }, 'in_stock'],
    [{ condition: 'mint' }, 'condition'],
    [{ product_url: 'ftp://x.example' }, 'product_url'],
    [{ name: 'x' }, 'request body'],
  ])('rejects invalid body %j with 400', async (body, field) => {
    const res = await patch(appWith(), LISTING.listing_id, body);
    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.field)).toContain(field);
  });

  it('returns 400 for malformed JSON and 404 for an unknown listing', async () => {
    const bad = await request(appWith())
      .patch(`/api/listings/${LISTING.listing_id}`)
      .set('X-Admin-Key', ADMIN_KEY)
      .set('Content-Type', 'application/json')
      .send('{"price":');
    expect(bad.status).toBe(400);
    expect((await patch(appWith(), MISSING, { price: 1 })).status).toBe(404);
  });
});

describe('unknown routes', () => {
  it('return a JSON 404', async () => {
    const res = await request(appWith()).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.message).toMatch(/not found/i);
  });
});

describe('error handler', () => {
  function appThatThrows(env) {
    const app = express();
    app.get('/boom', () => {
      throw new Error('secret details');
    });
    app.use(errorHandler(loadConfig(env)));
    return app;
  }

  it('hides error details in production', async () => {
    const res = await request(appThatThrows({ NODE_ENV: 'production' })).get('/boom');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { message: 'Internal server error' } });
  });

  it('includes the message outside production', async () => {
    const res = await request(appThatThrows({ NODE_ENV: 'development' })).get('/boom');
    expect(res.body.error.message).toBe('secret details');
  });
});

describe('CORS', () => {
  it('allows the configured client origin and blocks others', async () => {
    const app = appWith({ CORS_ORIGIN: 'https://app.example' });
    const ok = await request(app).get('/api/health').set('Origin', 'https://app.example');
    expect(ok.headers['access-control-allow-origin']).toBe('https://app.example');
    const bad = await request(app).get('/api/health').set('Origin', 'https://evil.example');
    expect(bad.headers['access-control-allow-origin']).toBeUndefined();
  });
});
