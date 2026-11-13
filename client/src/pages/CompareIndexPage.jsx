import { Link } from 'react-router-dom';
import LoadState from '../components/LoadState.jsx';
import { useApi } from '../lib/useApi.js';
import { formatPrice } from '../lib/format.js';
import usePageTitle from '../lib/usePageTitle.js';
import styles from './Results.module.css';

/** Site map: Compare Prices — overview of every product's price range across sellers. */
export default function CompareIndexPage() {
  usePageTitle('Compare Prices');
  const { data: products, error, loading, retry } = useApi('/products');

  return (
    <section>
      <header className={styles.header}>
        <h1 className={styles.title}>Compare Prices</h1>
        <p className={styles.intro}>
          See each product&apos;s price range, number of sellers, best discount, and availability.
          Choose a product to compare every retailer offer side by side.
        </p>
      </header>
      <LoadState loading={loading} error={error} onRetry={retry} label="Loading prices…" />
      {products && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <caption className="visually-hidden">Price comparison overview</caption>
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Price range</th>
                <th scope="col">Sellers</th>
                <th scope="col">Best discount</th>
                <th scope="col">Availability</th>
                <th scope="col">
                  <span className="visually-hidden">Action</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.product_id}>
                  <td>
                    <Link to={`/product/${product.product_id}`}>{product.name}</Link>
                    <div className={styles.summary}>
                      {product.category.name} · {product.maker.name}
                    </div>
                  </td>
                  <td data-label="Price range">
                    {formatPrice(product.lowestPrice)} – {formatPrice(product.highestPrice)}
                  </td>
                  <td data-label="Sellers">{product.retailerCount}</td>
                  <td data-label="Best discount">
                    {product.maxDiscount > 0 ? `Save ${formatPrice(product.maxDiscount)}` : 'None'}
                  </td>
                  <td data-label="Availability">
                    {product.inStockCount} of {product.listings.length} in stock
                  </td>
                  <td>
                    <Link
                      to={`/compare/${product.product_id}`}
                      className={styles.primaryLink}
                      aria-label={`Compare prices for ${product.name}`}
                    >
                      Compare
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
