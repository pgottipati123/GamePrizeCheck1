import { Link, useSearchParams } from 'react-router-dom';
import FilterPanel from '../components/FilterPanel.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import LoadState from '../components/LoadState.jsx';
import { SORT_OPTIONS } from '../lib/sortOptions.js';
import { useApi, useCategories } from '../lib/useApi.js';
import { EMPTY_FILTERS, readSearchState, writeSearchState } from '../lib/searchParams.js';
import usePageTitle from '../lib/usePageTitle.js';
import styles from './Results.module.css';

/** Site map: Filter/Sort (condition, price, retailer, developer, year, sort). */
export default function FilterSortPage() {
  usePageTitle('Filter / Sort');
  const [params, setParams] = useSearchParams();
  const state = readSearchState(params);
  const category = useCategories().find((c) => c.slug === state.category);
  const query = writeSearchState(state).toString();
  const products = useApi(`/products?${query}`);
  const filters = useApi(`/filters?${new URLSearchParams({ category: state.category })}`);
  const results = products.data ?? [];
  const update = (changes) => setParams(writeSearchState({ ...state, ...changes }));

  const scope = [state.q && `“${state.q}”`, category ? `in ${category.name}` : 'in all categories']
    .filter(Boolean)
    .join(' ');

  return (
    <section>
      <header className={styles.header}>
        <h1 className={styles.title}>Filter / Sort</h1>
        <p className={styles.intro}>
          Narrow products {scope} by condition, price, retailer, developer, and release year, then
          choose a sort order.
        </p>
      </header>

      <div className={styles.toolbar}>
        <p className={styles.count} aria-live="polite">
          {results.length} {results.length === 1 ? 'product' : 'products'} match
        </p>
        <label className={styles.sort}>
          <span>Sort by</span>
          <select value={state.sort} onChange={(event) => update({ sort: event.target.value })}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <Link to={`/search?${params}`} className={styles.secondaryLink}>
          Back to Search / Browse
        </Link>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <FilterPanel
            key={params.toString()}
            state={state}
            options={filters.data ?? { makers: [], retailers: [], years: [] }}
            onApply={update}
            onClear={() => update(EMPTY_FILTERS)}
          />
        </aside>
        <div>
          <LoadState
            loading={products.loading}
            error={products.error}
            onRetry={products.retry}
            label="Loading products…"
          />
          {products.data && (
            <ProductGrid products={results} onClearFilters={() => update(EMPTY_FILTERS)} />
          )}
        </div>
      </div>
    </section>
  );
}
