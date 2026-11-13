import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import HomePage from './pages/HomePage.jsx';
import SearchBrowsePage from './pages/SearchBrowsePage.jsx';
import CompareIndexPage from './pages/CompareIndexPage.jsx';
import ComparePricesPage from './pages/ComparePricesPage.jsx';
import FilterSortPage from './pages/FilterSortPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Routes follow the Specification 2 Updated Feature Chart (site map):
// GamePriceCheck > Search/Browse, Compare Prices, Filter/Sort, View Product, About/Help.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchBrowsePage />} />
        <Route path="compare" element={<CompareIndexPage />} />
        <Route path="compare/:id" element={<ComparePricesPage />} />
        <Route path="filter" element={<FilterSortPage />} />
        <Route path="product/:id" element={<ProductPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
