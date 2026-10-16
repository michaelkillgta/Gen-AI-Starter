"use client";

import { useEffect, useRef } from "react";

import { THEME_KEY, type Theme } from "@/components/layout/theme";

import { COURSE_HTML } from "./markup";
import "./course.css";

/** Same as the header toggle; the lesson player covers the header, so it has its own button. */
function toggleTheme() {
  const next: Theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {}
}

/**
 * The interactive Python course. The markup renders on the server; the course
 * code (lessons, labs, notes) loads in the browser and wires it up.
 */
export function PythonCourse() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import("./course").then(({ mountCourse }) => {
      if (!cancelled && ref.current) cleanup = mountCourse(ref.current, { toggleTheme });
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return <div ref={ref} className="pyc" dangerouslySetInnerHTML={{ __html: COURSE_HTML }} />;
}
