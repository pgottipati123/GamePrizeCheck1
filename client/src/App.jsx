import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import SearchBrowsePage from './pages/SearchBrowsePage.jsx';
import FilterSortPage from './pages/FilterSortPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Routes follow the Level 3 Specification Revised Feature Chart (site map):
// GamePriceCheck > Search/Browse, Filter/Sort, Product Page (with price
// comparison), Favorites/Watchlist, About/Help.

// Price comparison now lives on the Product page; keep old links working.
function CompareRedirect() {
  const { id } = useParams();
  return <Navigate to={`/product/${id}`} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchBrowsePage />} />
        <Route path="filter" element={<FilterSortPage />} />
        <Route path="product/:id" element={<ProductPage />} />
        <Route path="compare/:id" element={<CompareRedirect />} />
        <Route path="favorites" element={<FavoritesPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
