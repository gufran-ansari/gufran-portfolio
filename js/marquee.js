// ==========================================================================
// Marquee
// ==========================================================================

import { qsa } from "./utils.js";

/**
 * The CSS keyframe animates the track from translateX(0) to
 * translateX(-50%), so we duplicate the track's contents exactly once
 * here — the markup itself only needs to list the logos a single time.
 */
export function initMarquee() {
  qsa(".js-marquee-track").forEach((track) => {
    const original = Array.from(track.children);
    original.forEach((child) => {
      track.appendChild(child.cloneNode(true));
    });
  });
}
