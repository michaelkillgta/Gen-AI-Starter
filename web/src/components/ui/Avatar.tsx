import styles from "./Avatar.module.css";

/** Initials in a warm circle (the design uses "U" for Uma). */
export function Avatar({ initial, size = 24 }: { initial: string; size?: number }) {
  return (
    <span className={styles.avatar} style={{ width: size, height: size, fontSize: Math.round(size * 0.45) }} aria-hidden="true">
      {initial}
    </span>
  );
}
