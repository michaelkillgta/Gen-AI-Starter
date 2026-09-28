"use client";

import { useEffect, useState } from "react";

import styles from "./ReadingProgress.module.css";

/** A thin bar at the top of the screen that fills as you read the post body. */
export function ReadingProgress({ target }: { target: string }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const el = document.getElementById(target);
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setPct(total <= 0 ? 100 : Math.min(100, Math.max(0, (-r.top / total) * 100)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [target]);

  return (
    <div className={styles.track} aria-hidden="true">
      <div className={styles.bar} style={{ transform: `scaleX(${pct / 100})` }} />
    </div>
  );
}
