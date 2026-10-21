// ==========================================================================
// Gallery / Lightbox
// ==========================================================================

import { qs, qsa } from "./utils.js";

export function initGallery() {
  const gallery = qs(".js-gallery");
  if (!gallery) return;

  const lightbox = qs(".js-lightbox");
  const lightboxImg = qs(".js-lightbox-img", lightbox);
  const closeBtn = qs(".js-lightbox-close", lightbox);

  function open(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    lightbox.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  qsa(".gallery__item", gallery).forEach((item) => {
    item.addEventListener("click", () => {
      const img = qs("img", item);
      if (img) open(img.src, img.alt);
    });
    item.setAttribute("tabindex", "0");
    item.setAttribute("role", "button");
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const img = qs("img", item);
        if (img) open(img.src, img.alt);
      }
    });
  });

  closeBtn?.addEventListener("click", close);
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}
