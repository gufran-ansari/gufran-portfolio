// ==========================================================================
// Smooth Scroll (Lenis + GSAP ScrollTrigger)
// ==========================================================================

import { prefersReducedMotion } from "./utils.js";

let lenisInstance = null;

export function initSmoothScroll() {
  if (typeof Lenis === "undefined") {
    console.warn("[scroll] Lenis is not loaded; falling back to native scroll.");
    return null;
  }

  if (prefersReducedMotion()) {
    return null; // respect the user's OS-level motion preference entirely
  }

  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.2,
  });

  lenisInstance = lenis;
  window.__lenis = lenis;

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Keep ScrollTrigger in sync with Lenis's virtual scroll position
  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  // Smooth-scroll same-page anchor links
  document.addEventListener("click", (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    const id = anchor.getAttribute("href");
    if (id.length <= 1) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -32 });
  });

  return lenis;
}

export function getLenis() {
  return lenisInstance;
}
