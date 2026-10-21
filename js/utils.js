// ==========================================================================
// Utilities
// ==========================================================================

/** Debounce a function by the given delay (ms). */
export function debounce(fn, delay = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Clamp a number between min and max. */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Linear interpolation. */
export function lerp(start, end, t) {
  return start + (end - start) * t;
}

/** True if the user has requested reduced motion at the OS level. */
export function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True if the primary input is touch / coarse pointer (no fine mouse). */
export function isCoarsePointer() {
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

/**
 * Fetch an HTML partial and inject it into every element matching
 * `selector`, then resolve once all injections are complete.
 * Used to assemble the shared header, footer, popup, and loader
 * components into both pages without duplicating markup.
 */
export async function loadComponent(url, selector) {
  const targets = document.querySelectorAll(selector);
  if (!targets.length) return;

  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
    const html = await res.text();
    targets.forEach((el) => {
      el.innerHTML = html;
    });
  } catch (err) {
    // Most likely cause: the site is being opened directly from disk
    // (file://) rather than served over http(s), so fetch() of a local
    // partial is blocked by the browser. Serve the folder with any
    // static server (e.g. `npx serve`, VS Code Live Server, or
    // `python -m http.server`) to see the header/footer/popup render.
    console.warn(
      `[loadComponent] Could not load "${url}". If you opened this file directly ` +
      `from disk, serve the folder over a local server instead. `,
      err
    );
  }
}

/** Simple query-selector shorthands. */
export const qs = (sel, ctx = document) => ctx.querySelector(sel);
export const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
