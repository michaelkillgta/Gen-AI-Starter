"use client";

import { useEffect, useRef, type ReactNode } from "react";

import styles from "./BottomSheet.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Accessible name for the sheet. */
  title: string;
  children: ReactNode;
};

/**
 * A panel that slides up from the bottom of the screen (tablet tool details).
 * Built on the native <dialog>, so focus is trapped and Escape closes it.
 */
export function BottomSheet({ open, onClose, title, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={styles.sheet}
      onClose={onClose}
      onClick={(e) => {
        // A click on the backdrop lands on the dialog element itself.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.inner}>
        <div className={styles.handleRow}>
          <span className={styles.handle} aria-hidden="true" />
          <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}
