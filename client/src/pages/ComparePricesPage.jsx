import { Link, useParams } from 'react-router-dom';
import ListingTable from '../components/ListingTable.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import LoadState from '../components/LoadState.jsx';
import { useApi } from '../lib/useApi.js';
import { formatPrice } from '../lib/format.js';
import usePageTitle from '../lib/usePageTitle.js';
import styles from './Results.module.css';

/** Site map: Compare Prices (view prices, compare sellers, discounts, availability) for one product. */
export default function ComparePricesPage() {
  const { id } = useParams();
  const { data: product, error, loading, retry } = useApi(`/products/${encodeURIComponent(id)}`);
  usePageTitle(
    loading ? 'Loading product' : product ? `Compare Prices: ${product.name}` : 'Product not found',
  );

  if (loading || (error && ![400, 404].includes(error.status))) {
    return (
      <section>
        <h1>{loading ? 'Loading product…' : 'Product unavailable'}</h1>
        <LoadState loading={loading} error={error} onRetry={retry} />
      </section>
    );
  }

  if (!product) {
    return (
      <NotFoundPage
        title="Product not found"
        message="This product doesn't exist or is no longer listed."
      />
    );
  }

  return (
    <section>
      <header className={styles.header}>
        <p className={styles.summary}>
          <Link to="/compare">← All price comparisons</Link>
        </p>
        <h1 className={styles.title}>Compare Prices: {product.name}</h1>
        <p className={styles.intro}>
          {product.listings.length} offers from {product.retailerCount} retailers.{' '}
          <Link to={`/product/${product.product_id}`}>View product details</Link>
        </p>
      </header>

      <dl className={styles.stats}>
        <div>
          <dt>Lowest price</dt>
          <dd>{formatPrice(product.lowestPrice)}</dd>
        </div>
        <div>
          <dt>Highest price</dt>
          <dd>{formatPrice(product.highestPrice)}</dd>
        </div>
        <div>
          <dt>Best discount</dt>
          <dd>{product.maxDiscount > 0 ? formatPrice(product.maxDiscount) : 'None'}</dd>
        </div>
        <div>
          <dt>In stock</dt>
          <dd>
            {product.inStockCount} of {product.listings.length}
          </dd>
        </div>
      </dl>

      <ListingTable
        listings={product.listings}
        bestListingId={product.lowestPriceListing?.listing_id}
      />
    </section>
  );
}
