import { CONDITION_LABELS, formatPrice } from '../lib/format.js';
import styles from './Badges.module.css';

export function ConditionBadge({ condition }) {
  return (
    <span className={`${styles.badge} ${styles[condition]}`}>{CONDITION_LABELS[condition]}</span>
  );
}

export function StockBadge({ inStock }) {
  return (
    <span className={`${styles.badge} ${inStock ? styles.inStock : styles.outOfStock}`}>
      {inStock ? 'In stock' : 'Out of stock'}
    </span>
  );
}

export function DiscountBadge({ amount }) {
  if (!amount) return null;
  return <span className={`${styles.badge} ${styles.discount}`}>Save {formatPrice(amount)}</span>;
}
