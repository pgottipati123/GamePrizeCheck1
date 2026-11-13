// Search state lives in the URL so results can be bookmarked and shared.
const list = (params, key) => params.getAll(key).filter(Boolean);
const number = (value) => (value === null || value === '' ? null : Number(value));

export function readSearchState(params) {
  return {
    q: params.get('q') ?? '',
    category: params.get('category') ?? '',
    conditions: list(params, 'condition'),
    retailers: list(params, 'retailer'),
    makers: list(params, 'maker'),
    minPrice: number(params.get('minPrice')),
    maxPrice: number(params.get('maxPrice')),
    year: number(params.get('year')),
    sort: params.get('sort') ?? 'relevance',
  };
}

export function writeSearchState(state) {
  const params = new URLSearchParams();
  if (state.q) params.set('q', state.q);
  if (state.category) params.set('category', state.category);
  state.conditions?.forEach((value) => params.append('condition', value));
  state.retailers?.forEach((value) => params.append('retailer', value));
  state.makers?.forEach((value) => params.append('maker', value));
  if (state.minPrice !== null && state.minPrice !== undefined)
    params.set('minPrice', state.minPrice);
  if (state.maxPrice !== null && state.maxPrice !== undefined)
    params.set('maxPrice', state.maxPrice);
  if (state.year) params.set('year', state.year);
  if (state.sort && state.sort !== 'relevance') params.set('sort', state.sort);
  return params;
}

export function countActiveFilters(state) {
  return (
    state.conditions.length +
    state.retailers.length +
    state.makers.length +
    (state.minPrice !== null ? 1 : 0) +
    (state.maxPrice !== null ? 1 : 0) +
    (state.year ? 1 : 0)
  );
}

export const EMPTY_FILTERS = {
  conditions: [],
  retailers: [],
  makers: [],
  minPrice: null,
  maxPrice: null,
  year: null,
};
