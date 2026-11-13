import styles from './LoadState.module.css';

/** Loading and error states for data fetched from the API. */
export default function LoadState({ loading, error, onRetry, label = 'Loading…' }) {
  if (loading) {
    return (
      <p className={styles.loading} role="status">
        {label}
      </p>
    );
  }
  if (error) {
    return (
      <div className={styles.error} role="alert">
        <p>{error.message}</p>
        {onRetry && (
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  }
  return null;
}
