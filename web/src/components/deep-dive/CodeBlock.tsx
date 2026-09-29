import type { ReactNode } from "react";

import styles from "./CodeBlock.module.css";

const KEYWORDS = new Set([
  "def", "return", "if", "else", "elif", "in", "or", "and", "not", "for", "while", "import", "from", "as",
  "class", "async", "await", "const", "let", "function", "export", "true", "false", "True", "False", "None",
]);

const PLAIN = new Set(["text", "markdown"]);

/** Tiny highlighter: keywords, comments, strings and SCREAMING_CASE constants. Enough for short samples. */
function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(#[^\n]*|\/\/[^\n]*)|("[^"\n]*"|'[^'\n]*')|\b([A-Za-z_][A-Za-z0-9_]*)\b/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(code))) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const [text, comment, str, word] = m;
    if (comment) out.push(<span key={k++} className={styles.comment}>{text}</span>);
    else if (str) out.push(<span key={k++} className={styles.string}>{text}</span>);
    else if (word && (KEYWORDS.has(word) || /^[A-Z][A-Z0-9_]{2,}$/.test(word)))
      out.push(<span key={k++} className={styles.keyword}>{text}</span>);
    else out.push(text);
    last = m.index + text.length;
  }
  out.push(code.slice(last));
  return out;
}

/** Dark code sample that scrolls sideways on small screens instead of squashing. */
export function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className={styles.wrap}>
      <pre className={styles.pre} tabIndex={0} aria-label={`${language} code`}>
        {/* Text, trees and Markdown are shown as they are, not coloured like code. */}
        <code>{PLAIN.has(language) ? code : highlight(code)}</code>
      </pre>
    </div>
  );
}
