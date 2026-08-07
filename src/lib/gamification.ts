// ── Gamification constants ────────────────────────────────────────────────────

export const XP_REWARDS = {
  GIG_COMPLETED: 200,
  FIRST_GIG: 500,          // bonus on top
  REVIEW_RECEIVED_5STAR: 100,
  REVIEW_RECEIVED_4STAR: 50,
  SKILL_VERIFIED: 75,
  PROFILE_COMPLETE: 150,
  STREAK_7: 100,
  STREAK_30: 500,
  STREAK_100: 2000,
  REFERRAL_SIGNUP: 100,
  BADGE_EARNED: 50,         // base, per badge
} as const

export const LEVEL_THRESHOLDS = [
  { level: 1,  title: "Newcomer",      minXp: 0 },
  { level: 2,  title: "Explorer",      minXp: 200 },
  { level: 3,  title: "Starter",       minXp: 500 },
  { level: 4,  title: "Apprentice",    minXp: 1000 },
  { level: 5,  title: "Builder",       minXp: 2000 },
  { level: 6,  title: "Achiever",      minXp: 3500 },
  { level: 7,  title: "Professional",  minXp: 5500 },
  { level: 8,  title: "Expert",        minXp: 8000 },
  { level: 9,  title: "Master",        minXp: 12000 },
  { level: 10, title: "Elite",         minXp: 18000 },
  { level: 11, title: "Legend",        minXp: 28000 },
  { level: 12, title: "Campus Icon",   minXp: 45000 },
]

export const STREAK_MULTIPLIERS: Record<number, number> = {
  3: 1.1,
  7: 1.2,
  14: 1.35,
  30: 1.5,
  60: 1.75,
  100: 2.0,
}

export const BADGES = [
  // Gig milestones
  { slug: "first-gig",      name: "First Step",      icon: "🚀", color: "#10B981", tier: "BRONZE",   xpReward: 100,  rarity: "COMMON",    requirement: { type: "gig_count", value: 1 },   description: "Completed your first gig" },
  { slug: "gigs-5",         name: "Getting Started",  icon: "⚡", color: "#0EA5E9", tier: "BRONZE",   xpReward: 200,  rarity: "COMMON",    requirement: { type: "gig_count", value: 5 },   description: "Completed 5 gigs" },
  { slug: "gigs-10",        name: "Consistent",       icon: "🔥", color: "#F59E0B", tier: "SILVER",   xpReward: 400,  rarity: "UNCOMMON",  requirement: { type: "gig_count", value: 10 },  description: "Completed 10 gigs" },
  { slug: "gigs-25",        name: "Seasoned Pro",     icon: "💎", color: "#7C3AED", tier: "GOLD",     xpReward: 800,  rarity: "RARE",      requirement: { type: "gig_count", value: 25 },  description: "Completed 25 gigs" },
  { slug: "gigs-50",        name: "Campus Legend",    icon: "👑", color: "#FF4500", tier: "PLATINUM", xpReward: 2000, rarity: "EPIC",      requirement: { type: "gig_count", value: 50 },  description: "Completed 50 gigs" },
  // Earning milestones
  { slug: "first-earning",  name: "First Rupee",      icon: "₹",  color: "#10B981", tier: "BRONZE",   xpReward: 150,  rarity: "COMMON",    requirement: { type: "earned_inr", value: 1 },      description: "Earned your first rupee" },
  { slug: "earn-5k",        name: "Side Hustler",     icon: "💰", color: "#F59E0B", tier: "SILVER",   xpReward: 300,  rarity: "UNCOMMON",  requirement: { type: "earned_inr", value: 5000 },   description: "Earned ₹5,000 total" },
  { slug: "earn-25k",       name: "Freelance Ready",  icon: "🎯", color: "#0EA5E9", tier: "GOLD",     xpReward: 750,  rarity: "RARE",      requirement: { type: "earned_inr", value: 25000 },  description: "Earned ₹25,000 total" },
  { slug: "earn-1l",        name: "Lakhpati",         icon: "🏆", color: "#7C3AED", tier: "PLATINUM", xpReward: 3000, rarity: "EPIC",      requirement: { type: "earned_inr", value: 100000 }, description: "Earned ₹1 Lakh total" },
  // Streak badges
  { slug: "streak-7",       name: "Week Warrior",     icon: "🔥", color: "#EF4444", tier: "BRONZE",   xpReward: 200,  rarity: "COMMON",    requirement: { type: "streak_days", value: 7 },   description: "7-day activity streak" },
  { slug: "streak-30",      name: "Monthly Master",   icon: "🌟", color: "#F59E0B", tier: "SILVER",   xpReward: 500,  rarity: "UNCOMMON",  requirement: { type: "streak_days", value: 30 },  description: "30-day activity streak" },
  { slug: "streak-100",     name: "Century Club",     icon: "💯", color: "#7C3AED", tier: "GOLD",     xpReward: 2000, rarity: "LEGENDARY", requirement: { type: "streak_days", value: 100 }, description: "100-day activity streak" },
  // Special
  { slug: "five-star",      name: "Perfect Score",    icon: "⭐", color: "#F59E0B", tier: "GOLD",     xpReward: 500,  rarity: "RARE",      requirement: { type: "rating_5star", value: 5 },  description: "Received 5 consecutive 5-star ratings" },
  { slug: "early-adopter",  name: "Early Adopter",    icon: "🌱", color: "#10B981", tier: "LEGENDARY",xpReward: 1000, rarity: "LEGENDARY", requirement: { type: "special", value: 1 },       description: "Among the first 1000 CampusConnect users" },
] as const

export type XpEventType = keyof typeof XP_REWARDS
export type BadgeSlug = typeof BADGES[number]["slug"]

// ── Compute level from totalXp ────────────────────────────────────────────────
export function computeLevel(totalXp: number): { level: number; title: string; currentMin: number; nextMin: number; progress: number } {
  let current = LEVEL_THRESHOLDS[0]
  let next = LEVEL_THRESHOLDS[1]

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= LEVEL_THRESHOLDS[i].minXp) {
      current = LEVEL_THRESHOLDS[i]
      next = LEVEL_THRESHOLDS[i + 1] ?? LEVEL_THRESHOLDS[i]
      break
    }
  }

  const rangeXp = next.minXp - current.minXp
  const earnedXp = totalXp - current.minXp
  const progress = rangeXp > 0 ? Math.min(100, Math.round((earnedXp / rangeXp) * 100)) : 100

  return { level: current.level, title: current.title, currentMin: current.minXp, nextMin: next.minXp, progress }
}

// ── Streak multiplier ─────────────────────────────────────────────────────────
export function getStreakMultiplier(streak: number): number {
  const thresholds = Object.keys(STREAK_MULTIPLIERS).map(Number).sort((a, b) => b - a)
  for (const t of thresholds) {
    if (streak >= t) return STREAK_MULTIPLIERS[t]
  }
  return 1.0
}

// ── Compute smart score (composite 0-100) ─────────────────────────────────────
export function computeSmartScore(r: number | null | undefined, e: number | null | undefined, l: number | null | undefined, c: number | null | undefined): number {
  return Math.min(100, Math.round((r || 0) * 0.35 + (e || 0) * 0.35 + (l || 0) * 0.2 + (c || 0) * 0.1))
}
