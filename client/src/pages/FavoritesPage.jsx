import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductImage from '../components/ProductImage.jsx';
import NotifyForm from '../components/NotifyForm.jsx';
import LoadState from '../components/LoadState.jsx';
import { StockBadge } from '../components/Badges.jsx';
import { apiGet } from '../lib/api.js';
import { useFavorites } from '../lib/favorites.js';
import { formatPrice } from '../lib/format.js';
import usePageTitle from '../lib/usePageTitle.js';
import styles from './FavoritesPage.module.css';

/** Site map: Favorites/Watchlist (view saved products, select a saved product, price alerts). */
export default function FavoritesPage() {
  usePageTitle('Favorites / Watchlist');
  const { ids, remove } = useFavorites();
  const [state, setState] = useState({ key: null, products: [], error: null });
  const [attempt, setAttempt] = useState(0);
  const [alertsFor, setAlertsFor] = useState(null);
  const key = `${ids.join(',')}#${attempt}`;

  useEffect(() => {
    if (ids.length === 0) return undefined;
    const controller = new AbortController();
    Promise.all(
      ids.map((id) =>
        apiGet(`/products/${encodeURIComponent(id)}`, { signal: controller.signal })
          .then((body) => body.data)
          .catch((error) => {
            if (error.status === 404 || error.status === 400) return null;
            throw error;
          }),
      ),
    )
      .then((products) => setState({ key, products: products.filter(Boolean), error: null }))
      .catch((error) => error.name !== 'AbortError' && setState({ key, products: [], error }));
    return () => controller.abort();
  }, [ids, key]);

  const loading = ids.length > 0 && state.key !== key;
  const products = ids.length > 0 && !loading ? state.products : [];

  return (
    <section>
      <header className={styles.header}>
        <h1>Favorites / Watchlist</h1>
        <p className={styles.intro}>
          Products you save appear here with their current best price. Select one to return to its
          Product page, or turn on optional price-change alerts by email or phone. No account
          needed; your list is saved in this browser.
        </p>
      </header>

      {ids.length === 0 ? (
        <div className={styles.empty}>
          <h2>No saved products yet</h2>
          <p>
            Open any product and choose <strong>Save to Favorites</strong> to add it here.
          </p>
          <Link to="/search" className={styles.primary}>
            Search / Browse products
          </Link>
        </div>
      ) : (
        <>
          <LoadState
            loading={loading}
            error={state.key === key ? state.error : null}
            onRetry={() => setAttempt((n) => n + 1)}
            label="Loading saved products…"
          />
          {!loading && !state.error && (
            <>
              <p className={styles.count} aria-live="polite">
                {products.length} saved {products.length === 1 ? 'product' : 'products'}
              </p>
              <ul className={styles.list} aria-label="Saved products">
                {products.map((product) => {
                  const best = product.lowestPriceListing;
                  return (
                    <li key={product.product_id} className={styles.item}>
                      <Link to={`/product/${product.product_id}`} className={styles.thumb}>
                        <ProductImage product={product} />
                      </Link>
                      <div className={styles.body}>
                        <p className={styles.meta}>
                          {product.category.name} ·{' '}
                          {product.platforms.map((platform) => platform.name).join(', ')}
                        </p>
                        <h2 className={styles.name}>
                          <Link to={`/product/${product.product_id}`}>{product.name}</Link>
                        </h2>
                        {best ? (
                          <p className={styles.price}>
                            Best price <strong>{formatPrice(best.price)}</strong> at{' '}
                            {best.retailer.name} · <StockBadge inStock={best.in_stock} />
                          </p>
                        ) : (
                          <p className={styles.price}>No retailer currently lists this product.</p>
                        )}
                        <div className={styles.actions}>
                          <Link to={`/product/${product.product_id}`} className={styles.primary}>
                            View product &amp; prices
                          </Link>
                          <button
                            type="button"
                            className={styles.secondary}
                            aria-expanded={alertsFor === product.product_id}
                            onClick={() =>
                              setAlertsFor(
                                alertsFor === product.product_id ? null : product.product_id,
                              )
                            }
                          >
                            Price alerts
                          </button>
                          <button
                            type="button"
                            className={styles.secondary}
                            onClick={() => remove(product.product_id)}
                            aria-label={`Remove ${product.name} from favorites`}
                          >
                            Remove
                          </button>
                        </div>
                        {alertsFor === product.product_id && (
                          <div className={styles.alerts}>
                            <NotifyForm productId={product.product_id} productName={product.name} />
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </>
      )}
    </section>
  );
}
