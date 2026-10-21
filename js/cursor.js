// ==========================================================================
// Custom Cursor
// ==========================================================================

import { isCoarsePointer, qsa } from "./utils.js";

// Selectors for sections & components with solid primary/accent background
const WHITE_BG_SELECTORS = [
  ".recruiter-cta-section",
  ".recruiter-cta-card",
  ".cta-banner",
  "#contact",
  "[data-cursor-white]",
  "[data-cursor-inverse]",
  ".bg-accent",
  ".bg-primary",
  ".filter-pill.is-active",
  ".filter-pill:hover",
  ".badge--accent",
  ".about-btn--secondary:hover",
  ".hero__btn--secondary:hover",
  ".projects-view-all-btn:hover",
  ".btn--secondary:hover",
  ".recruiter-btn--primary:hover"
].join(", ");

function isPrimaryGreenColor(colorStr) {
  if (!colorStr || colorStr === "transparent") return false;
  const m = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return false;
  const r = parseInt(m[1], 10);
  const g = parseInt(m[2], 10);
  const b = parseInt(m[3], 10);
  const a = m[4] !== undefined ? parseFloat(m[4]) : 1;
  if (a < 0.25) return false; // Ignore faint transparent layers

  // Primary green / teal palette check:
  // Low red (<= 75), green between 40 and 140, blue between 40 and 130, and green dominant over red
  return r <= 75 && g >= 40 && g <= 140 && b >= 40 && b <= 130 && g > r * 1.25;
}

export function initCursor() {
  if (isCoarsePointer()) return; // leave the system cursor on touch devices

  document.body.classList.add("has-custom-cursor");

  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  document.body.append(dot, ring);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;
  const ringEase = 0.18;

  let isWhite = false;
  let lastTarget = null;
  let lastIsWhite = false;

  function checkShouldBeWhite(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    if (el === lastTarget) return lastIsWhite;

    // 1. Fast direct or ancestor selector match
    if (el.closest(WHITE_BG_SELECTORS)) {
      lastTarget = el;
      lastIsWhite = true;
      return true;
    }

    // 2. Walk up ancestors (up to 4 levels) to check computed background color
    let curr = el;
    let depth = 0;
    while (curr && curr !== document.body && curr !== document.documentElement && depth < 4) {
      const bg = window.getComputedStyle(curr).backgroundColor;
      if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
        if (isPrimaryGreenColor(bg)) {
          lastTarget = el;
          lastIsWhite = true;
          return true;
        }
        // If solid opaque non-primary background (e.g. pure white #fff or #fdfdfd), stop ascending
        const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
        if (m && (m[4] === undefined || parseFloat(m[4]) >= 0.9)) {
          break;
        }
      }
      curr = curr.parentElement;
      depth++;
    }

    lastTarget = el;
    lastIsWhite = false;
    return false;
  }

  function setWhiteCursor(active) {
    if (isWhite === active) return;
    isWhite = active;
    if (isWhite) {
      dot.classList.add("is-white");
      ring.classList.add("is-white");
      document.body.classList.add("is-cursor-white");
    } else {
      dot.classList.remove("is-white");
      ring.classList.remove("is-white");
      document.body.classList.remove("is-cursor-white");
    }
  }

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    setWhiteCursor(checkShouldBeWhite(e.target));
  });

  // Track position when scrolling so cursor color updates if a section scrolls under it
  let scrollRAF = null;
  window.addEventListener(
    "scroll",
    () => {
      if (scrollRAF) return;
      scrollRAF = requestAnimationFrame(() => {
        scrollRAF = null;
        const el = document.elementFromPoint(mouseX, mouseY);
        if (el) {
          setWhiteCursor(checkShouldBeWhite(el));
        }
      });
    },
    { passive: true }
  );

  function renderRing() {
    ringX += (mouseX - ringX) * ringEase;
    ringY += (mouseY - ringY) * ringEase;
    ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderRing);
  }
  requestAnimationFrame(renderRing);

  // Hover states, delegated so dynamically injected header/footer/popup
  // markup (loaded via fetch) is covered without re-binding listeners.
  document.addEventListener("mouseover", (e) => {
    setWhiteCursor(checkShouldBeWhite(e.target));
    const target = e.target.closest("[data-cursor]");
    if (!target) return;
    const kind = target.dataset.cursor;
    ring.classList.add(`is-hover-${kind}`);
  });

  document.addEventListener("mouseout", (e) => {
    if (e.relatedTarget) {
      setWhiteCursor(checkShouldBeWhite(e.relatedTarget));
    } else {
      setWhiteCursor(false);
    }
    const target = e.target.closest("[data-cursor]");
    if (!target) return;
    const kind = target.dataset.cursor;
    ring.classList.remove(`is-hover-${kind}`);
  });

  // Fallback: also flag plain buttons/links/cards even without data-cursor,
  // so the effect still works on markup that forgot to annotate itself.
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest("button, a") && !e.target.closest("[data-cursor]")) {
      ring.classList.add("is-hover-link");
    } else if (e.target.closest(".card, .project-card, .archive-card") && !e.target.closest("[data-cursor]")) {
      ring.classList.add("is-hover-card");
    }
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest("button, a") && !e.target.closest("[data-cursor]")) {
      ring.classList.remove("is-hover-link");
    } else if (e.target.closest(".card, .project-card, .archive-card") && !e.target.closest("[data-cursor]")) {
      ring.classList.remove("is-hover-card");
    }
  });

  // Click ripple
  window.addEventListener("mousedown", (e) => {
    const ripple = document.createElement("div");
    ripple.className = isWhite ? "cursor-ripple is-white" : "cursor-ripple";
    ripple.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%) scale(0.3)`;
    document.body.appendChild(ripple);

    ripple.animate(
      [
        { transform: ripple.style.transform + " scale(0.3)", opacity: 0.9 },
        { transform: ripple.style.transform.replace("scale(0.3)", "scale(1.6)"), opacity: 0 },
      ],
      { duration: 500, easing: "cubic-bezier(0.16, 1, 0.3, 1)" }
    ).onfinish = () => ripple.remove();
  });

  // Hide cursor when it leaves the viewport
  document.addEventListener("mouseleave", () => {
    dot.style.opacity = "0";
    ring.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    dot.style.opacity = "1";
    ring.style.opacity = "1";
  });
}
