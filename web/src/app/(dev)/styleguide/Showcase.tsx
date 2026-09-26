"use client";

import { useState } from "react";

import { PageIntro } from "@/components/layout/PageIntro";
import {
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  Chip,
  ChipRow,
  ProgressBar,
  SearchField,
  Segmented,
  StatusDot,
  Tabs,
  TextField,
} from "@/components/ui";
import styles from "./styleguide.module.css";

const colors = [
  ["bg", "--color-bg"], ["surface", "--color-surface"], ["panel", "--color-panel"], ["dark", "--color-dark"],
  ["ink", "--color-ink"], ["muted", "--color-muted"], ["accent", "--color-accent"], ["hover", "--color-hover"],
  ["danger", "--color-danger"], ["success", "--color-success"], ["line", "--color-line-card"], ["highlight", "--highlight-bg"],
];

export function Showcase() {
  const [type, setType] = useState("all");
  const [start, setStart] = useState("all");
  const [sort, setSort] = useState<"picks" | "az">("picks");
  const [track, setTrack] = useState<"foundations" | "agents" | "rag">("agents");
  const [sheet, setSheet] = useState(false);

  return (
    <>
      <PageIntro
        title="Style guide"
        lead="The shared building blocks of Field Tested. Resize the window: every piece adapts to phone, tablet and desktop."
        aside={
          <span className={styles.author}>
            <Avatar initial="U" size={40} /> Curated by Uma
          </span>
        }
      />

      <div className={`container ${styles.sections}`}>
        <Section title="Colours">
          <div className={styles.swatches}>
            {colors.map(([name, v]) => (
              <div key={v} className={styles.swatch}>
                <span className={styles.swatchColor} style={{ background: `var(${v})` }} />
                <span className={styles.swatchName}>{name}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Type">
          <div className={styles.typeStack}>
            <span className={styles.hero}>Find the right AI tool, explained simply.</span>
            <h2 className={styles.h2}>Section heading in Bricolage Grotesque</h2>
            <p className={styles.lead}>Lead text in Geist. What each AI tool does, when to use it, and when to skip it.</p>
            <code className={styles.code}>pip install docling</code>
          </div>
        </Section>

        <Section title="Buttons">
          <div className={styles.row}>
            <Button>This week&apos;s verdicts</Button>
            <Button variant="accent">Join the waitlist</Button>
            <Button variant="outline">Mark as done</Button>
            <Button variant="light">Clear filters</Button>
            <Button size="lg">Subscribe</Button>
          </div>
        </Section>

        <Section title="Filter chips">
          <ChipRow label="Start here">
            {[["all", "Show everything"], ["new", "I'm new to AI"], ["project", "I'm building a project"]].map(([v, l]) => (
              <Chip key={v} tone="accent" pressed={start === v} onClick={() => setStart(v)}>
                {l}
              </Chip>
            ))}
          </ChipRow>
          <ChipRow label="Type">
            {[["all", "All", 28], ["tool", "Tools", 10], ["library", "Libraries", 5], ["package", "Packages", 8], ["mcp", "MCP servers", 5]].map(
              ([v, l, n]) => (
                <Chip key={v} pressed={type === v} count={n} onClick={() => setType(String(v))}>
                  {l}
                </Chip>
              ),
            )}
          </ChipRow>
          <Segmented
            label="Sort"
            value={sort}
            onChange={setSort}
            options={[
              { value: "picks", label: "My picks first" },
              { value: "az", label: "A to Z" },
            ]}
          />
        </Section>

        <Section title="Badges and status">
          <div className={styles.row}>
            <Badge tone="tool">Tool</Badge>
            <Badge tone="library">Library</Badge>
            <Badge tone="package">Package</Badge>
            <Badge tone="mcp">MCP server</Badge>
            <Badge tone="use" size="lg">Use it</Badge>
            <Badge tone="wait" size="lg">Wait</Badge>
            <Badge tone="skip" size="lg">Skip</Badge>
            <Badge tone="dark" size="md">Deep dive 1 of 9</Badge>
            <span className={styles.status}><StatusDot status="using" label="I use this" /> I use this</span>
            <span className={styles.status}><StatusDot status="notes" label="In my notes" /> In my notes</span>
            <span className={styles.status}><StatusDot status="tested" label="Tested" /> Tested</span>
          </div>
        </Section>

        <Section title="Tabs">
          <Tabs
            label="Tracks"
            idPrefix="sg-tracks"
            value={track}
            onChange={setTrack}
            items={[
              { value: "foundations", label: "Foundations", sub: "6 deep dives" },
              { value: "agents", label: "Agents that don't break", sub: "9 deep dives" },
              { value: "rag", label: "RAG and documents", sub: "6 deep dives" },
            ]}
          />
        </Section>

        <Section title="Cards, progress and bottom sheet">
          <div className={styles.cards}>
            <Card>
              <Badge tone="package">Package</Badge>
              <strong className={styles.cardTitle}>Docling</strong>
              <span className={styles.muted}>Turns PDFs into clean text and tables, on your own laptop.</span>
            </Card>
            <Card tone="panel">
              <span className={styles.progressHead}>
                <strong>Your progress</strong>
                <span className={styles.muted}>3 of 9 done</span>
              </span>
              <ProgressBar value={3} max={9} label="Track progress" />
            </Card>
            <Card tone="dark">
              <span style={{ color: "var(--color-accent)", fontWeight: 600 }}>Tracks</span>
              <strong className={styles.cardTitle}>Know exactly what to learn next.</strong>
              <Button variant="accent" onClick={() => setSheet(true)}>
                Open a bottom sheet
              </Button>
            </Card>
          </div>
        </Section>

        <Section title="Inputs">
          <div className={styles.inputs}>
            <SearchField id="sg-hero" label="Search tools" variant="hero" placeholder="What do you want to do? Try “read PDFs”" />
            <SearchField id="sg-search" label="Search the toolkit" placeholder="Search, for example “PDF”, “agent”" />
            <TextField id="sg-name" label="Your name" placeholder="Your full name" />
            <TextField id="sg-phone" label="WhatsApp number" type="tel" placeholder="+91" error="Enter a 10-digit number." />
          </div>
        </Section>
      </div>

      <BottomSheet open={sheet} onClose={() => setSheet(false)} title="Docling details">
        <Badge tone="package">Package</Badge>
        <strong className={styles.cardTitle}>Docling</strong>
        <p className={styles.muted}>
          IBM&apos;s open-source converter that reads PDFs the way you see them, so tables, headings and code blocks come out
          cleanly for your RAG app.
        </p>
        <Button variant="light" onClick={() => setSheet(false)}>
          Close
        </Button>
      </BottomSheet>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}
