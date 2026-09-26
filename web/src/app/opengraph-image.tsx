import { ogCard, ogSize } from "@/lib/og";

export const alt = "Field Tested: find the right AI tool, explained simply";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return ogCard({
    eyebrow: "For freshers and students in India",
    title: "Find the right AI tool, explained simply.",
    sub: "What each AI tool does, when to use it, and when to skip it.",
  });
}
