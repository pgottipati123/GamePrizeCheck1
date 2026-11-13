// Pure catalog logic: turns rows from the seven Specification 2 tables into
// search results, product details, and price comparisons. No I/O happens here,
// so it can be unit-tested with fixture rows.

export const CONDITIONS = ['new', 'used', 'refurbished'];
export const SORTS = ['relevance', 'price_asc', 'price_desc', 'discount_desc', 'newest'];
export const LISTING_SORTS = ['price_asc', 'price_desc', 'discount_desc', 'in_stock', 'retailer'];

export const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const money = (value) => Number(Number(value).toFixed(2));
const byId = (rows, key) => new Map(rows.map((row) => [row[key], row]));

const LISTING_COMPARATORS = {
  price_asc: (a, b) => a.price - b.price,
  price_desc: (a, b) => b.price - a.price,
  discount_desc: (a, b) => b.discount_amount - a.discount_amount || a.price - b.price,
  in_stock: (a, b) => Number(b.in_stock) - Number(a.in_stock) || a.price - b.price,
  retailer: (a, b) => a.retailer.name.localeCompare(b.retailer.name),
};

export function createCatalog(data) {
  const listings = data.listings.map((listing) => ({
    ...listing,
    price: money(listing.price),
    discount_amount: money(listing.discount_amount ?? 0),
  }));
  const makersById = byId(data.makers, 'maker_id');
  const categoriesById = byId(data.categories, 'category_id');
  const retailersById = byId(data.retailers, 'retailer_id');
  const platformsById = byId(data.platforms, 'platform_id');

  function listCategories() {
    return [...data.categories]
      .sort((a, b) => a.display_order - b.display_order)
      .map((category) => ({ ...category, slug: slugify(category.name) }));
  }

  function getCategoryBySlug(slug) {
    return listCategories().find((category) => category.slug === slug) ?? null;
  }

  function platformsFor(productId) {
    return data.productPlatforms
      .filter((link) => link.product_id === productId)
      .map((link) => platformsById.get(link.platform_id))
      .filter(Boolean);
  }

  function withRetailer(listing) {
    return {
      ...listing,
      retailer: retailersById.get(listing.retailer_id),
      original_price: money(listing.price + listing.discount_amount),
    };
  }

  function activeListings(productId) {
    return listings
      .filter((listing) => listing.product_id === productId)
      .filter((listing) => retailersById.get(listing.retailer_id)?.active)
      .map(withRetailer);
  }

  function expand(product) {
    const category = categoriesById.get(product.category_id);
    return {
      ...product,
      category: { ...category, slug: slugify(category.name) },
      maker: makersById.get(product.maker_id),
      platforms: platformsFor(product.product_id),
    };
  }

  function summarize(product, productListings) {
    const inStock = productListings.filter((listing) => listing.in_stock);
    const pool = inStock.length > 0 ? inStock : productListings;
    const best = pool.reduce((low, listing) => (listing.price < low.price ? listing : low));
    return {
      ...product,
      listings: productListings,
      lowestPrice: best.price,
      lowestPriceListing: best,
      highestPrice: Math.max(...productListings.map((listing) => listing.price)),
      maxDiscount: Math.max(...productListings.map((listing) => listing.discount_amount)),
      retailerCount: new Set(productListings.map((listing) => listing.retailer_id)).size,
      inStockCount: inStock.length,
      conditions: [...new Set(productListings.map((listing) => listing.condition))],
    };
  }

  function relevance(product, terms) {
    const name = product.name.toLowerCase();
    return terms.reduce((score, term) => {
      if (name.startsWith(term)) return score + 3;
      if (name.includes(term)) return score + 2;
      return score + 1;
    }, 0);
  }

  function matches(product, terms) {
    const haystack = [
      product.name,
      product.maker?.name,
      product.category.name,
      ...product.platforms.map((platform) => platform.name),
    ]
      .join(' ')
      .toLowerCase();
    return terms.every((term) => haystack.includes(term));
  }

  /**
   * Product-level filters: q, category (slug), makers, year.
   * Listing-level filters: conditions, minPrice, maxPrice, retailers. A product is
   * returned when at least one active listing passes, summarized from those listings.
   */
  function searchProducts({
    q = '',
    category = '',
    conditions = [],
    minPrice = null,
    maxPrice = null,
    retailers = [],
    makers = [],
    year = null,
    sort = 'relevance',
  } = {}) {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    const results = data.products
      .map(expand)
      .filter((product) => !category || product.category.slug === category)
      .filter((product) => makers.length === 0 || makers.includes(product.maker_id))
      .filter((product) => year == null || product.release_year === Number(year))
      .filter((product) => matches(product, terms))
      .map((product) => {
        const matching = activeListings(product.product_id).filter(
          (listing) =>
            (conditions.length === 0 || conditions.includes(listing.condition)) &&
            (retailers.length === 0 || retailers.includes(listing.retailer_id)) &&
            (minPrice == null || listing.price >= minPrice) &&
            (maxPrice == null || listing.price <= maxPrice),
        );
        return matching.length > 0 ? summarize(product, matching) : null;
      })
      .filter(Boolean);

    const comparators = {
      relevance: (a, b) =>
        relevance(b, terms) - relevance(a, terms) || a.name.localeCompare(b.name),
      price_asc: (a, b) => a.lowestPrice - b.lowestPrice,
      price_desc: (a, b) => b.lowestPrice - a.lowestPrice,
      discount_desc: (a, b) => b.maxDiscount - a.maxDiscount || a.lowestPrice - b.lowestPrice,
      newest: (a, b) =>
        (b.release_year ?? 0) - (a.release_year ?? 0) || a.name.localeCompare(b.name),
    };
    return results.sort(comparators[sort] ?? comparators.relevance);
  }

  function getProductDetail(productId) {
    const product = data.products.find((row) => row.product_id === productId);
    if (!product) return null;
    const productListings = activeListings(productId).sort(LISTING_COMPARATORS.in_stock);
    if (productListings.length === 0) {
      return {
        ...expand(product),
        listings: [],
        lowestPrice: null,
        lowestPriceListing: null,
        highestPrice: null,
        maxDiscount: 0,
        retailerCount: 0,
        inStockCount: 0,
        conditions: [],
      };
    }
    return summarize(expand(product), productListings);
  }

  function getProductListings(productId, { condition = null, sort = 'price_asc' } = {}) {
    if (!data.products.some((row) => row.product_id === productId)) return null;
    return activeListings(productId)
      .filter((listing) => !condition || listing.condition === condition)
      .sort(LISTING_COMPARATORS[sort] ?? LISTING_COMPARATORS.price_asc);
  }

  function getTopDeals(limit = 4) {
    return searchProducts({ sort: 'discount_desc' })
      .filter((product) => product.maxDiscount > 0)
      .slice(0, limit);
  }

  /** Filter choices that exist in the data, optionally limited to one category. */
  function getFilterOptions(categorySlug = '') {
    const inScope = data.products
      .map(expand)
      .filter((product) => !categorySlug || product.category.slug === categorySlug);
    const scopedIds = new Set(inScope.map((product) => product.product_id));
    const usedRetailerIds = new Set(
      listings
        .filter(
          (listing) =>
            scopedIds.has(listing.product_id) && retailersById.get(listing.retailer_id)?.active,
        )
        .map((listing) => listing.retailer_id),
    );
    const usedMakerIds = new Set(inScope.map((product) => product.maker_id));
    return {
      makers: data.makers
        .filter((maker) => usedMakerIds.has(maker.maker_id))
        .sort((a, b) => a.name.localeCompare(b.name)),
      retailers: data.retailers
        .filter((retailer) => usedRetailerIds.has(retailer.retailer_id))
        .sort((a, b) => a.name.localeCompare(b.name)),
      years: [...new Set(inScope.map((product) => product.release_year).filter(Boolean))].sort(
        (a, b) => b - a,
      ),
    };
  }

  return {
    listCategories,
    getCategoryBySlug,
    searchProducts,
    getProductDetail,
    getProductListings,
    getTopDeals,
    getFilterOptions,
  };
}
