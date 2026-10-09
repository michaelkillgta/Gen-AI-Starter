/** localStorage key for the header toggle. Absent means "follow the OS setting". */
export const THEME_KEY = "ft-theme";

export type Theme = "light" | "dark";

/**
 * Runs inline in <head> before first paint: picks the saved theme, else the OS
 * setting, and puts it on <html data-theme>. tokens.css does the rest.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}})()`;
