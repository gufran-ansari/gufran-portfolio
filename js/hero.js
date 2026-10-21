// ==========================================================================
// Hero — Minimal Editorial Portfolio (For HRs & Recruiters)
// ==========================================================================

import { prefersReducedMotion, qs, qsa } from "./utils.js";

export function initHero() {
  const hero = qs(".js-hero");
  if (!hero) return;

  const reduced = prefersReducedMotion();
  const hasGsap = typeof gsap !== "undefined";

  const nav = qs(".js-nav");
  const eyebrow = qs(".js-hero-eyebrow", hero);
  const heading = qs(".js-hero-heading", hero);
  const desc = qs(".js-hero-desc", hero);
  const actions = qs(".js-hero-actions", hero);
  const metrics = qs(".js-hero-metrics", hero);
  const metricItems = qsa(".hero__metric", hero);
  const footnote = qs(".js-hero-footnote", hero);
  const visual = qs(".js-hero-visual", hero);

  if (reduced || !hasGsap) {
    // Show everything immediately, no motion
    [nav, eyebrow, heading, desc, actions, metrics, footnote, visual]
      .filter(Boolean)
      .forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    return;
  }

  const tl = gsap.timeline({
    defaults: {
      ease: "power2.out",
    },
  });

  // 1. Navbar fades in
  if (nav) {
    tl.from(nav, {
      opacity: 0,
      y: -14,
      duration: 0.6,
      clearProps: "all",
    });
  }

  // 2. Eyebrow fades up
  if (eyebrow) {
    tl.from(
      eyebrow,
      {
        opacity: 0,
        y: 16,
        duration: 0.5,
        clearProps: "all",
      },
      "-=0.35"
    );
  }

  // 3. Heading fades up
  if (heading) {
    tl.from(
      heading,
      {
        opacity: 0,
        y: 22,
        duration: 0.6,
        clearProps: "all",
      },
      "-=0.35"
    );
  }

  // 4. Paragraph fades
  if (desc) {
    tl.from(
      desc,
      {
        opacity: 0,
        y: 16,
        duration: 0.5,
        clearProps: "all",
      },
      "-=0.35"
    );
  }

  // 5. Buttons fade
  if (actions) {
    tl.from(
      actions,
      {
        opacity: 0,
        y: 16,
        duration: 0.5,
        clearProps: "all",
      },
      "-=0.35"
    );
  }

  // 6. Metrics stagger in
  if (metricItems.length) {
    tl.from(
      metricItems,
      {
        opacity: 0,
        y: 16,
        duration: 0.5,
        stagger: 0.08,
        clearProps: "all",
      },
      "-=0.3"
    );
  } else if (metrics) {
    tl.from(
      metrics,
      {
        opacity: 0,
        y: 16,
        duration: 0.5,
        clearProps: "all",
      },
      "-=0.3"
    );
  }

  // Footnote
  if (footnote) {
    tl.from(
      footnote,
      {
        opacity: 0,
        y: 12,
        duration: 0.45,
        clearProps: "all",
      },
      "-=0.3"
    );
  }

  // 7. Portrait fades from right
  if (visual) {
    tl.from(
      visual,
      {
        opacity: 0,
        x: 28,
        duration: 0.65,
        clearProps: "all",
      },
      "-=0.55"
    );
  }
}
