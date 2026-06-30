/**
 * Seed script: populates the Skill table with the 50 UI/UX Pro Max skills.
 *
 * Run with:
 *   npx ts-node --project tsconfig.json -e "require('./prisma/seed-skills.ts')"
 * Or via package.json script:
 *   npx prisma db seed
 *
 * Safe to re-run — uses upsert so existing records are updated, not duplicated.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SKILLS = [
    { name: "Color Contrast", category: "Accessibility", icon: "🎨", color: "#6366F1", keywords: ["wcag", "contrast ratio", "a11y", "readable", "4.5:1", "accessibility"] },
    { name: "Focus States", category: "Accessibility", icon: "🔹", color: "#8B5CF6", keywords: ["focus-ring", "keyboard", "outline", "tab-focus", "focus-visible"] },
    { name: "Alt Text", category: "Accessibility", icon: "🖼️", color: "#A78BFA", keywords: ["alt-text", "screen-reader", "image", "aria", "html", "seo"] },
    { name: "ARIA Labels", category: "Accessibility", icon: "♿", color: "#7C3AED", keywords: ["aria-label", "icon-button", "screen-reader", "semantic-html"] },
    { name: "Keyboard Navigation", category: "Accessibility", icon: "⌨️", color: "#5B21B6", keywords: ["keyboard-nav", "tab-order", "focus-trap", "skip-links"] },
    { name: "Form Labels", category: "Accessibility", icon: "📋", color: "#6D28D9", keywords: ["form-labels", "label", "for-attribute", "input", "forms"] },
    { name: "Touch Target Size", category: "Touch & Interaction", icon: "👆", color: "#EC4899", keywords: ["touch-target", "44px", "mobile", "tap", "button-size"] },
    { name: "Hover vs Tap", category: "Touch & Interaction", icon: "🖱️", color: "#DB2777", keywords: ["hover", "tap", "click", "mobile-first", "pointer-events"] },
    { name: "Loading Buttons", category: "Touch & Interaction", icon: "⏳", color: "#BE185D", keywords: ["loading", "disabled", "spinner", "async", "button-state"] },
    { name: "Error Feedback", category: "Touch & Interaction", icon: "⚠️", color: "#F43F5E", keywords: ["error", "validation", "toast", "inline-error", "form"] },
    { name: "Cursor Pointer", category: "Touch & Interaction", icon: "🖱️", color: "#E11D48", keywords: ["cursor-pointer", "clickable", "css-cursor", "interactive"] },
    { name: "Image Optimization", category: "Performance", icon: "🚀", color: "#F59E0B", keywords: ["webp", "srcset", "lazy-loading", "next-image", "lcp", "core-web-vitals"] },
    { name: "Reduced Motion", category: "Performance", icon: "🎯", color: "#D97706", keywords: ["prefers-reduced-motion", "animation", "accessibility", "vestibular"] },
    { name: "Content Layout Shift", category: "Performance", icon: "📐", color: "#B45309", keywords: ["cls", "content-jumping", "skeleton", "core-web-vitals", "layout-shift"] },
    { name: "Viewport Meta", category: "Layout & Responsive", icon: "📱", color: "#10B981", keywords: ["viewport", "device-width", "meta-tag", "responsive", "mobile"] },
    { name: "Readable Font Size", category: "Layout & Responsive", icon: "📏", color: "#059669", keywords: ["font-size", "16px", "readability", "typography", "body-text"] },
    { name: "Horizontal Scroll Prevention", category: "Layout & Responsive", icon: "↔️", color: "#047857", keywords: ["overflow-x", "horizontal-scroll", "viewport", "flex"] },
    { name: "Z-Index Management", category: "Layout & Responsive", icon: "🃏", color: "#065F46", keywords: ["z-index", "stacking-context", "modal", "overlay", "dropdown"] },
    { name: "CSS Grid & Flexbox", category: "Layout & Responsive", icon: "🔲", color: "#34D399", keywords: ["grid", "flexbox", "layout", "responsive", "css", "alignment"] },
    { name: "Responsive Breakpoints", category: "Layout & Responsive", icon: "📲", color: "#6EE7B7", keywords: ["breakpoints", "sm", "md", "lg", "tailwind", "media-queries"] },
    { name: "Line Height", category: "Typography", icon: "⬆️", color: "#3B82F6", keywords: ["line-height", "leading", "1.5", "1.75", "readability"] },
    { name: "Line Length", category: "Typography", icon: "📏", color: "#2563EB", keywords: ["measure", "65-75 chars", "reading-width", "prose"] },
    { name: "Font Pairing", category: "Typography", icon: "🔤", color: "#1D4ED8", keywords: ["font-pairing", "heading-font", "body-font", "google-fonts"] },
    { name: "Type Scale", category: "Typography", icon: "🔡", color: "#1E40AF", keywords: ["type-scale", "modular-scale", "h1-h6", "hierarchy"] },
    { name: "Font Weight & Style", category: "Typography", icon: "B", color: "#1E3A8A", keywords: ["font-weight", "bold", "semibold", "italic", "emphasis"] },
    { name: "Color System Design", category: "Color", icon: "🌈", color: "#F97316", keywords: ["color-system", "palette", "primary", "secondary", "design-tokens"] },
    { name: "Dark Mode", category: "Color", icon: "🌙", color: "#EA580C", keywords: ["dark-mode", "light-mode", "color-scheme", "next-themes", "css-variables"] },
    { name: "Semantic Color Tokens", category: "Color", icon: "🏷️", color: "#C2410C", keywords: ["design-tokens", "success", "warning", "error", "info"] },
    { name: "Color Blindness Support", category: "Color", icon: "👁️", color: "#9A3412", keywords: ["color-blindness", "deuteranopia", "protanopia", "a11y"] },
    { name: "Duration & Timing", category: "Animation", icon: "⚡", color: "#14B8A6", keywords: ["animation", "150ms", "300ms", "easing", "micro-interactions"] },
    { name: "Transform Performance", category: "Animation", icon: "🎞️", color: "#0D9488", keywords: ["transform", "opacity", "gpu", "composited-layers"] },
    { name: "Loading States & Skeletons", category: "Animation", icon: "💀", color: "#0F766E", keywords: ["skeleton", "shimmer", "spinner", "placeholder"] },
    { name: "Framer Motion", category: "Animation", icon: "🎭", color: "#134E4A", keywords: ["framer-motion", "motion", "animate", "spring", "variants"] },
    { name: "Design System Creation", category: "UI Design", icon: "🧩", color: "#8B5CF6", keywords: ["design-system", "component-library", "tokens", "storybook", "figma"] },
    { name: "Style Matching", category: "UI Design", icon: "🎨", color: "#7C3AED", keywords: ["style-match", "saas", "fintech", "glassmorphism"] },
    { name: "Component Consistency", category: "UI Design", icon: "🔄", color: "#6D28D9", keywords: ["consistency", "design-language", "reusable-components", "ui-kit"] },
    { name: "SVG Icon System", category: "UI Design", icon: "✏️", color: "#5B21B6", keywords: ["svg", "icons", "lucide", "heroicons", "scalable"] },
    { name: "Chart Type Selection", category: "Charts & Data", icon: "📊", color: "#06B6D4", keywords: ["chart-type", "bar", "line", "pie", "recharts", "d3"] },
    { name: "Accessible Chart Colors", category: "Charts & Data", icon: "🎰", color: "#0891B2", keywords: ["chart-colors", "colorblind-safe", "data-viz", "recharts"] },
    { name: "Data Table Accessibility", category: "Charts & Data", icon: "📋", color: "#0E7490", keywords: ["data-table", "sortable", "filterable", "aria-table", "accessibility"] },
    { name: "Landing Page UX", category: "Product Design", icon: "🚀", color: "#F59E0B", keywords: ["landing-page", "hero", "cta", "above-fold", "conversion"] },
    { name: "Dashboard UX", category: "Product Design", icon: "📈", color: "#D97706", keywords: ["dashboard", "kpi", "widgets", "analytics", "saas"] },
    { name: "Empty State Design", category: "Product Design", icon: "📭", color: "#B45309", keywords: ["empty-state", "zero-state", "onboarding", "cta"] },
    { name: "Onboarding Flow", category: "Product Design", icon: "🎯", color: "#92400E", keywords: ["onboarding", "walkthrough", "tooltip", "wizard", "first-run"] },
    { name: "React Component Architecture", category: "Front-End Tech", icon: "⚛️", color: "#61DAFB", keywords: ["react", "components", "props", "hooks", "composition"] },
    { name: "Next.js App Router", category: "Front-End Tech", icon: "▲", color: "#6366F1", keywords: ["nextjs", "app-router", "server-components", "rsc", "routing"] },
    { name: "Tailwind CSS", category: "Front-End Tech", icon: "🌬️", color: "#38BDF8", keywords: ["tailwind", "utility-first", "responsive", "dark-mode", "jit"] },
    { name: "shadcn/ui", category: "Front-End Tech", icon: "🧱", color: "#94A3B8", keywords: ["shadcn", "radix-ui", "component-library", "accessible", "headless-ui"] },
    { name: "Figma Prototyping", category: "UX Research", icon: "🎨", color: "#FF7262", keywords: ["figma", "prototype", "wireframe", "mockup", "design-handoff"] },
    { name: "User Research & Heuristics", category: "UX Research", icon: "🔬", color: "#A259FF", keywords: ["user-research", "heuristics", "usability-testing", "personas", "ux-audit"] },
] as const;

async function main() {
    console.log(`\n🌱 Seeding ${SKILLS.length} UI/UX skills…\n`);

    let upserted = 0;
    let errored = 0;

    for (const skill of SKILLS) {
        try {
            await prisma.skill.upsert({
                where: { name: skill.name },
                update: {
                    category: skill.category,
                    icon: skill.icon,
                    color: skill.color,
                    keywords: [...skill.keywords],
                },
                create: {
                    name: skill.name,
                    category: skill.category,
                    icon: skill.icon,
                    color: skill.color,
                    keywords: [...skill.keywords],
                },
            });
            console.log(`  ✅  ${skill.name.padEnd(40)} [${skill.category}]`);
            upserted++;
        } catch (err) {
            console.error(`  ❌  ${skill.name}:`, err);
            errored++;
        }
    }

    console.log(`\n📊 Done. ${upserted} upserted, ${errored} errors.\n`);
}

main()
    .catch((err) => {
        console.error("Seed failed:", err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
