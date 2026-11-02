"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import { site } from "@/lib/site";

/** Share the challenge page: the phone's share sheet if there is one, otherwise copy the link. */
export function ShareButton() {
  const [copied, setCopied] = useState(false);
  const url = `${site.url}/challenge`;
  const text = "Join me in the GenAI Starter build challenge: one real AI project in a weekend, free.";

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "GenAI Starter build challenge", text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Share sheet closed; nothing to do.
    }
  }

  return (
    <Button variant="accent" onClick={share}>
      {copied ? "Link copied" : "Share the challenge"}
    </Button>
  );
}
