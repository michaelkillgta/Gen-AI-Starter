/** localStorage key for the header toggle. Absent means light. */
export const THEME_KEY = "ft-theme";

export type Theme = "light" | "dark";

/**
 * Runs inline in <head> before first paint. The site is light for everyone, even
 * when their device is set to dark; it turns dark only after someone picks dark with
 * the header toggle. Puts the theme on <html data-theme>; tokens.css does the rest.
 */
export const THEME_SCRIPT = `(function(){try{document.documentElement.dataset.theme=localStorage.getItem("${THEME_KEY}")==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}})()`;
