// ==========================================================================
// Scroll Animations
// ==========================================================================

import { qs, qsa, prefersReducedMotion } from "./utils.js";

/**
 * Generic fade/slide-up reveal for any element carrying the `.reveal`
 * class. Deliberately a single, restrained treatment reused everywhere
 * rather than a different entrance per section.
 */
export function initScrollReveals() {
  const targets = qsa(".reveal");
  if (!targets.length) return;

  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05, rootMargin: "0px 0px -5% 0px" },
  );

  targets.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      el.classList.add("is-visible");
    } else {
      observer.observe(el);
    }
  });

  window.addEventListener("beforeprint", () => {
    targets.forEach((el) => el.classList.add("is-visible"));
  });
}

/**
 * Experience timeline: as each entry scrolls through the active band,
 * mark it active (full opacity / scale) and grow the connecting line
 * to match, so the story "writes itself" as the visitor scrolls.
 */
export function initTimelineScroll() {
  const timeline = qs(".js-timeline");
  if (!timeline) return;

  const items = qsa(".timeline-item", timeline);
  const line = qs(".timeline__line", timeline);
  const lineFill = qs(".timeline__line-fill", timeline);
  if (!items.length) return;

  function update() {
    const viewportAnchor = window.innerHeight * 0.55;
    let lastActiveIndex = -1;

    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      const isActive = rect.top <= viewportAnchor;
      item.classList.toggle("is-active", isActive);
      if (isActive) lastActiveIndex = i;
    });

    if (lineFill && line) {
      if (lastActiveIndex >= 0) {
        const activeDot = items[lastActiveIndex].querySelector(
          ".timeline-item__dot",
        );
        if (activeDot) {
          const lineRect = line.getBoundingClientRect();
          const dotRect = activeDot.getBoundingClientRect();
          const dotCenterY = dotRect.top + dotRect.height / 2;
          const targetFill = Math.max(
            0,
            Math.min(lineRect.height, dotCenterY - lineRect.top),
          );
          lineFill.style.height = `${targetFill}px`;
        }
      } else {
        lineFill.style.height = "0px";
      }
    }
  }

  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

/** Draws the connecting lines between automation workflow nodes. */
export function initAutomationConnectors() {
  const flow = qs(".js-automation-flow");
  if (!flow) return;

  function draw() {
    qsa(".automation-connector", flow).forEach((el) => el.remove());

    const nodes = qsa(".automation-node", flow);
    if (window.innerWidth <= 1024 || nodes.length < 2) return; // hidden on tablet/mobile grid

    nodes.slice(0, -1).forEach((node) => {
      const next = node.nextElementSibling;
      if (!next) return;
      const connector = document.createElement("div");
      connector.className = "automation-connector";
      const nodeRect = node.getBoundingClientRect();
      const nextRect = next.getBoundingClientRect();
      const flowRect = flow.getBoundingClientRect();
      connector.style.left = `${nodeRect.right - flowRect.left}px`;
      connector.style.width = `${nextRect.left - nodeRect.right}px`;
      flow.appendChild(connector);
    });
  }

  draw();
  window.addEventListener("resize", draw);

  if (!prefersReducedMotion() && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            qsa(".automation-node", flow).forEach((node, i) => {
              node.style.transition = `opacity 0.5s ease ${i * 0.12}s, transform 0.5s ease ${i * 0.12}s`;
              node.style.opacity = "1";
              node.style.transform = "translateY(0)";
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    qsa(".automation-node", flow).forEach((node) => {
      node.style.opacity = "0";
      node.style.transform = "translateY(1rem)";
    });
    observer.observe(flow);
  }
}

/**
 * My Process section animation (Apple × Linear × Raycast style):
 * Coordinated GSAP ScrollTrigger timeline:
 * 1. Eyebrow fades upward
 * 2. Heading fades upward
 * 3. Supporting paragraph follows
 * 4. Outcome callout fades in
 * 5. Connector lines & nodes draw from left to right
 * 6. Five cards appear sequentially with a small stagger
 * 7. Outcome pills fade in last
 * 8. Closing statement reveals
 */
export function initProcessWorkflowAnimation() {
  const section = qs(".process-section");
  if (!section) return;

  if (prefersReducedMotion()) return;

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const eyebrow = qs(".process-eyebrow", section);
    const heading = qs(".process-heading", section);
    const desc = qs(".process-desc", section);
    const callout = qs(".process-outcome-callout", section);
    const connectorLines = qsa(".process-connector__line", section);
    const connectorNodes = qsa(".process-connector__node", section);
    const cards = qsa(".process-card", section);
    const pills = qsa(".process-pill", section);
    const statement = qs(".process-statement", section);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
        once: true,
      },
      defaults: { ease: "power2.out", immediateRender: false },
    });

    // 1. Eyebrow fades upward
    if (eyebrow) {
      tl.from(eyebrow, {
        opacity: 0,
        y: 16,
        duration: 0.45,
        clearProps: "all",
      });
    }

    // 2. Heading fades upward
    if (heading) {
      tl.from(
        heading,
        {
          opacity: 0,
          y: 20,
          duration: 0.5,
          clearProps: "all",
        },
        "-=0.3",
      );
    }

    // 3. Supporting paragraph follows
    if (desc) {
      tl.from(
        desc,
        {
          opacity: 0,
          y: 16,
          duration: 0.45,
          clearProps: "all",
        },
        "-=0.3",
      );
    }

    // 4. Outcome callout fades in
    if (callout) {
      tl.from(
        callout,
        {
          opacity: 0,
          y: 20,
          scale: 0.96,
          duration: 0.5,
          clearProps: "all",
        },
        "-=0.3",
      );
    }

    // 5. Connector line draws from left to right (or top to bottom on mobile)
    const isMobile = window.innerWidth <= 768;
    if (connectorLines.length) {
      tl.from(
        connectorLines,
        {
          [isMobile ? "scaleY" : "scaleX"]: 0,
          transformOrigin: isMobile ? "top center" : "left center",
          duration: 0.45,
          stagger: 0.08,
          clearProps: "all",
        },
        "-=0.2",
      );
    }

    if (connectorNodes.length) {
      tl.from(
        connectorNodes,
        {
          scale: 0,
          duration: 0.35,
          stagger: 0.08,
          clearProps: "all",
        },
        "-=0.4",
      );
    }

    // 6. Five cards appear sequentially with a small stagger
    if (cards.length) {
      tl.from(
        cards,
        {
          opacity: 0,
          y: 28,
          duration: 0.55,
          stagger: 0.08,
          clearProps: "all",
        },
        "-=0.45",
      );
    }

    // 7. Outcome pills fade in last
    if (pills.length) {
      tl.from(
        pills,
        {
          opacity: 0,
          y: 8,
          duration: 0.4,
          stagger: 0.06,
          clearProps: "all",
        },
        "-=0.3",
      );
    }

    // 8. Bottom closing statement
    if (statement) {
      tl.from(
        statement,
        {
          opacity: 0,
          y: 12,
          duration: 0.45,
          clearProps: "all",
        },
        "-=0.2",
      );
    }
  }
}

/**
 * Introduction section text reveal:
 * Words start in a light gray resting state and progressively darken as the user scrolls.
 */
export function initIntroScrollText() {
  const textEl = qs(".js-intro-scroll-text");
  if (!textEl) return;

  let words = qsa(".intro-word", textEl);
  if (!words.length) {
    const text = textEl.textContent.trim();
    textEl.innerHTML = text
      .split(/\s+/)
      .map((word) => `<span class="intro-word">${word}</span>`)
      .join(" ");
    words = qsa(".intro-word", textEl);
  }

  if (prefersReducedMotion()) {
    words.forEach(
      (w) => (w.style.color = "var(--color-text-primary, #18181B)"),
    );
    return;
  }

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    gsap.fromTo(
      words,
      { color: "var(--color-text-light, #B4B4BC)" },
      {
        color: "var(--color-text-primary, #18181B)",
        stagger: 0.08,
        ease: "none",
        scrollTrigger: {
          trigger: textEl,
          start: "top 80%",
          end: "bottom 35%",
          scrub: 0.5,
        },
      },
    );

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }
  } else {
    function updateScroll() {
      const rect = textEl.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.8;
      const end = vh * 0.35;
      const progress = Math.min(
        Math.max((start - rect.top) / (start - end), 0),
        1,
      );
      const activeIdx = Math.floor(progress * words.length);

      words.forEach((w, i) => {
        w.style.color =
          i <= activeIdx
            ? "var(--color-text-primary, #18181B)"
            : "var(--color-text-light, #B4B4BC)";
      });
    }

    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
  }
}

/**
 * About Section Minimal Editorial sequence (Recruiter-Focused):
 * 1. Eyebrow
 * 2. Heading
 * 3. Paragraph
 * 4. CTA buttons (+ signature line)
 * 5. Current Role card
 * 6. Education timeline
 *
 * Respects prefers-reduced-motion.
 */
export function initAboutEditorialAnimation() {
  const section = qs(".about-section");
  if (!section) return;

  if (prefersReducedMotion()) return;

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const eyebrow = qs(".js-about-eyebrow", section);
    const heading = qs(".js-about-heading", section);
    const desc = qs(".js-about-desc", section);
    const actions = qs(".js-about-actions", section);
    const signature = qs(".js-about-signature", section);
    const card = qs(".js-about-card", section);
    const edu = qs(".js-about-edu", section);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        once: true,
      },
      defaults: { ease: "power2.out", immediateRender: false },
    });

    // 1. Eyebrow
    if (eyebrow) {
      tl.from(eyebrow, {
        opacity: 0,
        y: 16,
        duration: 0.45,
        clearProps: "all",
      });
    }

    // 2. Heading
    if (heading) {
      tl.from(
        heading,
        {
          opacity: 0,
          y: 24,
          duration: 0.55,
          clearProps: "all",
        },
        "-=0.28",
      );
    }

    // 3. Paragraph
    if (desc) {
      tl.from(
        desc,
        {
          opacity: 0,
          y: 20,
          duration: 0.5,
          clearProps: "all",
        },
        "-=0.35",
      );
    }

    // 4. CTA buttons
    if (actions) {
      tl.from(
        actions.children,
        {
          opacity: 0,
          y: 16,
          duration: 0.45,
          stagger: 0.1,
          clearProps: "all",
        },
        "-=0.3",
      );
    }

    if (signature) {
      tl.from(
        signature,
        {
          opacity: 0,
          y: 12,
          duration: 0.4,
          clearProps: "all",
        },
        "-=0.2",
      );
    }

    // 5. Current Role card
    if (card) {
      tl.from(
        card,
        {
          opacity: 0,
          y: 28,
          duration: 0.6,
          clearProps: "all",
        },
        "-=0.3",
      );
    }

    // 6. Education timeline
    if (edu) {
      tl.from(
        edu,
        {
          opacity: 0,
          y: 20,
          duration: 0.55,
          clearProps: "all",
        },
        "-=0.35",
      );
    }
  }
}

// Backward compatibility stubs
export function initRoleCardAnimation() {}
export function initAboutMetadataAnimation() {}
export function initEducationTimelineAnimation() {}

/**
/**
 * Tools & Technologies Section Entrance Animation:
 * - Eyebrow, Heading, and Subheading fade up.
 * - 6 Capability Cards reveal with smooth stagger.
 * - Respects prefers-reduced-motion.
 */
export function initSkillsAnimation() {
  const section = qs("#tools");
  if (!section || prefersReducedMotion()) return;

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const eyebrow = qs(".js-tools-eyebrow", section);
    const heading = qs(".js-tools-heading", section);
    const subheading = qs(".js-tools-subheading", section);
    const cards = qsa(".js-tools-card", section);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        once: true,
      },
      defaults: { ease: "power2.out", immediateRender: false },
    });

    if (eyebrow) {
      tl.from(eyebrow, {
        opacity: 0,
        y: 16,
        duration: 0.45,
        clearProps: "all",
      });
    }

    if (heading) {
      tl.from(
        heading,
        {
          opacity: 0,
          y: 22,
          duration: 0.5,
          clearProps: "all",
        },
        "-=0.28",
      );
    }

    if (subheading) {
      tl.from(
        subheading,
        {
          opacity: 0,
          y: 16,
          duration: 0.45,
          clearProps: "all",
        },
        "-=0.3",
      );
    }

    if (cards.length) {
      tl.from(
        cards,
        {
          opacity: 0,
          y: 28,
          duration: 0.55,
          stagger: 0.08,
          clearProps: "all",
        },
        "-=0.2",
      );
    }
  }
}

/**
 * Industries / Reach section entrance animation:
 * Sequence:
 * 1. Heading & description fade up.
 * 2. Stats fade in from right.
 * 3. Cards animate in with stagger.
 * 4. Bottom CTA fades in.
 * Hover interactions remain pure CSS.
 */
export function initIndustriesAnimation() {
  const section = qs("#industries");
  if (!section || prefersReducedMotion()) return;

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const header = qs(".industries-header__content", section);
    const stats = qs(".industries-credibility", section);
    const cards = qsa(".industries-card", section);
    const bottom = qs(".industries-bottom", section);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
        once: true,
      },
      defaults: { ease: "power2.out", immediateRender: false },
    });

    if (header) {
      tl.from(header.children, {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.08,
        clearProps: "all",
      });
    }

    if (stats) {
      tl.from(
        stats,
        {
          opacity: 0,
          x: 24,
          duration: 0.5,
          clearProps: "all",
        },
        "-=0.3",
      );
    }

    if (cards.length) {
      tl.from(
        cards,
        {
          opacity: 0,
          y: 18,
          duration: 0.4,
          stagger: 0.04,
          clearProps: "all",
        },
        "-=0.25",
      );
    }

    if (bottom) {
      tl.from(
        bottom,
        {
          opacity: 0,
          y: 14,
          duration: 0.4,
          clearProps: "all",
        },
        "-=0.15",
      );
    }
  }
}

/**
 * Capabilities Radial Hub-and-Spoke Animation:
 * Calculates dynamic SVG bezier curves between the 8 cards and the central hub,
 * adapting smoothly to desktop viewports and screen resize.
 * Staggers entrance of header, stats, center hub, spoke cards, and connector lines.
 */
export function initCapabilitiesAnimation() {
  const section = qs("#capabilities");
  if (!section) return;

  const diagram = qs(".js-capabilities-diagram", section);
  const svg = qs(".js-capabilities-connectors", section);
  const hub = qs(".capabilities-hub", section);
  const cards = qsa(".capabilities-card", section);
  if (!diagram || !svg || !hub || !cards.length) return;

  function drawConnectors() {
    if (window.innerWidth <= 1024) {
      svg.innerHTML = "";
      return;
    }

    const diagramRect = diagram.getBoundingClientRect();
    const hubRect = hub.getBoundingClientRect();

    if (diagramRect.width === 0 || hubRect.width === 0) return;

    const centerX = hubRect.left + hubRect.width / 2 - diagramRect.left;
    const centerY = hubRect.top + hubRect.height / 2 - diagramRect.top;
    const orbitRadius = (hubRect.width / 2) * 0.98;

    svg.setAttribute(
      "viewBox",
      `0 0 ${diagramRect.width} ${diagramRect.height}`,
    );
    svg.setAttribute("width", `${diagramRect.width}`);
    svg.setAttribute("height", `${diagramRect.height}`);
    svg.innerHTML = "";

    // Draw mathematically aligned outer orbit ring in SVG
    const orbitCircle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    orbitCircle.setAttribute("cx", centerX.toFixed(1));
    orbitCircle.setAttribute("cy", centerY.toFixed(1));
    orbitCircle.setAttribute("r", orbitRadius.toFixed(1));
    orbitCircle.setAttribute("fill", "none");
    orbitCircle.setAttribute("stroke", "#BEE0D3");
    orbitCircle.setAttribute("stroke-width", "1.5");
    orbitCircle.setAttribute("stroke-dasharray", "4 4");
    orbitCircle.setAttribute("class", "capabilities-orbit-svg");
    svg.appendChild(orbitCircle);

    // Angular distribution for left 4 nodes (top-to-bottom) and right 4 nodes (top-to-bottom)
    const leftAngles = [
      Math.PI * 1.22, // 01 Project Management (top left)
      Math.PI * 1.08, // 02 Stakeholder Management
      Math.PI * 0.92, // 03 Team Leadership
      Math.PI * 0.78, // 04 Website Planning (bottom left)
    ];

    const rightAngles = [
      Math.PI * 1.78, // 05 Development (top right)
      Math.PI * 1.92, // 06 SEO Strategy
      Math.PI * 0.08, // 07 UI / UX Design
      Math.PI * 0.22, // 08 Automation (bottom right)
    ];

    cards.forEach((card) => {
      const cardId = parseInt(card.getAttribute("data-card-id"), 10);
      const isLeft = cardId <= 4;
      const cardRect = card.getBoundingClientRect();

      let startX, startY, endX, endY;

      if (isLeft) {
        // Card right edge center
        startX = cardRect.right - diagramRect.left;
        startY = cardRect.top + cardRect.height / 2 - diagramRect.top;
        const angle = leftAngles[cardId - 1];
        endX = centerX + orbitRadius * Math.cos(angle);
        endY = centerY + orbitRadius * Math.sin(angle);
      } else {
        // Card left edge center
        startX = cardRect.left - diagramRect.left;
        startY = cardRect.top + cardRect.height / 2 - diagramRect.top;
        const angle = rightAngles[cardId - 5];
        endX = centerX + orbitRadius * Math.cos(angle);
        endY = centerY + orbitRadius * Math.sin(angle);
      }

      // Smooth horizontal S-curve bezier
      const deltaX = (endX - startX) * 0.55;
      const cp1X = startX + deltaX;
      const cp1Y = startY;
      const cp2X = endX - deltaX;
      const cp2Y = endY;

      const pathData = `M ${startX.toFixed(1)} ${startY.toFixed(1)} C ${cp1X.toFixed(1)} ${cp1Y.toFixed(1)}, ${cp2X.toFixed(1)} ${cp2Y.toFixed(1)}, ${endX.toFixed(1)} ${endY.toFixed(1)}`;

      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "capabilities-connector-group");

      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      path.setAttribute("d", pathData);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", "#BEE0D3");
      path.setAttribute("stroke-width", "1.5");
      path.setAttribute("class", "capabilities-connector-path");

      // Start dot on card edge
      const startCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      startCircle.setAttribute("cx", startX.toFixed(1));
      startCircle.setAttribute("cy", startY.toFixed(1));
      startCircle.setAttribute("r", "3.5");
      startCircle.setAttribute("fill", "#1F4F46");
      startCircle.setAttribute("class", "capabilities-connector-dot");

      // End dot on hub orbit
      const endCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      endCircle.setAttribute("cx", endX.toFixed(1));
      endCircle.setAttribute("cy", endY.toFixed(1));
      endCircle.setAttribute("r", "3.5");
      endCircle.setAttribute("fill", "#1F4F46");
      endCircle.setAttribute("class", "capabilities-connector-dot");

      g.appendChild(path);
      g.appendChild(startCircle);
      g.appendChild(endCircle);
      svg.appendChild(g);
    });
  }

  // Initial draw and event listeners
  drawConnectors();
  window.addEventListener("resize", drawConnectors);
  window.addEventListener("load", drawConnectors);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(drawConnectors);
  }

  if (prefersReducedMotion()) return;

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const header = qs(".capabilities-header__content", section);
    const stats = qs(".capabilities-credibility", section);
    const leftCards = qsa(
      ".capabilities-column--left .capabilities-card",
      section,
    );
    const rightCards = qsa(
      ".capabilities-column--right .capabilities-card",
      section,
    );
    const hubCore = qs(".capabilities-hub__core", section);
    const orbit = qs(".capabilities-hub__orbit", section);
    const footer = qs(".capabilities-footer", section);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
        once: true,
        onComplete: drawConnectors,
      },
      defaults: { ease: "power2.out", immediateRender: false },
    });

    if (header) {
      tl.from(header.children, {
        opacity: 0,
        y: 24,
        duration: 0.5,
        stagger: 0.08,
        clearProps: "all",
      });
    }

    if (stats) {
      tl.from(
        stats,
        {
          opacity: 0,
          x: 24,
          duration: 0.5,
          clearProps: "all",
        },
        "-=0.3",
      );
    }

    if (hubCore) {
      tl.from(
        [hubCore, orbit].filter(Boolean),
        {
          scale: 0.82,
          opacity: 0,
          duration: 0.6,
          ease: "back.out(1.4)",
          clearProps: "all",
        },
        "-=0.25",
      );
    }

    if (leftCards.length) {
      tl.from(
        leftCards,
        {
          opacity: 0,
          x: -24,
          duration: 0.45,
          stagger: 0.06,
          clearProps: "all",
        },
        "-=0.4",
      );
    }

    if (rightCards.length) {
      tl.from(
        rightCards,
        {
          opacity: 0,
          x: 24,
          duration: 0.45,
          stagger: 0.06,
          clearProps: "all",
        },
        "-=0.4",
      );
    }

    if (svg) {
      tl.from(
        svg,
        {
          opacity: 0,
          duration: 0.4,
          clearProps: "all",
        },
        "-=0.2",
      );
    }

    if (footer) {
      tl.from(
        footer.children,
        {
          opacity: 0,
          y: 16,
          duration: 0.4,
          stagger: 0.1,
          clearProps: "all",
        },
        "-=0.15",
      );
    }
  }
}

/**
 * Featured Projects (Section 8) Case Studies:
 * GSAP ScrollTrigger sequence:
 * 1. Heading fades up
 * 2. Metrics & button slide in
 * 3. Project cards animate upward one-by-one
 * 4. Hero images fade in separately
 *
 * Respects reduced-motion.
 */
export function initFeaturedProjectsAnimation() {
  const section = qs(".projects-section");
  if (!section) return;

  if (prefersReducedMotion()) return;

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const headerLeft = qs(".projects-header__left", section);
    const viewAllBtn = qs(".projects-view-all-btn", section);
    const metrics = qs(".projects-credibility", section);
    const cards = qsa(".projects-card", section);
    const signature = qs(".projects-signature", section);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
        once: true,
      },
      defaults: { ease: "power2.out", immediateRender: false },
    });

    // 1. Heading fades up
    if (headerLeft) {
      tl.from(headerLeft.children, {
        opacity: 0,
        y: 24,
        duration: 0.55,
        stagger: 0.08,
        clearProps: "all",
      });
    }

    // 2. Metrics & button slide in
    if (viewAllBtn) {
      tl.from(
        viewAllBtn,
        {
          opacity: 0,
          y: 16,
          duration: 0.45,
          clearProps: "all",
        },
        "-=0.35",
      );
    }

    if (metrics) {
      tl.from(
        metrics,
        {
          opacity: 0,
          x: 24,
          duration: 0.5,
          clearProps: "all",
        },
        "-=0.35",
      );
    }

    // 3. Project cards animate upward one-by-one
    if (cards.length) {
      tl.from(
        cards,
        {
          opacity: 0,
          y: 36,
          duration: 0.6,
          stagger: 0.1,
          clearProps: "all",
        },
        "-=0.2",
      );
    }

    // Bottom signature
    if (signature) {
      tl.from(
        signature,
        {
          opacity: 0,
          y: 16,
          duration: 0.5,
          clearProps: "all",
        },
        "-=0.2",
      );
    }
  }
}

/**
 * Recruiter Closing CTA Section:
 * GSAP ScrollTrigger sequence:
 * 1. Eyebrow fades up
 * 2. Main heading fades up
 * 3. Supporting description fades up
 * 4. Availability badges fade in one by one (stagger)
 * 5. Action buttons fade in
 * 6. Bottom signature divider fades in
 *
 * Respects reduced-motion.
 */
export function initRecruiterCTAAnimation() {
  const section = qs(".recruiter-cta-section");
  if (!section) return;

  if (prefersReducedMotion()) return;

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const eyebrow = qs(".js-recruiter-eyebrow", section);
    const heading = qs(".js-recruiter-heading", section);
    const desc = qs(".js-recruiter-desc", section);
    const badges = qsa(".js-recruiter-badge", section);
    const actions = qs(".js-recruiter-actions", section);
    const signature = qs(".js-recruiter-signature", section);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 78%",
        once: true,
      },
      defaults: { ease: "power2.out", immediateRender: false },
    });

    if (eyebrow) {
      tl.from(eyebrow, {
        opacity: 0,
        y: 16,
        duration: 0.45,
        clearProps: "all",
      });
    }

    if (heading) {
      tl.from(
        heading,
        {
          opacity: 0,
          y: 28,
          duration: 0.65,
          clearProps: "all",
        },
        "-=0.25",
      );
    }

    if (desc) {
      tl.from(
        desc,
        {
          opacity: 0,
          y: 20,
          duration: 0.55,
          clearProps: "all",
        },
        "-=0.35",
      );
    }

    if (badges.length) {
      tl.from(
        badges,
        {
          opacity: 0,
          y: 16,
          duration: 0.45,
          stagger: 0.1,
          clearProps: "all",
        },
        "-=0.3",
      );
    }

    if (actions) {
      tl.from(
        actions,
        {
          opacity: 0,
          y: 18,
          duration: 0.5,
          clearProps: "all",
        },
        "-=0.25",
      );
    }

    if (signature) {
      tl.from(
        signature,
        {
          opacity: 0,
          y: 14,
          duration: 0.55,
          clearProps: "all",
        },
        "-=0.2",
      );
    }
  }
}

/**
 * Footer Section Entrance Animation:
 * GSAP ScrollTrigger sequence:
 * 1. Left column elements fade up
 * 2. Contact items scale/fade in with stagger
 * 3. Divider line expands/fades
 * 4. Bottom row elements fade in
 *
 * Respects reduced-motion.
 */
export function initFooterAnimation() {
  const footer = qs(".footer");
  if (!footer) return;

  if (prefersReducedMotion()) return;

  if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);

    const leftCol = qs(".footer__col-left", footer);
    const contactItems = qsa(".footer__contact-item", footer);
    const divider = qs(".footer__divider", footer);
    const bottomRow = qs(".footer__bottom", footer);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footer,
        start: "top 88%",
        once: true,
      },
      defaults: { ease: "power2.out", immediateRender: false },
    });

    if (leftCol) {
      tl.from(leftCol.children, {
        opacity: 0,
        y: 20,
        duration: 0.55,
        stagger: 0.08,
        clearProps: "all",
      });
    }

    if (contactItems.length) {
      tl.from(
        contactItems,
        {
          opacity: 0,
          scale: 0.94,
          y: 14,
          duration: 0.45,
          stagger: 0.08,
          clearProps: "all",
        },
        "-=0.25",
      );
    }

    if (divider) {
      tl.from(
        divider,
        {
          opacity: 0,
          duration: 0.5,
          clearProps: "all",
        },
        "-=0.2",
      );
    }

    if (bottomRow) {
      tl.from(
        bottomRow.children,
        {
          opacity: 0,
          y: 12,
          duration: 0.45,
          stagger: 0.06,
          clearProps: "all",
        },
        "-=0.2",
      );
    }
  }
}


