import { useState } from 'react';
import { ConditionBadge, DiscountBadge, StockBadge } from './Badges.jsx';
import { CONDITION_LABELS, CONDITIONS, formatDateTime, formatPrice } from '../lib/format.js';
import styles from './ListingTable.module.css';

const OFFER_SORTS = {
  price_asc: { label: 'Price: low to high', compare: (a, b) => a.price - b.price },
  price_desc: { label: 'Price: high to low', compare: (a, b) => b.price - a.price },
  discount_desc: {
    label: 'Biggest discount',
    compare: (a, b) => b.discount_amount - a.discount_amount || a.price - b.price,
  },
  in_stock: {
    label: 'In stock first',
    compare: (a, b) => Number(b.in_stock) - Number(a.in_stock) || a.price - b.price,
  },
  retailer: {
    label: 'Retailer A–Z',
    compare: (a, b) => a.retailer.name.localeCompare(b.retailer.name),
  },
};

/** Side-by-side retailer offers for one product, with a condition filter. */
export default function ListingTable({ listings, bestListingId }) {
  const [condition, setCondition] = useState('all');
  const [sort, setSort] = useState('price_asc');
  const available = CONDITIONS.filter((value) => listings.some((l) => l.condition === value));
  const visible = (
    condition === 'all' ? listings : listings.filter((l) => l.condition === condition)
  ).toSorted(OFFER_SORTS[sort].compare);

  return (
    <div>
      <div className={styles.controls}>
        <div className={styles.tabs} role="group" aria-label="Filter offers by condition">
          {['all', ...available].map((value) => (
            <button
              key={value}
              type="button"
              className={styles.tab}
              aria-pressed={condition === value}
              onClick={() => setCondition(value)}
            >
              {value === 'all' ? 'All conditions' : CONDITION_LABELS[value]}
            </button>
          ))}
        </div>
        <label className={styles.sort}>
          <span>Sort offers</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)}>
            {Object.entries(OFFER_SORTS).map(([value, option]) => (
              <option key={value} value={value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ul className={styles.list} aria-label="Retailer offers">
        {visible.map((listing) => (
          <li
            key={listing.listing_id}
            className={`${styles.row} ${listing.listing_id === bestListingId ? styles.best : ''}`}
          >
            <div className={styles.retailer}>
              <span className={styles.retailerName}>{listing.retailer.name}</span>
              {listing.listing_id === bestListingId && (
                <span className={styles.bestLabel}>Best price</span>
              )}
              <span className={styles.updated}>Updated {formatDateTime(listing.last_updated)}</span>
            </div>
            <div className={styles.badges}>
              <ConditionBadge condition={listing.condition} />
              <StockBadge inStock={listing.in_stock} />
            </div>
            <div className={styles.pricing}>
              <span className={styles.price}>{formatPrice(listing.price)}</span>
              {listing.discount_amount > 0 && (
                <>
                  <s className={styles.original}>
                    <span className="visually-hidden">Regular price </span>
                    {formatPrice(listing.original_price)}
                  </s>
                  <DiscountBadge amount={listing.discount_amount} />
                </>
              )}
            </div>
            <a
              className={styles.go}
              href={listing.product_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Go to ${listing.retailer.name} (opens in a new tab)`}
            >
              Go to {listing.retailer.name}
              <span aria-hidden="true"> ↗</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
