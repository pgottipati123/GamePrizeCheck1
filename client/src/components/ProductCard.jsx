import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import { ConditionBadge, DiscountBadge } from './Badges.jsx';
import { formatPrice } from '../lib/format.js';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const retailerLabel = `${product.retailerCount} ${product.retailerCount === 1 ? 'retailer' : 'retailers'}`;
  return (
    <article className={styles.card}>
      <Link to={`/product/${product.product_id}`} className={styles.link}>
        <ProductImage product={product} />
        <div className={styles.body}>
          <p className={styles.meta}>
            {product.category.name} &middot; {product.release_year}
          </p>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.maker}>{product.maker.name}</p>
          <div className={styles.priceRow}>
            <span className={styles.from}>From</span>
            <span className={styles.price}>{formatPrice(product.lowestPrice)}</span>
            <DiscountBadge amount={product.maxDiscount} />
          </div>
          <p className={styles.summary}>
            {retailerLabel} &middot;{' '}
            {product.inStockCount > 0 ? `${product.inStockCount} in stock` : 'Out of stock'}
          </p>
          <div className={styles.badges}>
            {product.conditions.map((condition) => (
              <ConditionBadge key={condition} condition={condition} />
            ))}
          </div>
        </div>
      </Link>
    </article>
  );
}
