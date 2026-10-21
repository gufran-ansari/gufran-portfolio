// ==========================================================================
// App Entry Point
// ==========================================================================
//
// Vanilla ES module, no bundler. Both index.html and projects.html load
// this file with <script type="module" src="js/app.js"></script>.
//
// Header, footer, and the contact popup are shared markup fetched from
// /components at runtime so they only need to be authored once. This
// requires the site to be served over http(s) — opening the HTML files
// directly from disk (file://) blocks fetch() of local files in most
// browsers. Serve the folder with any static server, e.g.:
//   npx serve .
//   python -m http.server
//   VS Code "Live Server" extension
// ==========================================================================

import { loadComponent, qs } from "./utils.js";
import { initCursor } from "./cursor.js";
import { initNavigation } from "./navigation.js";
import { initSmoothScroll } from "./scroll.js";
import { initHero } from "./hero.js";
import {
  initScrollReveals,
  initTimelineScroll,
  initAutomationConnectors,
  initProcessWorkflowAnimation,
  initIntroScrollText,
  initAboutEditorialAnimation,
  initRoleCardAnimation,
  initAboutMetadataAnimation,
  initEducationTimelineAnimation,
  initSkillsAnimation,
  initIndustriesAnimation,
  initCapabilitiesAnimation,
  initFeaturedProjectsAnimation,
  initRecruiterCTAAnimation,
  initFooterAnimation,
} from "./animations.js";
import { initCounters } from "./counters.js";
import { initGallery } from "./gallery.js";
import { initProjectFilters, initProjectsHeroAnimation } from "./projects.js";
import { initMarquee } from "./marquee.js";

async function bootstrap() {
  // 1. Assemble shared components before wiring up any behaviour that
  //    depends on their markup (nav links, footer socials).
  await Promise.all([
    loadComponent("components/header.html", "[data-component='header']"),
    loadComponent("components/footer.html", "[data-component='footer']"),
  ]);

  // Keep the footer's copyright year current without needing edits later.
  document.querySelectorAll(".js-year").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  // 2. Icons — Lucide replaces every <i data-lucide="..."> with inline SVG.
  //    Runs after components are in the DOM so header/footer icons are included.
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }

  // 3. Global chrome
  initNavigation();
  initCursor();
  initSmoothScroll();

  // 4. Content behaviour (only initializes if the relevant markup exists
  //    on the current page, so this file works unmodified on both pages)
  initMarquee();
  initHero();
  initProjectsHeroAnimation();
  initIntroScrollText();
  initScrollReveals();
  initAboutEditorialAnimation();
  initRoleCardAnimation();
  initAboutMetadataAnimation();
  initEducationTimelineAnimation();
  initSkillsAnimation();
  initIndustriesAnimation();
  initCapabilitiesAnimation();
  initFeaturedProjectsAnimation();
  initTimelineScroll();
  initAutomationConnectors();
  initProcessWorkflowAnimation();
  initRecruiterCTAAnimation();
  initFooterAnimation();
  initCounters();
  initGallery();
  initProjectFilters();

  // 5. Loader fade-out
  dismissLoader();
}

function dismissLoader() {
  const loader = qs(".js-loader");
  if (!loader) return;

  const bar = qs(".loader__bar-fill", loader);
  if (bar) bar.style.animation = "loader-bar 0.7s ease forwards";

  window.setTimeout(() => {
    loader.style.transition = "opacity 0.5s ease";
    loader.style.opacity = "0";
    loader.classList.add("is-done");
    window.setTimeout(() => loader.remove(), 550);
  }, 850);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrap);
} else {
  bootstrap();
}
