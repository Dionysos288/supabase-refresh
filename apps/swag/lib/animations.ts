/* ─────────────────────────────────────────────────────────
 * SHARED ANIMATION SPECS
 *
 * One enter language for the whole page:
 * - Scroll sections rise 24px + fade + 4px blur that
 *   sharpens as they land, on a shared spring. The blur
 *   masks the fade so a section reads as one object
 *   arriving rather than text crossfading over the page.
 * - The catalog card grid skips the blur: 30 images
 *   animating `filter` at once is main-thread work that
 *   drops frames, so cards keep rise + fade only.
 * - Mount entrances (nav, hero, ticker) use the same
 *   distances with an eased duration so the first paint
 *   sequence can be choreographed with per-element delays.
 * ───────────────────────────────────────────────────────── */

export const REVEAL = {
  offsetY: 28, //  px risen while fading in
  blur: 4, //      px of blur at the start of the reveal
  // Slower, heavier spring than a SaaS page — sections should land
  // like a printed spread turning, not a toast notification.
  spring: { type: 'spring' as const, stiffness: 190, damping: 32 },
  viewport: { once: true, margin: '-64px' },
}

export const sectionVariants = {
  hidden: { opacity: 0, y: REVEAL.offsetY, filter: `blur(${REVEAL.blur}px)` },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: REVEAL.spring },
}

/** For containers that stagger children through the reveal. */
export const staggerContainer = (stagger: number) => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger } },
})

/* Mount entrance (nav, hero, ticker — plays on load, not scroll) */
export const MOUNT = {
  ease: [0.22, 1, 0.36, 1] as const,
  offsetY: 24,
  blur: REVEAL.blur,
}

export const fadeUpMount = (delay: number, duration: number) => ({
  initial: { opacity: 0, y: MOUNT.offsetY, filter: `blur(${MOUNT.blur}px)` },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration, ease: MOUNT.ease, delay },
})

export const fadeDownMount = (delay: number, duration: number, offsetY = -16) => ({
  initial: { opacity: 0, y: offsetY, filter: `blur(${MOUNT.blur}px)` },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration, ease: MOUNT.ease, delay },
})

/* Label/width morph (add-to-cart buttons, cursor chip) */
export const MORPH = {
  width: { type: 'spring' as const, stiffness: 350, damping: 30 },
  charStagger: 0.015, // seconds between characters
  charEnter: { duration: 0.3, ease: 'easeOut' as const },
  labelExit: { duration: 0.12, ease: 'easeOut' as const },
}
