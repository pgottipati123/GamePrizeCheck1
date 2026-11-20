import { describe, expect, it } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { fixtureProducts as products, notificationRequests } from './test/fakeApi.js';

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

describe('routes map to the Level 3 Specification site map', () => {
  it.each([
    ['/', /find the best price/i],
    ['/search', 'Search / Browse'],
    ['/search?q=zelda', 'Search / Browse'],
    [`/compare/${PS5.product_id}`, PS5.name],
    ['/favorites', 'Favorites / Watchlist'],
    ['/filter', 'Filter / Sort'],
    [`/product/${ZELDA.product_id}`, ZELDA.name],
    ['/about', 'About / Help'],
    ['/does-not-exist', 'Page not found'],
    ['/product/unknown', 'Product not found'],
    ['/compare', 'Page not found'],
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
    expect(within(nav).queryByRole('link', { name: /Compare Prices/ })).toBeNull();
    for (const [link, title] of [
      ['Search / Browse', 'Search / Browse'],
      ['Filter / Sort', 'Filter / Sort'],
      ['Favorites / Watchlist', 'Favorites / Watchlist'],
      ['About / Help', 'About / Help'],
      ['Home', /find the best price/i],
    ]) {
      await user.click(within(nav).getByRole('link', { name: link }));
      await expectTitle(title);
    }
  });

  it('goes Search/Browse → Product page (with price comparison) → back to Home', async () => {
    const user = userEvent.setup();
    renderAt('/search?category=consoles');
    await user.click(await screen.findByRole('link', { name: /Xbox Series X Console/ }));
    await expectTitle('Xbox Series X Console (1TB)');
    await waitFor(() => expect(offers()).toHaveLength(3));
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

describe('Product page', () => {
  it('shows image, maker, best price, discount, condition, and availability', async () => {
    renderAt(`/product/${ZELDA.product_id}`);
    expect(await screen.findByRole('img', { name: /Tears of the Kingdom/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Nintendo' })).toBeInTheDocument();
    expect(screen.getAllByText('Best price').length).toBeGreaterThan(0);
    expect(screen.getByText(/Used at GameStop/)).toBeInTheDocument();
  });

  it('compares every retailer listing on the same page, with sorting and condition tabs', async () => {
    const user = userEvent.setup();
    renderAt(`/product/${ZELDA.product_id}`);
    await waitFor(() => expect(offers()).toHaveLength(4));
    expect(screen.getByRole('heading', { name: 'Compare prices' })).toBeInTheDocument();
    expect(within(offers()[0]).getByText('GameStop')).toBeInTheDocument();
    expect(screen.getAllByText('Out of stock').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Save \$/).length).toBeGreaterThan(0);

    await user.selectOptions(screen.getByLabelText('Sort offers'), 'price_desc');
    expect(within(offers()[0]).getByText('Best Buy')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Used' }));
    expect(offers()).toHaveLength(1);
  });

  it('confirms before redirecting to a retailer, then opens it safely in a new tab', async () => {
    const user = userEvent.setup();
    renderAt(`/product/${ZELDA.product_id}`);
    await waitFor(() => expect(offers()).toHaveLength(4));
    expect(screen.queryByRole('link', { name: /go to/i })).toBeNull();

    await user.click(within(offers()[0]).getByRole('button', { name: /Go to GameStop/ }));
    const dialog = screen.getByRole('dialog', { name: 'You are leaving GamePriceCheck' });
    const go = within(dialog).getByRole('link', { name: 'Continue to GameStop' });
    expect(go).toHaveAttribute('target', '_blank');
    expect(go).toHaveAttribute('rel', 'noopener noreferrer');
    expect(go.getAttribute('href')).toMatch(/^https:\/\//);

    await user.click(within(dialog).getByRole('button', { name: 'Stay on GamePriceCheck' }));
    expect(screen.queryByRole('dialog')).toBeNull();

    await user.click(within(offers()[1]).getByRole('button', { name: /Go to/ }));
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('Favorites / Watchlist', () => {
  it('saves products, lists them, returns to the Product page, and removes them', async () => {
    const user = userEvent.setup();
    renderAt('/favorites');
    expect(await screen.findByText('No saved products yet')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Search / Browse products' }));
    await user.click(await screen.findByRole('link', { name: new RegExp(ZELDA.name) }));
    await user.click(await screen.findByRole('button', { name: /Save to Favorites/ }));
    expect(screen.getByRole('button', { name: /Saved to Favorites/ })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'View Favorites / Watchlist' }));
    await expectTitle('Favorites / Watchlist');
    const saved = await screen.findByRole('list', { name: 'Saved products' });
    expect(within(saved).getAllByRole('listitem')).toHaveLength(1);
    expect(within(saved).getByText(/Best price/)).toBeInTheDocument();

    await user.click(within(saved).getByRole('link', { name: ZELDA.name }));
    await expectTitle(ZELDA.name);
    expect(screen.getByRole('button', { name: /Saved to Favorites/ })).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'View Favorites / Watchlist' }));
    await user.click(
      await screen.findByRole('button', { name: `Remove ${ZELDA.name} from favorites` }),
    );
    expect(await screen.findByText('No saved products yet')).toBeInTheDocument();
  });
});

describe('Price-change notifications', () => {
  it('validates the email or phone, then saves the request without an account', async () => {
    const user = userEvent.setup();
    renderAt(`/product/${ZELDA.product_id}`);
    await user.click(await screen.findByRole('button', { name: 'Price-change alerts' }));
    const form = screen.getByRole('form', { name: `Price alerts for ${ZELDA.name}` });

    await user.click(within(form).getByRole('button', { name: 'Notify me' }));
    expect(within(form).getByRole('alert')).toHaveTextContent('Enter an email address.');
    await user.type(within(form).getByLabelText('Email address'), 'not-an-email');
    await user.click(within(form).getByRole('button', { name: 'Notify me' }));
    expect(within(form).getByRole('alert')).toHaveTextContent('Enter a valid email address.');

    await user.click(within(form).getByRole('radio', { name: 'Phone (text)' }));
    await user.type(within(form).getByLabelText('Phone number'), '12');
    await user.click(within(form).getByRole('button', { name: 'Notify me' }));
    expect(within(form).getByRole('alert')).toHaveTextContent(/valid phone number/);
    await user.clear(within(form).getByLabelText('Phone number'));
    await user.type(within(form).getByLabelText('Phone number'), '(530) 555-0123');
    await user.click(within(form).getByRole('button', { name: 'Notify me' }));

    expect(await screen.findByRole('status')).toHaveTextContent(/You're set/);
    expect(notificationRequests).toEqual([
      { product_id: ZELDA.product_id, phone: '(530) 555-0123' },
    ]);
  });
});
