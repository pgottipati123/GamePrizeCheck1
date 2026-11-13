import { getSupabase } from '../lib/supabase.js';
import { HttpError } from '../lib/httpError.js';

// Maps catalog keys to Specification 2 table names.
export const TABLES = {
  categories: 'category',
  makers: 'maker',
  platforms: 'platform',
  products: 'product',
  productPlatforms: 'product_platform',
  retailers: 'retailer',
  listings: 'listing',
};

const LISTING_COLUMNS =
  'listing_id, product_id, retailer_id, price, condition, in_stock, discount_amount, product_url, last_updated';

// Postgres check/format violations come from bad input, so they map to 400.
const CLIENT_ERROR_CODES = new Set(['22P02', '23502', '23514']);

function dbError(action, error) {
  const status = CLIENT_ERROR_CODES.has(error.code) ? 400 : 502;
  return new HttpError(status, `Database error while ${action}: ${error.message}`);
}

/** Supabase-backed data access. Runs server-side with the service role key. */
export function createSupabaseRepository(config) {
  const db = () => getSupabase(config);

  return {
    async loadCatalog() {
      const entries = await Promise.all(
        Object.entries(TABLES).map(async ([key, table]) => {
          const { data, error } = await db().from(table).select('*');
          if (error) throw dbError(`reading ${table}`, error);
          return [key, data];
        }),
      );
      return Object.fromEntries(entries);
    },

    async updateListing(listingId, changes) {
      const { data, error } = await db()
        .from('listing')
        .update(changes)
        .eq('listing_id', listingId)
        .select(LISTING_COLUMNS)
        .maybeSingle();
      if (error) throw dbError('updating the listing', error);
      return data;
    },
  };
}

/** In-memory repository with the same interface, used by tests. */
export function createMemoryRepository(seed) {
  const data = structuredClone(seed);
  return {
    async loadCatalog() {
      return structuredClone(data);
    },
    async updateListing(listingId, changes) {
      const listing = data.listings.find((row) => row.listing_id === listingId);
      if (!listing) return null;
      Object.assign(listing, changes, { last_updated: new Date().toISOString() });
      return structuredClone(listing);
    },
  };
}
