import type { Challenge } from "@/lib/api-types/Challenge";
import type { Project } from "@/lib/api-types/Project";
import styles from "./Challenge.module.css";

export function ChallengeFacts({ challenge }: { challenge: Challenge }) {
  return (
    <dl className={styles.facts}>
      {challenge.facts.map((f) => (
        <div key={f.label} className={styles.fact}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

const Check = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M2 5.2l2 2L8 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Dark "From waitlist to your invite" panel with the three steps. */
export function Steps({ challenge }: { challenge: Challenge }) {
  return (
    <section className={`container ${styles.stepsWrap}`} aria-labelledby="steps-title">
      <div className={styles.stepsPanel}>
        <div className={styles.stepsHead}>
          <h2 id="steps-title" className={styles.stepsTitle}>
            From waitlist to your invite.
          </h2>
          <p className={styles.stepsLead}>Three steps. The only thing you do is the first one.</p>
        </div>
        <ol className={styles.steps}>
          <li className={styles.step}>
            <span className={styles.stepNum}>1</span>
            <span className={styles.stepTitle}>You join</span>
            <span className={styles.stepText}>Name, WhatsApp and email. Free, in a few seconds.</span>
            <div className={styles.mock}>
              <span className={styles.mockCheck}>
                <Check />
              </span>
              <span className={styles.mockText}>
                <strong>You&apos;re on the list</strong>
                <span>You&apos;re number [N]</span>
              </span>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNum}>2</span>
            <span className={styles.stepTitle}>We hit {challenge.goal}</span>
            <span className={styles.stepText}>Share it with friends to get there faster. At {challenge.goal}, I lock the date.</span>
            <div className={`${styles.mock} ${styles.mockCol}`}>
              <span className={styles.mockRow}>
                <strong>
                  {challenge.goal} of {challenge.goal} joined
                </strong>
                <span className={styles.unlocked}>Unlocked</span>
              </span>
              <span className={styles.mockBar} />
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNum}>3</span>
            <span className={styles.stepTitle}>Your invite arrives</span>
            <span className={styles.stepText}>On WhatsApp or email, with everything you need.</span>
            <div className={styles.invite}>
              <strong>You&apos;re invited to the Build Challenge</strong>
              <span>
                <span className={styles.inviteKey}>Date: </span>
                {challenge.date}
              </span>
              <span>
                <span className={styles.inviteKey}>Time: </span>
                {challenge.time}
              </span>
              <span>
                <span className={styles.inviteKey}>Join: </span>
                <span className={styles.inviteLink}>{challenge.meet_link}</span>
              </span>
              <span className={styles.inviteFrom}>from Uma</span>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}

function ProjectCover({ p }: { p: Project }) {
  const c = p.cover;
  return (
    <div className={styles.cover} style={{ background: c.bg, color: c.fg }}>
      <span className={styles.coverEyebrow}>{p.eyebrow}</span>
      {c.style === "roles" && (
        <div className={styles.roles}>
          {c.items.map((i) => (
            <span key={i}>{i}</span>
          ))}
        </div>
      )}
      {c.style === "chat" && (
        <div className={styles.chat}>
          <span className={styles.chatQ}>{c.items[0]}</span>
          <span className={styles.chatA}>{c.items[1]}</span>
        </div>
      )}
      {c.style === "flow" && (
        <div className={styles.flow}>
          <span>{c.items[0]}</span>
          <svg width="28" height="14" viewBox="0 0 28 14" fill="none" aria-hidden="true">
            <path d="M1 7h24M19 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{c.items[1]}</span>
        </div>
      )}
      {c.style === "pills" && (
        <div className={styles.pills}>
          {c.items.map((i, n) => (
            <span key={i} className={n === c.items.length - 1 ? styles.pillLast : undefined}>
              {i}
            </span>
          ))}
        </div>
      )}
      <span className={styles.coverName}>{p.name}</span>
    </div>
  );
}

export function ProjectCard({ p }: { p: Project }) {
  return (
    <article className={styles.project} id={p.slug}>
      <ProjectCover p={p} />
      <div className={styles.projectBody}>
        <span className={styles.projectCat}>{p.category}</span>
        <h3 className={styles.projectTitle}>{p.title}</h3>
        <p className={styles.projectText}>{p.description}</p>
        <ul className={styles.tags} aria-label="Built with">
          {p.tags.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
