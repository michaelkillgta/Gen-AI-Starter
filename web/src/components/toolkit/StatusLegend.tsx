import { StatusDot } from "@/components/ui";
import styles from "./StatusLegend.module.css";

/** "● I use this ● In my notes" key next to the tool count. */
export function StatusLegend({ withTested = false }: { withTested?: boolean }) {
  return (
    <span className={styles.legend}>
      <span className={styles.item}>
        <StatusDot status="using" label="" /> I use this
      </span>
      <span className={styles.item}>
        <StatusDot status="notes" label="" /> In my notes
      </span>
      {withTested && (
        <span className={styles.item}>
          <StatusDot status="tested" label="" /> Tested
        </span>
      )}
    </span>
  );
}
