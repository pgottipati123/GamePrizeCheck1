// Test-only stand-in for the Express API: answers the client's fetch calls with
// the API's own catalog logic over fixture rows, so no network is used.
import { createCatalog } from '../../../api/src/services/catalog.js';
import * as fixtures from '../../../api/test/fixtures/catalogData.js';

const catalog = createCatalog(fixtures);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const num = (value) => (value === null || value === '' ? null : Number(value));

function respond(status, body) {
  return { ok: status < 400, status, json: async () => body };
}

function route(url) {
  const { pathname, searchParams: p } = new URL(url, 'http://localhost');
  if (pathname === '/api/categories') return respond(200, { data: catalog.listCategories() });
  if (pathname === '/api/deals')
    return respond(200, { data: catalog.getTopDeals(num(p.get('limit')) ?? 4) });
  if (pathname === '/api/filters') {
    return respond(200, { data: catalog.getFilterOptions(p.get('category') ?? '') });
  }
  if (pathname === '/api/products') {
    const data = catalog.searchProducts({
      q: p.get('q') ?? '',
      category: p.get('category') ?? '',
      conditions: p.getAll('condition'),
      retailers: p.getAll('retailer'),
      makers: p.getAll('maker'),
      minPrice: num(p.get('minPrice')),
      maxPrice: num(p.get('maxPrice')),
      year: num(p.get('year')),
      sort: p.get('sort') ?? 'relevance',
    });
    return respond(200, { data, count: data.length });
  }
  const match = pathname.match(/^\/api\/products\/([^/]+)$/);
  if (match) {
    const id = decodeURIComponent(match[1]);
    if (!UUID.test(id)) return respond(400, { error: { message: 'Invalid path parameter' } });
    const product = catalog.getProductDetail(id);
    return product
      ? respond(200, { data: product })
      : respond(404, { error: { message: `Product not found: ${id}` } });
  }
  return respond(404, { error: { message: `Route not found: GET ${pathname}` } });
}

export async function fakeFetch(url) {
  return route(String(url));
}

export const fixtureProducts = fixtures.products;
