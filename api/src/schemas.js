import { z } from 'zod';
import { CONDITIONS, LISTING_SORTS, SORTS } from './services/catalog.js';

const MAX_PRICE = 10000;
const asArray = (value) => (value === undefined ? [] : Array.isArray(value) ? value : [value]);
const optionalNumber = (schema) =>
  z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    schema.optional(),
  );
const centsOnly = (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6;
const price = z
  .number()
  .min(0)
  .max(MAX_PRICE)
  .refine(centsOnly, 'must have at most 2 decimal places');

export const idParam = z.object({ id: z.uuid('must be a valid UUID') });

export const productsQuery = z
  .object({
    q: z
      .string()
      .trim()
      .max(100, 'must be 100 characters or fewer')
      .refine((value) => value === '' || value.length >= 2, 'must be at least 2 characters')
      .default(''),
    category: z.string().trim().max(50).default(''),
    condition: z.preprocess(asArray, z.array(z.enum(CONDITIONS))),
    retailer: z.preprocess(asArray, z.array(z.uuid('must be a valid UUID'))),
    maker: z.preprocess(asArray, z.array(z.uuid('must be a valid UUID'))),
    minPrice: optionalNumber(z.coerce.number().min(0).max(MAX_PRICE)),
    maxPrice: optionalNumber(z.coerce.number().min(0).max(MAX_PRICE)),
    year: optionalNumber(z.coerce.number().int().min(1970).max(2100)),
    sort: z.enum(SORTS).default('relevance'),
    limit: optionalNumber(z.coerce.number().int().min(1).max(100)),
  })
  .refine(
    (query) =>
      query.minPrice === undefined ||
      query.maxPrice === undefined ||
      query.minPrice <= query.maxPrice,
    { message: 'must be greater than or equal to minPrice', path: ['maxPrice'] },
  );

export const listingsQuery = z.object({
  condition: z.enum(CONDITIONS).optional(),
  sort: z.enum(LISTING_SORTS).default('price_asc'),
});

export const filtersQuery = z.object({ category: z.string().trim().max(50).default('') });

export const dealsQuery = z.object({
  limit: optionalNumber(z.coerce.number().int().min(1).max(20)),
});

export const listingUpdate = z
  .strictObject({
    price: price.optional(),
    discount_amount: price.optional(),
    in_stock: z.boolean().optional(),
    condition: z.enum(CONDITIONS).optional(),
    product_url: z
      .url()
      .max(2048)
      .refine((value) => /^https?:\/\//.test(value), 'must start with http:// or https://')
      .optional(),
  })
  .refine((body) => Object.keys(body).length > 0, 'provide at least one field to update');
