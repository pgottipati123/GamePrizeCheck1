import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductImage from '../components/ProductImage.jsx';
import { ConditionBadge, DiscountBadge, StockBadge } from '../components/Badges.jsx';
import NotFoundPage from './NotFoundPage.jsx';
import LoadState from '../components/LoadState.jsx';
import { useApi } from '../lib/useApi.js';
import { formatPrice } from '../lib/format.js';
import usePageTitle from '../lib/usePageTitle.js';
import styles from './ProductPage.module.css';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: product, error, loading, retry } = useApi(`/products/${encodeURIComponent(id)}`);
  usePageTitle(loading ? 'Loading product' : product ? product.name : 'Product not found');

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

  const best = product.lowestPriceListing;
  const savings = product.highestPrice - product.lowestPrice;

  return (
    <article>
      <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
        <button type="button" className={styles.back} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to={`/search?category=${product.category.slug}`}>{product.category.name}</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className={styles.top}>
        <ProductImage product={product} size="detail" />
        <div className={styles.info}>
          <h1 className={styles.title}>{product.name}</h1>
          <dl className={styles.facts}>
            <div>
              <dt>Maker / developer</dt>
              <dd>
                {product.maker.website_url ? (
                  <a href={product.maker.website_url} target="_blank" rel="noopener noreferrer">
                    {product.maker.name}
                  </a>
                ) : (
                  product.maker.name
                )}
              </dd>
            </div>
            <div>
              <dt>Platform</dt>
              <dd>{product.platforms.map((platform) => platform.name).join(', ')}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{product.category.name}</dd>
            </div>
            <div>
              <dt>Release year</dt>
              <dd>{product.release_year ?? 'Unknown'}</dd>
            </div>
          </dl>
          {product.description && <p className={styles.description}>{product.description}</p>}

          {best ? (
            <div className={styles.bestBox}>
              <p className={styles.bestLabel}>Best price</p>
              <p className={styles.bestPrice}>
                {formatPrice(best.price)}
                <DiscountBadge amount={best.discount_amount} />
              </p>
              <p className={styles.bestMeta}>
                {best.condition.charAt(0).toUpperCase() + best.condition.slice(1)} at{' '}
                {best.retailer.name} · <StockBadge inStock={best.in_stock} />
              </p>
              <a
                className={styles.bestGo}
                href={best.product_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Go to {best.retailer.name} <span aria-hidden="true">↗</span>
              </a>
            </div>
          ) : (
            <p className={styles.bestMeta}>No retailer currently lists this product.</p>
          )}
        </div>
      </div>

      {best && (
        <section aria-labelledby="compare-heading" className={styles.compare}>
          <h2 id="compare-heading">Retailer offers</h2>
          <p className={styles.compareIntro}>
            {product.listings.length} offers from {product.retailerCount} retailers · prices from{' '}
            {formatPrice(product.lowestPrice)} to {formatPrice(product.highestPrice)}
            {savings > 0 && ` · save up to ${formatPrice(savings)} by comparing`} ·{' '}
            {product.inStockCount} in stock. Purchases are completed on the retailer&apos;s website.
          </p>
          <p className={styles.conditions}>
            Available conditions:{' '}
            {product.conditions.map((condition) => (
              <ConditionBadge key={condition} condition={condition} />
            ))}
          </p>
          <Link to={`/compare/${product.product_id}`} className={styles.compareLink}>
            Compare all {product.listings.length} prices
          </Link>
        </section>
      )}
    </article>
  );
}
