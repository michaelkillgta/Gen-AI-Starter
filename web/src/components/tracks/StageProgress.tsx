"use client";

import { Button, ProgressBar } from "@/components/ui";
import { checkKey, setStageMark, stageKey, useStageMarks } from "@/features/progress/progress";
import styles from "./Roadmap.module.css";

/** "3 of 9 stages done" bar for a track. */
export function TrackStageProgress({ track, stages }: { track: string; stages: string[] }) {
  const marks = useStageMarks();
  const done = stages.filter((s) => marks[stageKey(track, s)]).length;
  return (
    <div className={styles.progress}>
      <div className={styles.progressHead}>
        <span className={styles.progressLabel}>Your progress</span>
        <span>
          {done} of {stages.length} stages done
        </span>
      </div>
      <ProgressBar value={done} max={stages.length} label="Stages finished in this track" />
      <span className={styles.progressNote}>Saved in this browser.</span>
    </div>
  );
}

/** "Continue with Stage N" once something is done. */
export function ContinueButton({ track, stages }: { track: string; stages: { slug: string; position: number; title: string }[] }) {
  const marks = useStageMarks();
  const next = stages.find((s) => !marks[stageKey(track, s.slug)]);
  const started = stages.some((s) => marks[stageKey(track, s.slug)]);
  if (!next) return <span className={styles.finished}>Track finished. Well done.</span>;
  return (
    <Button href={`#stage-${next.slug}`} size="lg" block>
      {started ? `Continue: Stage ${next.position}` : "Start with Stage 1"}
    </Button>
  );
}

/** The dot next to each stage in the side list. */
export function StageDot({ track, stage, n }: { track: string; stage: string; n: number }) {
  const marks = useStageMarks();
  const done = !!marks[stageKey(track, stage)];
  return (
    <span className={done ? `${styles.navDot} ${styles.navDotDone}` : styles.navDot} aria-label={done ? "done" : undefined}>
      {done ? "✓" : n}
    </span>
  );
}

/** "You're done when" checklist plus the Mark stage done button. */
export function StageChecklist({ track, stage, items }: { track: string; stage: string; items: string[] }) {
  const marks = useStageMarks();
  const done = !!marks[stageKey(track, stage)];
  return (
    <div className={styles.checklist}>
      <span className={styles.blockTitle}>You&apos;re ready to move on when</span>
      <ul className={styles.checks}>
        {items.map((item, i) => {
          const key = checkKey(track, stage, i);
          const id = `chk-${track}-${stage}-${i}`;
          return (
            <li key={key}>
              <label htmlFor={id} className={styles.check}>
                <input id={id} type="checkbox" checked={!!marks[key]} onChange={(e) => setStageMark(key, e.target.checked)} />
                <span>{item}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <Button
        variant={done ? "dark" : "outline"}
        aria-pressed={done}
        onClick={() => setStageMark(stageKey(track, stage), !done)}
      >
        {done ? "Stage done ✓ (undo)" : "Mark this stage done"}
      </Button>
    </div>
  );
}
