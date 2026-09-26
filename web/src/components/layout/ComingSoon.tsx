import { Card } from "@/components/ui";
import { PageIntro } from "./PageIntro";
import { SiteFooter } from "./SiteFooter";

/**
 * Temporary body for pages that are wired up but not built yet (phases 1–3).
 * Every route exists from day one so navigation and screenshots work.
 */
export function ComingSoon({ title, lead, phase }: { title: string; lead?: string; phase: string }) {
  return (
    <>
      <PageIntro title={title} lead={lead} />
      <div className="container" style={{ paddingBottom: 72 }}>
        <Card tone="panel" padding="lg">
          <strong>This page is being built.</strong>
          <span style={{ color: "var(--color-muted)" }}>Planned for {phase}.</span>
        </Card>
      </div>
      <SiteFooter variant="slim" message="Field Tested is under construction." />
    </>
  );
}
