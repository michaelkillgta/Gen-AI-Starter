import { Badge } from "@/components/ui";
import styles from "./KindExplainer.module.css";

const kinds = [
  { tone: "tool", label: "Tool", text: "An app or service you open and use, like a website or dashboard." },
  { tone: "library", label: "Library", text: "Building blocks you import into your own code to save writing them yourself." },
  { tone: "package", label: "Package", text: "A ready-made program you install with pip or npm and run from your terminal." },
  { tone: "mcp", label: "MCP server", text: "A plug that lets your AI assistant use another app, like GitHub or Notion." },
] as const;

/** What "Tool", "Library", "Package" and "MCP server" mean, in plain words. */
export function KindExplainer() {
  return (
    <section className={`container ${styles.wrap}`} aria-label="What the types mean">
      <ul className={styles.grid}>
        {kinds.map((k) => (
          <li key={k.tone} className={styles.item}>
            <Badge tone={k.tone}>{k.label}</Badge>
            <span className={styles.text}>{k.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
