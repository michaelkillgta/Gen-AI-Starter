import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

import { cx } from "./cx";
import styles from "./Input.module.css";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
};

/** A labelled text input with optional hint and error message. */
export function TextField({ id, label, hint, error, className, ...rest }: FieldProps) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        {...rest}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cx(styles.input, error && styles.invalid)}
      />
      {hint && (
        <span id={`${id}-hint`} className={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

type AreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string; label: string; error?: string };

export function TextArea({ id, label, error, className, ...rest }: AreaProps) {
  return (
    <div className={cx(styles.field, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <textarea
        id={id}
        rows={5}
        {...rest}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cx(styles.input, styles.area, error && styles.invalid)}
      />
      {error && (
        <span id={`${id}-error`} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}

type SearchProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> & {
  id: string;
  label: string;
  /** "hero" is the big outlined search on the homepage. */
  variant?: "md" | "hero";
};

/** Search box with a magnifier icon. The label is for screen readers only. */
export function SearchField({ id, label, variant = "md", className, ...rest }: SearchProps) {
  return (
    <div className={cx(styles.search, variant === "hero" && styles.searchHero, className)}>
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <svg width="20" height="20" viewBox="0 0 18 18" fill="none" aria-hidden="true" className={styles.searchIcon}>
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12.2 12.2L16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input id={id} type="search" {...rest} className={styles.searchInput} />
    </div>
  );
}
