// Client-side form validation rules.
export const MIN_QUERY_LENGTH = 2;
export const MAX_QUERY_LENGTH = 100;

export function validateQuery(rawQuery) {
  const query = rawQuery.trim();
  if (!query) return 'Enter a game, console, or accessory to search.';
  if (query.length < MIN_QUERY_LENGTH)
    return `Search terms must be at least ${MIN_QUERY_LENGTH} characters.`;
  if (query.length > MAX_QUERY_LENGTH)
    return `Search terms must be ${MAX_QUERY_LENGTH} characters or fewer.`;
  return '';
}

export const MAX_PRICE = 10000;

export function validatePriceRange(minPrice, maxPrice) {
  const errors = {};
  const min = minPrice === '' ? null : Number(minPrice);
  const max = maxPrice === '' ? null : Number(maxPrice);
  if (min !== null && (Number.isNaN(min) || min < 0))
    errors.minPrice = 'Enter a price of $0 or more.';
  else if (min !== null && min > MAX_PRICE) errors.minPrice = `Enter a price up to $${MAX_PRICE}.`;
  if (max !== null && (Number.isNaN(max) || max < 0))
    errors.maxPrice = 'Enter a price of $0 or more.';
  else if (max !== null && max > MAX_PRICE) errors.maxPrice = `Enter a price up to $${MAX_PRICE}.`;
  if (!errors.minPrice && !errors.maxPrice && min !== null && max !== null && min > max)
    errors.maxPrice = 'Max price must be greater than or equal to min price.';
  return errors;
}

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE = /^\+?[0-9]{10,15}$/;

/** Validates the price-alert contact (matches the API's rules). */
export function validateContact(channel, rawValue) {
  const value = rawValue.trim();
  if (channel === 'email') {
    if (!value) return 'Enter an email address.';
    if (value.length > 254 || !EMAIL.test(value)) return 'Enter a valid email address.';
    return '';
  }
  if (!value) return 'Enter a phone number.';
  if (!PHONE.test(value.replace(/[\s().-]/g, '')))
    return 'Enter a valid phone number (10–15 digits).';
  return '';
}
