import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import ProductCard from '../components/ProductCard.jsx';
import LoadState from '../components/LoadState.jsx';
import { useApi, useCategories } from '../lib/useApi.js';
import usePageTitle from '../lib/usePageTitle.js';
import styles from './HomePage.module.css';

export default function HomePage() {
  usePageTitle('Home');
  const categories = useCategories();
  const deals = useApi('/deals?limit=4');

  return (
    <>
      <section className={styles.hero}>
        <h1 className={styles.heading}>Find the best price on physical games and gear</h1>
        <p className={styles.lead}>
          Compare new, used, and refurbished prices from major retailers, then buy where the deal is
          best.
        </p>
        <SearchBar size="large" showCategory />
        <p className={styles.examples}>
          Try:{' '}
          {['Zelda', 'PlayStation 5', 'controller'].map((term, index) => (
            <span key={term}>
              {index > 0 && ', '}
              <Link to={`/search?q=${encodeURIComponent(term)}`}>{term}</Link>
            </span>
          ))}
        </p>
      </section>

      <section aria-labelledby="browse-heading" className={styles.section}>
        <h2 id="browse-heading" className={styles.subheading}>
          Browse by category
        </h2>
        <ul className={styles.categories}>
          {categories.map((category) => (
            <li key={category.category_id}>
              <Link to={`/search?category=${category.slug}`} className={styles.category}>
                <span className={styles.categoryName}>{category.name}</span>
                <span className={styles.categoryDescription}>{category.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="deals-heading" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 id="deals-heading" className={styles.subheading}>
            Top deals right now
          </h2>
          <Link to="/filter?sort=discount_desc">See all deals</Link>
        </div>
        <LoadState loading={deals.loading} error={deals.error} onRetry={deals.retry} />
        {deals.data && (
          <ul className={styles.deals}>
            {deals.data.map((product) => (
              <li key={product.product_id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
