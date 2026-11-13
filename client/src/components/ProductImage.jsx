import styles from './ProductImage.module.css';

const ICONS = {
  games: (
    <path d="M14 10h36a4 4 0 0 1 4 4v36a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V14a4 4 0 0 1 4-4zm4 8v28h28V18H18zm6 6h16v4H24v-4zm0 8h10v4H24v-4z" />
  ),
  consoles: (
    <path d="M8 20h48a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V24a4 4 0 0 1 4-4zm4 8v8h22v-8H12zm34 2a3 3 0 1 0 0 .01zm6 0a3 3 0 1 0 0 .01z" />
  ),
  accessories: (
    <path d="M20 18h24c8 0 14 8 14 18 0 7-3 11-7 11-3 0-5-2-7-5H20c-2 3-4 5-7 5-4 0-7-4-7-11 0-10 6-18 14-18zm-3 8v4h-4v4h4v4h4v-4h4v-4h-4v-4h-4zm26 1a2.5 2.5 0 1 0 0 .01zm5 5a2.5 2.5 0 1 0 0 .01z" />
  ),
};

/** Shows the product image, or a category illustration when image_url is empty. */
export default function ProductImage({ product, size = 'card' }) {
  const className = `${styles.frame} ${styles[size]} ${styles[product.category.slug] ?? ''}`;
  if (product.image_url) {
    return (
      <div className={className}>
        <img className={styles.photo} src={product.image_url} alt={product.name} loading="lazy" />
      </div>
    );
  }
  return (
    <div className={className} role="img" aria-label={`${product.name} (image placeholder)`}>
      <svg viewBox="0 0 64 64" className={styles.icon} aria-hidden="true">
        {ICONS[product.category.slug] ?? ICONS.games}
      </svg>
      <span className={styles.caption}>{product.platforms.map((p) => p.name).join(' · ')}</span>
    </div>
  );
}
