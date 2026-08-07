import { Transition } from "framer-motion"

/**
 * Standardized spring physics for the CampusConnect Premium redesign.
 * Inspired by Apple and Linear's snappy, interruptible motion.
 */

// Snappy and responsive. Use for buttons, toggles, small UI elements.
export const springSnappy: Transition = {
  type: "spring",
  stiffness: 400,
  damping: 25,
  mass: 1
}

// Slightly softer. Use for cards, dropdowns, panels.
export const springSmooth: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 1
}

// Slow, gentle reveal. Use for initial page loads or heavy components.
export const springGentle: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 40,
  mass: 1
}

// Stiff with slight bounce. Use for delightful interactions (success states, badges).
export const springBouncy: Transition = {
  type: "spring",
  stiffness: 500,
  damping: 15,
  mass: 1
}

// Micro-interactions (e.g. scale down on press)
export const pressScale = 0.97
export const hoverScale = 1.02
