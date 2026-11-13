import { Link, useSearchParams } from 'react-router-dom';
import SearchBar from '../components/SearchBar.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import LoadState from '../components/LoadState.jsx';
import { SORT_OPTIONS } from '../lib/sortOptions.js';
import { useApi, useCategories } from '../lib/useApi.js';
import {
  countActiveFilters,
  EMPTY_FILTERS,
  readSearchState,
  writeSearchState,
} from '../lib/searchParams.js';
import usePageTitle from '../lib/usePageTitle.js';
import styles from './Results.module.css';

/** Site map: Search/Browse (search games, consoles, accessories; browse categories; search details). */
export default function SearchBrowsePage() {
  usePageTitle('Search / Browse');
  const [params, setParams] = useSearchParams();
  const state = readSearchState(params);
  const categories = useCategories();
  const category = categories.find((c) => c.slug === state.category);
  const query = writeSearchState(state).toString();
  const { data, error, loading, retry } = useApi(`/products?${query}`);
  const results = data ?? [];
  const activeFilters = countActiveFilters(state);
  const sortLabel = SORT_OPTIONS.find((option) => option.value === state.sort)?.label;

  const categoryLink = (slug) => `/search?${writeSearchState({ ...state, category: slug })}`;
  const resultsHeading = state.q
    ? `Results for “${state.q}”${category ? ` in ${category.name}` : ''}`
    : category
      ? `Browsing ${category.name}`
      : 'All products';

  return (
    <section>
      <header className={styles.header}>
        <h1 className={styles.title}>Search / Browse</h1>
        <p className={styles.intro}>
          Search for physical games, consoles, and accessories, or browse a category.
        </p>
      </header>

      <div className={styles.searchBox}>
        <SearchBar
          key={`${state.q}|${state.category}`}
          size="large"
          showCategory
          initialQuery={state.q}
          initialCategory={state.category}
        />
        <ul className={styles.chips} aria-label="Browse categories">
          <li className={styles.chipsLabel}>Browse:</li>
          {[{ slug: '', name: 'All' }, ...categories].map((option) => (
            <li key={option.slug || 'all'}>
              <Link
                to={categoryLink(option.slug)}
                className={`${styles.chip} ${state.category === option.slug ? styles.chipActive : ''}`}
                aria-current={state.category === option.slug ? 'true' : undefined}
              >
                {option.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.count} aria-live="polite">
          <h2>{resultsHeading}</h2>{' '}
          <span className={styles.summary}>
            {results.length} {results.length === 1 ? 'product' : 'products'} · Sorted by{' '}
            {sortLabel ?? 'Relevance'}
            {activeFilters > 0 &&
              ` · ${activeFilters} ${activeFilters === 1 ? 'filter' : 'filters'} applied`}
          </span>
        </div>
        {activeFilters > 0 && (
          <button
            type="button"
            className={styles.secondaryLink}
            onClick={() => setParams(writeSearchState({ ...state, ...EMPTY_FILTERS }))}
          >
            Clear filters
          </button>
        )}
        <Link to={`/filter?${params}`} className={styles.primaryLink}>
          Filter / Sort results
        </Link>
      </div>

      <LoadState loading={loading} error={error} onRetry={retry} label="Loading products…" />
      {data && (
        <ProductGrid
          products={results}
          onClearFilters={
            activeFilters > 0
              ? () => setParams(writeSearchState({ ...state, ...EMPTY_FILTERS }))
              : undefined
          }
        />
      )}
    </section>
  );
}
