import { Link } from 'react-router-dom';
import usePageTitle from '../lib/usePageTitle.js';
import styles from './InfoPage.module.css';

export default function NotFoundPage({
  title = 'Page not found',
  message = "The page you're looking for doesn't exist or has moved.",
}) {
  usePageTitle(title);
  return (
    <article className={`${styles.page} ${styles.center}`}>
      <p className={styles.code}>404</p>
      <h1>{title}</h1>
      <p className={styles.lead}>{message}</p>
      <p className={styles.actions}>
        <Link to="/" className={styles.button}>
          Back to Home
        </Link>
        <Link to="/about">About / Help</Link>
      </p>
    </article>
  );
}
