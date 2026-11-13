import { Link } from 'react-router-dom';
import ProductCard from './ProductCard.jsx';
import styles from './ProductGrid.module.css';

export default function ProductGrid({ products, onClearFilters }) {
  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>No matching products</h2>
        <p>Try a different search term or category, or remove some filters.</p>
        <div className={styles.emptyActions}>
          {onClearFilters && (
            <button type="button" onClick={onClearFilters}>
              Clear filters
            </button>
          )}
          <Link to="/">Back to Home</Link>
        </div>
      </div>
    );
  }
  return (
    <ul className={styles.grid}>
      {products.map((product) => (
        <li key={product.product_id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}
