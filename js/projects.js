// ==========================================================================
// Projects Page: Filtering & Executive Hero Animations
// ==========================================================================

import { prefersReducedMotion, qs, qsa } from "./utils.js";

/**
 * Initializes interactive category filtering on the projects grid.
 */
export function initProjectFilters() {
  const filterBar = qs(".js-filters");
  const grid = qs(".projects-grid, .js-archive-grid");
  if (!filterBar || !grid) return;

  const pills = qsa(".filter-pill", filterBar);
  const cards = qsa(".projects-card, .archive-card", grid);
  const countEl = qs(".js-projects-count");

  pills.forEach((pill) => {
    pill.addEventListener("click", () => {
      pills.forEach((p) => p.classList.remove("is-active"));
      pill.classList.add("is-active");

      const filter = pill.dataset.filter;
      let visibleCount = 0;

      cards.forEach((card) => {
        const matches = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !matches);
        if (matches) visibleCount++;
      });

      if (countEl) {
        countEl.textContent = visibleCount;
      }
    });
  });
}

/**
 * Smooth GSAP staggered entrance for the Projects page hero section.
 */
export function initProjectsHeroAnimation() {
  const hero = qs(".js-projects-hero");
  if (!hero) return;

  const reduced = prefersReducedMotion();
  const hasGsap = typeof gsap !== "undefined";

  const badge = qs(".js-projects-hero-badge", hero);
  const heading = qs(".js-projects-hero-heading", hero);
  const desc = qs(".js-projects-hero-desc", hero);
  const actions = qs(".js-projects-hero-actions", hero);
  const pills = qs(".js-projects-hero-pills", hero);
  const visual = qs(".js-projects-hero-visual", hero);

  if (reduced || !hasGsap) {
    [badge, heading, desc, actions, pills, visual]
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

  // 1. Breadcrumb & status badge
  if (badge) {
    tl.from(badge, {
      opacity: 0,
      y: 16,
      duration: 0.5,
      clearProps: "all",
    });
  }

  // 2. Main monumental heading
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

  // 3. Subtitle description
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

  // 4. Action buttons
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

  // 5. Platforms / capability tags
  if (pills) {
    tl.from(
      pills,
      {
        opacity: 0,
        y: 12,
        duration: 0.45,
        clearProps: "all",
      },
      "-=0.3"
    );
  }

  // 6. Right visual: Telemetry card floats in from right
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
