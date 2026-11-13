import { useState } from 'react';
import { CONDITION_LABELS, CONDITIONS } from '../lib/format.js';
import { validatePriceRange } from '../lib/validation.js';
import styles from './FilterPanel.module.css';

const toDraft = (state) => ({
  conditions: state.conditions,
  retailers: state.retailers,
  makers: state.makers,
  minPrice: state.minPrice ?? '',
  maxPrice: state.maxPrice ?? '',
  year: state.year ?? '',
});

function CheckboxGroup({ legend, name, options, selected, onToggle }) {
  return (
    <fieldset className={styles.fieldset}>
      <legend className={styles.legend}>{legend}</legend>
      {options.map((option) => (
        <label key={option.value} className={styles.check}>
          <input
            type="checkbox"
            name={name}
            value={option.value}
            checked={selected.includes(option.value)}
            onChange={() => onToggle(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

/** Filter form for results. Changes are applied to the URL only when the form is valid. */
export default function FilterPanel({ state, options, onApply, onClear }) {
  const [draft, setDraft] = useState(() => toDraft(state));
  const [errors, setErrors] = useState({});

  const toggle = (key) => (value) =>
    setDraft((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }));

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validatePriceRange(draft.minPrice, draft.maxPrice);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onApply({
      conditions: draft.conditions,
      retailers: draft.retailers,
      makers: draft.makers,
      minPrice: draft.minPrice === '' ? null : Number(draft.minPrice),
      maxPrice: draft.maxPrice === '' ? null : Number(draft.maxPrice),
      year: draft.year === '' ? null : Number(draft.year),
    });
  }

  function handleClear() {
    setDraft(toDraft({ conditions: [], retailers: [], makers: [] }));
    setErrors({});
    onClear();
  }

  return (
    <form className={styles.panel} onSubmit={handleSubmit} noValidate aria-label="Filter results">
      <CheckboxGroup
        legend="Condition"
        name="condition"
        options={CONDITIONS.map((value) => ({ value, label: CONDITION_LABELS[value] }))}
        selected={draft.conditions}
        onToggle={toggle('conditions')}
      />

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Price</legend>
        <div className={styles.priceInputs}>
          {[
            ['minPrice', 'Min price'],
            ['maxPrice', 'Max price'],
          ].map(([key, label]) => (
            <div key={key} className={styles.priceField}>
              <label htmlFor={`filter-${key}`}>{label} ($)</label>
              <input
                id={`filter-${key}`}
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder={key === 'minPrice' ? '0' : 'Any'}
                value={draft[key]}
                onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                aria-invalid={errors[key] ? 'true' : 'false'}
                aria-describedby={errors[key] ? `filter-${key}-error` : undefined}
              />
            </div>
          ))}
        </div>
        {['minPrice', 'maxPrice'].map(
          (key) =>
            errors[key] && (
              <p key={key} id={`filter-${key}-error`} className={styles.error} role="alert">
                {errors[key]}
              </p>
            ),
        )}
      </fieldset>

      <CheckboxGroup
        legend="Retailer"
        name="retailer"
        options={options.retailers.map((r) => ({ value: r.retailer_id, label: r.name }))}
        selected={draft.retailers}
        onToggle={toggle('retailers')}
      />

      <CheckboxGroup
        legend="Maker / developer"
        name="maker"
        options={options.makers.map((m) => ({ value: m.maker_id, label: m.name }))}
        selected={draft.makers}
        onToggle={toggle('makers')}
      />

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Release year</legend>
        <label htmlFor="filter-year" className="visually-hidden">
          Release year
        </label>
        <select
          id="filter-year"
          className={styles.select}
          value={draft.year}
          onChange={(event) => setDraft({ ...draft, year: event.target.value })}
        >
          <option value="">Any year</option>
          {options.years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </fieldset>

      <div className={styles.actions}>
        <button type="submit" className={styles.apply}>
          Apply filters
        </button>
        <button type="button" className={styles.clear} onClick={handleClear}>
          Clear all
        </button>
      </div>
    </form>
  );
}
