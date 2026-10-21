// ==========================================================================
// Navigation
// ==========================================================================

import { qs, qsa, debounce } from "./utils.js";

export function initNavigation() {
  const nav = qs(".js-nav");
  if (!nav) return;

  const toggle = qs(".js-nav-toggle");
  const links = qs(".js-nav-links");

  let lastScrollY = window.scrollY;
  const scrollThreshold = 80;

  function handleScroll() {
    const currentY = window.scrollY;

    nav.classList.toggle("nav--scrolled", currentY > 24);

    if (currentY > scrollThreshold) {
      const goingDown = currentY > lastScrollY;
      nav.classList.toggle("nav--hidden", goingDown && !links?.classList.contains("is-open"));
    } else {
      nav.classList.remove("nav--hidden");
    }

    lastScrollY = currentY;
    updateActiveLink();
  }

  // Active navigation tracking
  const navLinks = qsa(".js-nav-link");
  const path = window.location.pathname.toLowerCase();
  const isProjectsPage = path.includes("projects");
  const isAboutPage = path.includes("about");
  const isHomePage = !isProjectsPage && !isAboutPage;

  function setActive(targetId) {
    navLinks.forEach((link) => {
      const navTarget = link.getAttribute("data-nav");
      link.classList.toggle("is-active", navTarget === targetId);
    });
  }

  function updateActiveLink() {
    if (isProjectsPage) {
      setActive("projects");
      return;
    }
    if (isAboutPage) {
      setActive("about");
      return;
    }

    // On Home page: check if Experience section is currently in view
    const expSection = qs("#experience");
    if (expSection) {
      const rect = expSection.getBoundingClientRect();
      const triggerLine = window.innerHeight * 0.45;
      if (rect.top <= triggerLine && rect.bottom >= triggerLine) {
        setActive("experience");
        return;
      }
    }

    // Default to Home when at the top or in other sections
    setActive("home");
  }

  // Smooth click navigation when already on the same page
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const navTarget = link.getAttribute("data-nav");

      if (isHomePage) {
        if (navTarget === "home") {
          e.preventDefault();
          setActive("home");
          const lenis = window.__lenis;
          if (lenis) {
            lenis.scrollTo(0, { duration: 1 });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
          if (history.pushState) {
            history.pushState(null, "", window.location.pathname);
          }
        } else if (navTarget === "experience") {
          const expSection = qs("#experience");
          if (expSection) {
            e.preventDefault();
            setActive("experience");
            const lenis = window.__lenis;
            if (lenis) {
              lenis.scrollTo(expSection, { offset: -32, duration: 1 });
            } else {
              expSection.scrollIntoView({ behavior: "smooth" });
            }
            if (history.pushState) {
              history.pushState(null, "", "#experience");
            }
          }
        }
      }
    });
  });

  // Clicking the Instagram DP logo on the home page smooth-scrolls to top
  const logoLink = qs(".nav__logo");
  if (logoLink && isHomePage) {
    logoLink.addEventListener("click", (e) => {
      e.preventDefault();
      setActive("home");
      const lenis = window.__lenis;
      if (lenis) {
        lenis.scrollTo(0, { duration: 1 });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (history.pushState) {
        history.pushState(null, "", window.location.pathname);
      }
    });
  }

  window.addEventListener("scroll", debounce(handleScroll, 10), { passive: true });
  updateActiveLink();
  handleScroll();

  // Mobile off-canvas menu
  if (toggle && links) {
    const backdrop = qs(".nav__backdrop");

    const setMenu = (open) => {
      links.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      backdrop?.classList.toggle("is-visible", open);
      document.body.classList.toggle("nav-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    };

    const isOpen = () => links.classList.contains("is-open");

    toggle.addEventListener("click", () => setMenu(!isOpen()));

    qsa("a", links).forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    // Tapping the backdrop (or pressing Escape) dismisses the panel.
    backdrop?.addEventListener("click", () => setMenu(false));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) {
        setMenu(false);
        toggle.focus();
      }
    });
  }
}
