import { useState } from 'react';
import { apiPost } from '../lib/api.js';
import { validateContact } from '../lib/validation.js';
import styles from './NotifyForm.module.css';

/** Optional price-change notification by email or phone; no account needed. */
export default function NotifyForm({ productId, productName }) {
  const [channel, setChannel] = useState('email');
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');

  async function onSubmit(event) {
    event.preventDefault();
    const problem = validateContact(channel, value);
    setError(problem);
    if (problem) return;
    setStatus('saving');
    try {
      await apiPost('/notifications', { product_id: productId, [channel]: value.trim() });
      setStatus('saved');
    } catch (err) {
      setStatus('idle');
      setError(err.message);
    }
  }

  if (status === 'saved') {
    return (
      <p className={styles.success} role="status">
        You&apos;re set. We&apos;ll send price changes for {productName} to the {channel}{' '}
        {channel === 'email' ? 'address' : 'number'} you entered.
      </p>
    );
  }

  const inputId = `notify-${productId}`;
  return (
    <form
      className={styles.form}
      onSubmit={onSubmit}
      noValidate
      aria-label={`Price alerts for ${productName}`}
    >
      <fieldset className={styles.channels}>
        <legend>Notify me about price changes by</legend>
        {['email', 'phone'].map((option) => (
          <label key={option}>
            <input
              type="radio"
              name={`channel-${productId}`}
              value={option}
              checked={channel === option}
              onChange={() => {
                setChannel(option);
                setError('');
              }}
            />{' '}
            {option === 'email' ? 'Email' : 'Phone (text)'}
          </label>
        ))}
      </fieldset>
      <div className={styles.row}>
        <label htmlFor={inputId} className="visually-hidden">
          {channel === 'email' ? 'Email address' : 'Phone number'}
        </label>
        <input
          id={inputId}
          type={channel === 'email' ? 'email' : 'tel'}
          autoComplete={channel === 'email' ? 'email' : 'tel'}
          placeholder={channel === 'email' ? 'you@example.com' : '(530) 555-0123'}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        <button type="submit" disabled={status === 'saving'}>
          {status === 'saving' ? 'Saving…' : 'Notify me'}
        </button>
      </div>
      {error && (
        <p id={`${inputId}-error`} className={styles.error} role="alert">
          {error}
        </p>
      )}
      <p className={styles.note}>No account needed. Used only for price-change alerts.</p>
    </form>
  );
}
