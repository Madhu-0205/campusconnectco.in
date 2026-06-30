import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  /** Small badge/label above the heading — styled as landing page orange pill */
  label?: string
  /** Main heading text — supports ReactNode for coloured word spans */
  title: React.ReactNode
  /** Optional subtitle / description paragraph */
  subtitle?: string
  /** Text alignment */
  align?: "left" | "center"
  /** Whether the section sits on a dark (ink) or light (paper) background */
  onDark?: boolean
  className?: string
  /** Override the heading level (default h2) */
  as?: "h1" | "h2" | "h3"
}

/**
 * SectionHeading — reusable heading block matching the landing page exactly:
 *
 *  ● Orange pill label (e.g. "EVERYTHING IN ONE PLACE")
 *  ● Syne 800 heading with tight letter-spacing
 *  ● DM Sans muted subtitle
 *
 * Usage:
 *  <SectionHeading
 *    label="OUR STORY"
 *    title="Built for every student in India"
 *    subtitle="From metros to tier-3 cities."
 *    onDark={false}
 *  />
 */
export default function SectionHeading({
  label,
  title,
  subtitle,
  align = "center",
  onDark = true,
  className,
  as: Tag = "h2",
}: SectionHeadingProps) {
  const headingColor = onDark ? "var(--color-text)"  : "var(--text-primary)"
  const subtitleColor = "var(--muted)"   // #6b6b80 — same on both backgrounds

  return (
    <div
      className={cn(
        "mb-16",
        align === "center" && "text-center",
        align === "left"   && "text-left",
        className,
      )}
    >
      {/* ── Orange pill label ─────────────────────────────────── */}
      {label && (
        <div
          className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full",
            "text-xs font-bold uppercase tracking-[0.2em] mb-6",
          )}
          style={{
            background: "rgba(255,77,28,0.1)",
            border:     "1px solid rgba(255,77,28,0.2)",
            color:      "var(--color-primary)",
          }}
        >
          {label}
        </div>
      )}

      {/* ── Main heading ──────────────────────────────────────── */}
      <Tag
        className="text-4xl sm:text-5xl tracking-tight mb-5"
        style={{
          fontFamily:    "var(--font-display)",   // Syne
          fontWeight:    800,
          letterSpacing: "-0.025em",
          lineHeight:    1.05,
          color:         headingColor,
        }}
      >
        {title}
      </Tag>

      {/* ── Subtitle ─────────────────────────────────────────── */}
      {subtitle && (
        <p
          className={cn(
            "text-lg leading-relaxed",
            align === "center" && "max-w-2xl mx-auto",
            align === "left"   && "max-w-2xl",
          )}
          style={{
            color:      subtitleColor,
            fontFamily: "var(--font-body)",
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
