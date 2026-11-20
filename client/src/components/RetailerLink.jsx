import { useEffect, useRef, useState } from 'react';
import styles from './RetailerLink.module.css';

function hostOf(href) {
  try {
    return new URL(href).hostname;
  } catch {
    return href;
  }
}

/**
 * "Go to {retailer}" button. Before leaving GamePriceCheck it shows a
 * confirmation (Level 3 Specification); Continue opens the retailer's page
 * in a new tab.
 */
export default function RetailerLink({ retailer, href, className }) {
  const [open, setOpen] = useState(false);
  const continueRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    continueRef.current?.focus();
    const onKey = (event) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const host = hostOf(href);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={className ?? styles.go}
        onClick={() => setOpen(true)}
      >
        Go to {retailer}
        <span aria-hidden="true"> ↗</span>
      </button>
      {open && (
        <div className={styles.backdrop} onClick={close}>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="leave-title"
            aria-describedby="leave-text"
            className={styles.dialog}
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="leave-title">You are leaving GamePriceCheck</h2>
            <p id="leave-text">
              You&apos;re being redirected to <strong>{retailer}</strong> ({host}) in a new tab.
              GamePriceCheck doesn&apos;t sell products; prices, stock, and checkout are handled by
              the retailer.
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.cancel} onClick={close}>
                Stay on GamePriceCheck
              </button>
              <a
                ref={continueRef}
                className={styles.continue}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
              >
                Continue to {retailer}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
