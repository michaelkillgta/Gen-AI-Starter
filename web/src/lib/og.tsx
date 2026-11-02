import { ImageResponse } from "next/og";

/** Share-image size used by every page (Open Graph / WhatsApp / LinkedIn previews). */
export const ogSize = { width: 1200, height: 630 };

type Card = {
  eyebrow: string;
  title: string;
  sub?: string;
  /** Dark card for deep dives, light for everything else. */
  dark?: boolean;
};

/** Draws a branded share card: logo, eyebrow, big title, optional line underneath. */
export function ogCard({ eyebrow, title, sub, dark = false }: Card) {
  const bg = dark ? "#211913" : "#FBF8F3";
  const ink = dark ? "#FBF8F3" : "#1C1713";
  const muted = dark ? "#C9BBAA" : "#5E534A";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: bg, color: ink }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#F2A93B", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="28" height="28" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 8.5l2.8 2.8L12.5 5" stroke="#1C1713" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontSize: 34, fontWeight: 700, letterSpacing: -1 }}>GenAI Starter</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <span style={{ fontSize: 30, color: "#F2A93B", fontWeight: 600 }}>{eyebrow}</span>
          <span style={{ fontSize: title.length > 40 ? 64 : 80, fontWeight: 700, lineHeight: 1.02, letterSpacing: -2.5, maxWidth: 1000 }}>{title}</span>
          {sub && <span style={{ fontSize: 30, color: muted, lineHeight: 1.35, maxWidth: 980 }}>{sub}</span>}
        </div>
      </div>
    ),
    ogSize,
  );
}
