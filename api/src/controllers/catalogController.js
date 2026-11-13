import { createCatalog } from '../services/catalog.js';
import { HttpError } from '../lib/httpError.js';
import { validate } from '../lib/validate.js';
import {
  dealsQuery,
  filtersQuery,
  idParam,
  listingsQuery,
  listingUpdate,
  productsQuery,
} from '../schemas.js';

export function createCatalogController(repository) {
  const catalog = async () => createCatalog(await repository.loadCatalog());

  function requireCategory(cat, slug) {
    if (slug && !cat.getCategoryBySlug(slug)) {
      throw new HttpError(400, `Invalid query: category: unknown category "${slug}"`, [
        { field: 'category', message: `unknown category "${slug}"` },
      ]);
    }
  }

  return {
    health(req, res) {
      res.json({ status: 'ok' });
    },

    async listCategories(req, res) {
      const data = (await catalog()).listCategories();
      res.json({ data, count: data.length });
    },

    async listProducts(req, res) {
      const query = validate(productsQuery, req.query, 'query');
      const cat = await catalog();
      requireCategory(cat, query.category);
      const results = cat.searchProducts({
        q: query.q,
        category: query.category,
        conditions: query.condition,
        retailers: query.retailer,
        makers: query.maker,
        minPrice: query.minPrice ?? null,
        maxPrice: query.maxPrice ?? null,
        year: query.year ?? null,
        sort: query.sort,
      });
      const data = query.limit ? results.slice(0, query.limit) : results;
      res.json({ data, count: data.length, total: results.length });
    },

    async getProduct(req, res) {
      const { id } = validate(idParam, req.params, 'path parameter');
      const product = (await catalog()).getProductDetail(id);
      if (!product) throw new HttpError(404, `Product not found: ${id}`);
      res.json({ data: product });
    },

    async listProductListings(req, res) {
      const { id } = validate(idParam, req.params, 'path parameter');
      const query = validate(listingsQuery, req.query, 'query');
      const data = (await catalog()).getProductListings(id, query);
      if (!data) throw new HttpError(404, `Product not found: ${id}`);
      res.json({ data, count: data.length });
    },

    async getFilters(req, res) {
      const { category } = validate(filtersQuery, req.query, 'query');
      const cat = await catalog();
      requireCategory(cat, category);
      res.json({ data: cat.getFilterOptions(category) });
    },

    async listDeals(req, res) {
      const { limit } = validate(dealsQuery, req.query, 'query');
      const data = (await catalog()).getTopDeals(limit ?? 4);
      res.json({ data, count: data.length });
    },

    async updateListing(req, res) {
      const { id } = validate(idParam, req.params, 'path parameter');
      const changes = validate(listingUpdate, req.body, 'request body');
      const listing = await repository.updateListing(id, changes);
      if (!listing) throw new HttpError(404, `Listing not found: ${id}`);
      res.json({
        data: {
          ...listing,
          price: Number(listing.price),
          discount_amount: Number(listing.discount_amount),
        },
      });
    },
  };
}
