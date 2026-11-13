import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validateQuery } from '../lib/validation.js';
import { useCategories } from '../lib/useApi.js';
import styles from './SearchBar.module.css';

export default function SearchBar({
  initialQuery = '',
  initialCategory = '',
  showCategory = false,
  size = 'compact',
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const categories = useCategories();
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const inputId = `search-${size}`;
  const errorId = `${inputId}-error`;

  function handleSubmit(event) {
    event.preventDefault();
    const message = validateQuery(query);
    setError(message);
    if (message) return;
    const params = new URLSearchParams({ q: query.trim() });
    if (category) params.set('category', category);
    navigate(`/search?${params}`);
  }

  return (
    <form
      role="search"
      className={`${styles.form} ${styles[size]}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <label htmlFor={inputId} className="visually-hidden">
        Search games, consoles, and accessories
      </label>
      {showCategory && (
        <>
          <label htmlFor={`${inputId}-category`} className="visually-hidden">
            Search in category
          </label>
          <select
            id={`${inputId}-category`}
            className={styles.scope}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((option) => (
              <option key={option.slug} value={option.slug}>
                {option.name}
              </option>
            ))}
          </select>
        </>
      )}
      <input
        id={inputId}
        className={styles.input}
        type="search"
        placeholder="Search games, consoles, accessories…"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          if (error) setError('');
        }}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        autoComplete="off"
      />
      <button type="submit" className={styles.button}>
        Search
      </button>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
