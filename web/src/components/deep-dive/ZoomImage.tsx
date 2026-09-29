"use client";

import Image from "next/image";
import { useRef } from "react";

import styles from "./ZoomImage.module.css";

type Props = { src: string; alt: string; width: number; height: number; caption?: string | null };

/**
 * A body image, sized for the column by Next.js. Click (or Enter) opens the
 * original at full resolution in a dialog; Esc, the close button or a click
 * outside closes it.
 */
export function ZoomImage({ src, alt, width, height, caption }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <figure className={styles.figure}>
      <button
        type="button"
        className={styles.open}
        onClick={() => dialog.current?.showModal()}
        aria-label={`Enlarge image: ${alt}`}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes="(min-width: 1024px) 880px, 100vw"
          quality={85}
          className={styles.img}
        />
        <span className={styles.zoomHint} aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M9.5 2.5h4v4M6.5 13.5h-4v-4M13.5 2.5 9 7M2.5 13.5 7 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Enlarge
        </span>
      </button>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}

      <dialog
        ref={dialog}
        className={styles.dialog}
        aria-label={alt}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <button type="button" className={styles.close} onClick={() => dialog.current?.close()} autoFocus>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          <span className="visually-hidden">Close</span>
        </button>
        {/* The original file, full resolution; loaded only when opened. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={width} height={height} className={styles.full} loading="lazy" />
      </dialog>
    </figure>
  );
}
