import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cx } from "./cx";
import styles from "./Button.module.css";

export type ButtonVariant = "dark" | "accent" | "outline" | "light";

type Common = {
  variant?: ButtonVariant;
  size?: "md" | "lg";
  block?: boolean;
  className?: string;
  children: ReactNode;
};

type AsButton = Common & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & { href?: undefined };
type AsLink = Common & { href: string; "aria-label"?: string };

/** One button style for real buttons and for links that look like buttons. */
export function Button(props: AsButton | AsLink) {
  const cls = cx(
    styles.button,
    styles[props.variant ?? "dark"],
    styles[props.size ?? "md"],
    props.block && styles.block,
    props.className,
  );

  if (props.href !== undefined) {
    return (
      <Link href={props.href} className={cls} aria-label={props["aria-label"]}>
        {props.children}
      </Link>
    );
  }

  // Strip our own props so only real <button> attributes reach the DOM.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { variant, size, block, className, children, type, ...rest } = props;
  return (
    <button type={type ?? "button"} {...rest} className={cls}>
      {children}
    </button>
  );
}
