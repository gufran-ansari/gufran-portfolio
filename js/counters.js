// ==========================================================================
// Counters
// ==========================================================================

import { qsa, prefersReducedMotion } from "./utils.js";

/**
 * Animates any element with `data-count-to="N"` from 0 to N once it
 * scrolls into view. The "+" suffix (or any other) is read from
 * `data-count-suffix` so markup stays declarative.
 */
export function initCounters() {
  const targets = qsa("[data-count-to]");
  if (!targets.length) return;

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    targets.forEach((el) => {
      el.textContent = el.dataset.countTo + (el.dataset.countSuffix || "");
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );

  targets.forEach((el) => observer.observe(el));
}

function animateCount(el) {
  const to = parseInt(el.dataset.countTo, 10) || 0;
  const suffix = el.dataset.countSuffix || "";
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    const value = Math.round(eased * to);
    el.textContent = value + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
