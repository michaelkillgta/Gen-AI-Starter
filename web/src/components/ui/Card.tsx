import type { ElementType, ReactNode } from "react";

import { cx } from "./cx";
import styles from "./Card.module.css";

type Props = {
  as?: ElementType;
  /** surface: white card · panel: tan box · dark: dark feature panel */
  tone?: "surface" | "panel" | "dark";
  padding?: "sm" | "md" | "lg";
  className?: string;
  children: ReactNode;
};

export function Card({ as: Tag = "div", tone = "surface", padding = "md", className, children }: Props) {
  return <Tag className={cx(styles.card, styles[tone], styles[`pad-${padding}`], className)}>{children}</Tag>;
}
