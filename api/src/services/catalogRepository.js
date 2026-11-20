import { randomUUID } from 'node:crypto';
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

const NOTIFICATION_COLUMNS = 'notification_id, product_id, email, phone, created_at';

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

    async productExists(productId) {
      const { data, error } = await db()
        .from('product')
        .select('product_id')
        .eq('product_id', productId)
        .maybeSingle();
      if (error) throw dbError('reading product', error);
      return Boolean(data);
    },

    /** Returns { notification, created }; an identical existing request is reused. */
    async createNotification({ product_id, email = null, phone = null }) {
      const findExisting = async () => {
        let query = db().from('price_notification').select(NOTIFICATION_COLUMNS);
        query = query.eq('product_id', product_id);
        query = email ? query.ilike('email', email) : query.eq('phone', phone);
        const { data, error } = await query.limit(1).maybeSingle();
        if (error) throw dbError('reading notifications', error);
        return data;
      };

      const existing = await findExisting();
      if (existing) return { notification: existing, created: false };

      const { data, error } = await db()
        .from('price_notification')
        .insert({ product_id, email, phone })
        .select(NOTIFICATION_COLUMNS)
        .single();
      if (error?.code === '23505') return { notification: await findExisting(), created: false };
      if (error) throw dbError('saving the notification request', error);
      return { notification: data, created: true };
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
    async productExists(productId) {
      return data.products.some((row) => row.product_id === productId);
    },
    async createNotification({ product_id, email = null, phone = null }) {
      data.notifications ??= [];
      const existing = data.notifications.find(
        (row) =>
          row.product_id === product_id &&
          (email ? row.email?.toLowerCase() === email.toLowerCase() : row.phone === phone),
      );
      if (existing) return { notification: structuredClone(existing), created: false };
      const notification = {
        notification_id: randomUUID(),
        product_id,
        email,
        phone,
        created_at: new Date().toISOString(),
      };
      data.notifications.push(notification);
      return { notification: structuredClone(notification), created: true };
    },
  };
}
