import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { fixtureProducts as products } from './test/fakeApi.js';

const ZELDA = products[0];
const PS5 = products[2];

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

const heading = () => screen.getByRole('heading', { level: 1 });
const expectTitle = (title) => waitFor(() => expect(heading()).toHaveTextContent(title));
const expectArticles = (n) => waitFor(() => expect(screen.getAllByRole('article')).toHaveLength(n));
const offers = () =>
  within(screen.getByRole('list', { name: 'Retailer offers' })).getAllByRole('listitem');

describe('routes map to the Specification 2 site map', () => {
  it.each([
    ['/', /find the best price/i],
    ['/search', 'Search / Browse'],
    ['/search?q=zelda', 'Search / Browse'],
    ['/compare', 'Compare Prices'],
    [`/compare/${PS5.product_id}`, `Compare Prices: ${PS5.name}`],
    ['/filter', 'Filter / Sort'],
    [`/product/${ZELDA.product_id}`, ZELDA.name],
    ['/about', 'About / Help'],
    ['/does-not-exist', 'Page not found'],
    ['/product/unknown', 'Product not found'],
    ['/compare/unknown', 'Product not found'],
  ])('%s shows a visible page title', async (path, title) => {
    renderAt(path);
    await expectTitle(title);
  });
});

describe('navigation', () => {
  it('reaches every site map section from the header', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const nav = screen.getByRole('navigation', { name: 'Main' });
    for (const [link, title] of [
      ['Search / Browse', 'Search / Browse'],
      ['Compare Prices', 'Compare Prices'],
      ['Filter / Sort', 'Filter / Sort'],
      ['About / Help', 'About / Help'],
      ['Home', /find the best price/i],
    ]) {
      await user.click(within(nav).getByRole('link', { name: link }));
      await expectTitle(title);
    }
  });

  it('goes Search/Browse → View Product → Compare Prices → back to Home', async () => {
    const user = userEvent.setup();
    renderAt('/search?category=consoles');
    await user.click(await screen.findByRole('link', { name: /Xbox Series X Console/ }));
    await expectTitle('Xbox Series X Console (1TB)');
    await user.click(await screen.findByRole('link', { name: /Compare all 3 prices/ }));
    await expectTitle('Compare Prices: Xbox Series X Console (1TB)');
    await user.click(screen.getByRole('link', { name: 'GamePriceCheck home' }));
    await expectTitle(/find the best price/i);
  });
});

describe('Search / Browse', () => {
  it('validates the search, then shows results', async () => {
    const user = userEvent.setup();
    renderAt('/');
    const header = screen.getByRole('banner');
    const input = within(header).getByRole('searchbox');
    const submit = within(header).getByRole('button', { name: 'Search' });

    await user.click(submit);
    expect(within(header).getByRole('alert')).toHaveTextContent(/enter a game/i);

    await user.type(input, 'z');
    await user.click(submit);
    expect(within(header).getByRole('alert')).toHaveTextContent(/at least 2 characters/i);

    await user.type(input, 'elda');
    await user.click(submit);
    await expectTitle('Search / Browse');
    expect(screen.getByRole('heading', { name: 'Results for “zelda”' })).toBeInTheDocument();
    await expectArticles(1);
  });

  it('searches within a category (search consoles)', async () => {
    const user = userEvent.setup();
    renderAt('/search');
    const main = screen.getByRole('main');
    await within(main).findByRole('option', { name: 'Consoles' });
    await user.selectOptions(within(main).getByLabelText('Search in category'), 'consoles');
    await user.type(within(main).getByRole('searchbox'), 'xbox');
    await user.click(within(main).getByRole('button', { name: 'Search' }));
    expect(screen.getByRole('heading', { name: 'Results for “xbox” in Consoles' })).toBeVisible();
    await expectArticles(1);
  });

  it('browses categories', async () => {
    const user = userEvent.setup();
    renderAt('/');
    await user.click(await screen.findByRole('link', { name: /^Accessories/ }));
    expect(screen.getByRole('heading', { name: 'Browsing Accessories' })).toBeInTheDocument();
    await expectArticles(4);
    const chips = screen.getByRole('list', { name: 'Browse categories' });
    await user.click(within(chips).getByRole('link', { name: 'Games' }));
    await expectArticles(6);
  });
});

describe('Filter / Sort', () => {
  it('validates the price range before applying', async () => {
    const user = userEvent.setup();
    renderAt('/filter?category=games');
    const filters = screen.getByRole('form', { name: 'Filter results' });
    await user.type(within(filters).getByLabelText('Min price ($)'), '60');
    await user.type(within(filters).getByLabelText('Max price ($)'), '20');
    await user.click(within(filters).getByRole('button', { name: 'Apply filters' }));
    expect(within(filters).getByRole('alert')).toHaveTextContent(/greater than or equal/i);
    expect(await screen.findByText('6 products match')).toBeInTheDocument();
  });

  it('applies filters, carries them back to Search / Browse, and clears them', async () => {
    const user = userEvent.setup();
    renderAt('/search?category=consoles');
    await user.click(screen.getByRole('link', { name: 'Filter / Sort results' }));
    await expectTitle('Filter / Sort');
    const filters = () => screen.getByRole('form', { name: 'Filter results' });
    await user.click(within(filters()).getByRole('checkbox', { name: 'Refurbished' }));
    await user.click(within(filters()).getByRole('button', { name: 'Apply filters' }));
    expect(await screen.findByText('2 products match')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Back to Search / Browse' }));
    await expectArticles(2);
    expect(await screen.findByText(/1 filter applied/)).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: 'Clear filters' })[0]);
    await expectArticles(3);
  });

  it('sorts results by price', async () => {
    const user = userEvent.setup();
    renderAt('/filter?category=consoles');
    await user.selectOptions(screen.getByLabelText('Sort by'), 'price_asc');
    await waitFor(() => {
      const names = screen.getAllByRole('article').map((card) => within(card).getByRole('heading'));
      expect(names.map((h) => h.textContent)).toEqual([
        'Nintendo Switch - OLED Model',
        'PlayStation 5 Console (Slim, Disc Edition)',
        'Xbox Series X Console (1TB)',
      ]);
    });
  });
});

describe('View Product', () => {
  it('shows image, maker, best price, discount, condition, availability, and Go to seller', async () => {
    renderAt(`/product/${ZELDA.product_id}`);
    expect(await screen.findByRole('img', { name: /Tears of the Kingdom/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nintendo' })).toBeInTheDocument();
    expect(screen.getByText('Best price')).toBeInTheDocument();
    expect(screen.getByText(/Used at GameStop/)).toBeInTheDocument();
    const go = screen.getByRole('link', { name: /Go to GameStop/ });
    expect(go).toHaveAttribute('target', '_blank');
    expect(go).toHaveAttribute('rel', 'noopener noreferrer');
  });
});

describe('Compare Prices', () => {
  it('lists every product with a link to its comparison', async () => {
    const user = userEvent.setup();
    renderAt('/compare');
    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(products.length + 1));
    await user.click(await screen.findByRole('link', { name: `Compare prices for ${ZELDA.name}` }));
    await expectTitle(`Compare Prices: ${ZELDA.name}`);
  });

  it('compares sellers with discounts, availability, sorting, and safe links', async () => {
    const user = userEvent.setup();
    renderAt(`/compare/${ZELDA.product_id}`);
    await waitFor(() => expect(offers()).toHaveLength(4));
    expect(within(offers()[0]).getByText('GameStop')).toBeInTheDocument();
    for (const offer of offers()) {
      const link = within(offer).getByRole('link', { name: /go to/i });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link.getAttribute('href')).toMatch(/^https:\/\//);
    }
    expect(screen.getAllByText('Out of stock').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Save \$/).length).toBeGreaterThan(0);

    await user.selectOptions(screen.getByLabelText('Sort offers'), 'price_desc');
    expect(within(offers()[0]).getByText('Best Buy')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Used' }));
    expect(offers()).toHaveLength(1);
  });
});
