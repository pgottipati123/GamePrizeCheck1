export const CONDITIONS = ['new', 'used', 'refurbished'];

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const dateTime = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  timeZone: 'UTC',
  timeZoneName: 'short',
});

export const formatPrice = (value) => currency.format(value);
export const formatDateTime = (iso) => dateTime.format(new Date(iso));

export const CONDITION_LABELS = { new: 'New', used: 'Used', refurbished: 'Refurbished' };
export const CONDITION_HELP = {
  new: 'Unopened and factory sealed.',
  used: 'Previously owned. Check the retailer listing for what is included.',
  refurbished: 'Previously owned, then tested and restored by the seller or manufacturer.',
};
