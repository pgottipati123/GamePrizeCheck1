import { Link, NavLink, Outlet, useLocation, useSearchParams } from 'react-router-dom';
import SearchBar from './SearchBar.jsx';
import styles from './Layout.module.css';

const navClass = ({ isActive }) =>
  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink;

export default function Layout() {
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const query = pathname === '/search' ? (params.get('q') ?? '') : '';

  return (
    <div className={styles.app}>
      <a className={styles.skipLink} href="#main">
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link to="/" className={styles.brand} aria-label="GamePriceCheck home">
            <img src="/icon.svg" alt="" width="28" height="28" />
            <span>
              Game<span className={styles.brandAccent}>Price</span>Check
            </span>
          </Link>
          <SearchBar key={query} initialQuery={query} />
        </div>
        <nav aria-label="Main" className={styles.nav}>
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>
          <NavLink to="/search" className={navClass}>
            Search / Browse
          </NavLink>
          <NavLink to="/compare" className={navClass}>
            Compare Prices
          </NavLink>
          <NavLink to="/filter" className={navClass}>
            Filter / Sort
          </NavLink>
          <NavLink to="/about" className={navClass}>
            About / Help
          </NavLink>
        </nav>
      </header>
      <main id="main" className={styles.main}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        <p>
          GamePriceCheck compares prices for physical games, consoles, and accessories. We do not
          sell products; purchases are completed on each retailer&apos;s website.
        </p>
        <p>Prototype 2 &middot; Prices shown are sample data.</p>
      </footer>
    </div>
  );
}
