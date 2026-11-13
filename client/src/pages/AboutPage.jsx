import { Link } from 'react-router-dom';
import { CONDITION_HELP, CONDITION_LABELS, CONDITIONS } from '../lib/format.js';
import usePageTitle from '../lib/usePageTitle.js';
import styles from './InfoPage.module.css';

export default function AboutPage() {
  usePageTitle('About / Help');
  return (
    <article className={styles.page}>
      <h1>About / Help</h1>
      <p className={styles.lead}>
        GamePriceCheck is a price comparison aggregator for physical video games, consoles, and
        accessories. We collect offers from multiple retailers so you can see prices side by side.
      </p>

      <section>
        <h2>How it works</h2>
        <ol>
          <li>
            <strong>Search / Browse.</strong> Type a game, console, or accessory into the search
            bar, or browse the Games, Consoles, and Accessories categories.
          </li>
          <li>
            <strong>Filter / Sort.</strong> Narrow results by condition, price range, retailer,
            maker/developer, and release year, then sort by price, discount, or release date.
          </li>
          <li>
            <strong>View product and compare prices.</strong> Open a product to see its image,
            maker, best price, discount, condition, and availability, then compare every
            retailer&apos;s offer side by side. The best in-stock price is highlighted.
          </li>
          <li>
            <strong>Go to the retailer.</strong> Select &ldquo;Go to&rdquo; on an offer to open the
            retailer&apos;s website in a new tab and complete your purchase there.
          </li>
        </ol>
      </section>

      <section>
        <h2>Aggregator info</h2>
        <ul>
          <li>
            GamePriceCheck is an aggregator: it collects listings from multiple retailers and shows
            them in one place. It does not sell products, take payments, or handle shipping.
          </li>
          <li>
            Prices, discounts, conditions, and stock come from the retailer offering each listing.
            Product details such as names and release years come from the original maker when
            sources disagree.
          </li>
          <li>
            Prices and stock can change quickly. Each offer shows when it was last updated; the
            retailer&apos;s website always has the final price.
          </li>
          <li>
            A discount is the amount off the retailer&apos;s regular price; the crossed-out price is
            the regular price.
          </li>
        </ul>
      </section>

      <section>
        <h2>Condition guide</h2>
        <dl className={styles.definitions}>
          {CONDITIONS.map((condition) => (
            <div key={condition}>
              <dt>{CONDITION_LABELS[condition]}</dt>
              <dd>{CONDITION_HELP[condition]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p>
        <Link to="/">← Back to Home</Link>
      </p>
    </article>
  );
}
