"use client";

import { useState } from "react";

import styles from "./ToolDirectory.module.css";

/** Copies an install command or link, and says so. */
export function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={styles.copy}
      aria-label={copied ? `Copied ${label}` : `Copy ${label}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          // Clipboard blocked: the text is selectable anyway.
        }
      }}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
