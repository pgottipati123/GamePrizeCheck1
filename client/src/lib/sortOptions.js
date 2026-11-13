// Values match the `sort` query parameter accepted by GET /api/products.
export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'discount_desc', label: 'Biggest discount' },
  { value: 'newest', label: 'Newest release' },
];
