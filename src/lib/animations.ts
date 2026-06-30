/**
 * CampusConnect v2.0 — Framer Motion Animation Presets
 * Reuse these across all pages for consistent animation behavior.
 */

import type { Variants, Easing } from "framer-motion";

const easeOut: Easing = "easeOut";

// ── Page / Section entrance ──────────────────────────────────────────────────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeOut } },
};

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: easeOut } },
};

// ── Stagger container — wraps children that animate in sequence ──────────────
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

// ── Card interactions ────────────────────────────────────────────────────────
export const cardHover = {
  scale: 1.02,
  transition: { duration: 0.2, ease: easeOut },
};

export const cardTap = {
  scale: 0.97,
  transition: { duration: 0.1 },
};

// ── Button interactions ──────────────────────────────────────────────────────
export const buttonHover = {
  scale: 1.02,
  transition: { duration: 0.15 },
};

export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1 },
};

// ── Scale in (modals, dropdowns) ─────────────────────────────────────────────
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

// ── Slide in (sidebars, drawers) ─────────────────────────────────────────────
export const slideInRight: Variants = {
  hidden: { opacity: 0, x: "100%" },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: easeOut },
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: { duration: 0.2 },
  },
};

export const slideInLeft: Variants = {
  hidden: { opacity: 0, x: "-100%" },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: easeOut },
  },
  exit: {
    opacity: 0,
    x: "-100%",
    transition: { duration: 0.2 },
  },
};

export const slideInBottom: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: easeOut },
  },
  exit: {
    opacity: 0,
    y: "100%",
    transition: { duration: 0.2 },
  },
};

// ── Number counter (used with useMotionValue + useSpring) ────────────────────
export const counterSpring = { duration: 2400, bounce: 0 };

// ── Tab transitions ──────────────────────────────────────────────────────────
export const tabFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

// ── List item stagger (activity feeds, notification lists) ───────────────────
export const listItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
};

// ── Viewport trigger config ──────────────────────────────────────────────────
export const viewportOnce = { once: true, margin: "-80px" };
export const viewportOnceNarrow = { once: true, margin: "-40px" };
