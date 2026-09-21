"use client";

import { motion, AnimatePresence, useReducedMotion, type Transition } from "framer-motion";
import {
  Compass,
  Briefcase,
  Sparkles,
  ShieldCheck,
  Rocket,
  ArrowRight,
  ArrowLeft,
  X,
  RotateCcw,
  CheckCircle2,
  MapPin,
  Zap,
  Trophy,
  Sliders,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect, useCallback, useRef, useSyncExternalStore } from "react";

export interface JourneyStep {
  id: number;
  badge: string;
  tagline: string;
  headline: string;
  humorContext: string;
  highlights: string[];
  ctaText?: string;
}

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: 1,
    badge: "Hyperlocal Radar",
    tagline: "Campus Discovery",
    headline: "Still exploring? Your next opportunity might be closer than you think.",
    humorContext:
      "Whether you're in your dorm at 2 AM or dodging eye contact between lectures, the best campus gigs aren't buried on a dusty pinboard or a 40-page notice PDF.",
    highlights: [
      "Hyperlocal map tracking opportunities around your campus",
      "Real startup gigs & campus partner roles within 5km",
      "Zero noticeboard archaeology required",
    ],
  },
  {
    id: 2,
    badge: "All-In-One Ecosystem",
    tagline: "Curated Feeds",
    headline: "Internships, gigs, and hackathons—all in one place.",
    humorContext:
      "Close the 27 open browser tabs, delete the dead Discord invites, and mute the chaotic WhatsApp groups. We consolidated the entire ecosystem into one clean feed.",
    highlights: [
      "Verified internships with real stipends",
      "Weekend student gigs with milestone protection",
      "Curated hackathons with legitimate prize pools",
    ],
  },
  {
    id: 3,
    badge: "Smart Skill Match",
    tagline: "Dynamic Profiling",
    headline: "Tell us what you’re good at. We’ll help you discover what fits.",
    humorContext:
      "Whether your superpower is shipping fullstack React apps, polishing Figma vectors, or crafting unhinged viral memes for early-stage startups—someone is looking for you.",
    highlights: [
      "Dynamic skill-matching with match scores",
      "Your verified profile acts as your live resume",
      "No 3-page cover letters or robotic rejection templates",
    ],
  },
  {
    id: 4,
    badge: "Zero Fluff Guarantee",
    tagline: "Verified Quality",
    headline: "No endless searching. Just opportunities worth exploring.",
    humorContext:
      "Every gig and internship is vetted. Transparent budgets, clear milestone deliverables, and strict zero-tolerance for anyone offering to 'pay you in exposure.'",
    highlights: [
      "Transparent stipend & milestone escrow protection",
      "Verified founders and legitimate startup entities",
      "Clear deliverables: do the work, get paid, build your rep",
    ],
  },
  {
    id: 5,
    badge: "Launchpad Ready",
    tagline: "Time to Build",
    headline: "You made it this far. Ready to find your next opportunity?",
    humorContext:
      "Your journey starts now. Real founders are posting, verified gigs are live, and your next big resume-defining project is waiting.",
    highlights: [
      "Direct applications with 1-click verified credentials",
      "Live opportunities updated continuously",
      "Join ambitious students building real products",
    ],
    ctaText: "Explore Opportunities",
  },
];

const STORAGE_KEY = "campusconnect_student_journey_dismissed_v1";

function subscribeStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getStorageSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

const emptySubscribe = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

interface StudentOpportunityJourneyProps {
  initialStep?: number;
  onComplete?: () => void;
  onSkip?: () => void;
  className?: string;
}

export function StudentOpportunityJourney({
  initialStep = 0,
  onComplete,
  onSkip,
  className = "",
}: StudentOpportunityJourneyProps) {
  const [currentStep, setCurrentStep] = useState(
    Math.min(Math.max(0, initialStep), JOURNEY_STEPS.length - 1)
  );
  const storedDismissed = useSyncExternalStore(
    subscribeStorage,
    getStorageSnapshot,
    getServerSnapshot
  );
  const [dismissOverride, setDismissOverride] = useState<boolean | null>(null);
  const isDismissed = dismissOverride !== null ? dismissOverride : storedDismissed;

  const isClient = useIsClient();
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const goToNext = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev < JOURNEY_STEPS.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, []);

  const goToPrev = useCallback(() => {
    setCurrentStep((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < JOURNEY_STEPS.length) {
      setCurrentStep(index);
    }
  }, []);

  const handleSkip = useCallback(() => {
    setDismissOverride(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Ignore localStorage failure
    }
    if (onSkip) onSkip();
  }, [onSkip]);

  const handleReopen = useCallback(() => {
    setDismissOverride(false);
    setCurrentStep(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Ignore localStorage failure
    }
  }, []);

  const handleComplete = useCallback(() => {
    setDismissOverride(true);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Ignore
    }
    if (onComplete) onComplete();
  }, [onComplete]);

  // Keyboard navigation: ArrowRight / ArrowLeft / Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process keys if this section or document is active and not inside an input/textarea
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
        return;
      }

      if (isDismissed) return;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "Escape") {
        e.preventDefault();
        handleSkip();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, handleSkip, isDismissed]);

  const step = JOURNEY_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === JOURNEY_STEPS.length - 1;
  const progressPercent = ((currentStep + 1) / JOURNEY_STEPS.length) * 100;

  // Reduced motion animation presets
  const slideVariants = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: { opacity: 0, y: 16 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -16 },
      };

  const transitionSettings: Transition = prefersReducedMotion
    ? { duration: 0.05 }
    : { type: "spring" as const, stiffness: 350, damping: 30 };

  // If dismissed, render a subtle, non-intrusive re-open pill
  if (isClient && isDismissed) {
    return (
      <section
        aria-label="Student Journey Tour"
        className={`w-full py-3 bg-[#FAFCFA] border-y border-gray-100 flex items-center justify-center ${className}`}
      >
        <div className="container mx-auto px-4 max-w-350 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-[#4A5550]">
            <Sparkles className="w-3.5 h-3.5 text-[#1FA971]" />
            <span className="font-semibold text-[#232B27]">Student Discovery Journey</span>
            <span className="hidden sm:inline text-gray-400">• 5 quick steps to finding gigs & internships</span>
          </div>
          <button
            type="button"
            onClick={handleReopen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#1FA971] bg-white hover:bg-[#E8F3EE] border border-[#1FA971]/20 rounded-full transition-all hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1FA971] cursor-pointer"
            aria-label="Reopen student onboarding journey"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Revisit Journey</span>
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={containerRef}
      role="region"
      aria-label="Student onboarding journey"
      aria-roledescription="multistep interactive journey"
      className={`relative w-full py-10 sm:py-14 bg-gradient-to-b from-[#FAFCFA] via-white to-[#FAFCFA] border-y border-gray-100 overflow-hidden ${className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#1FA971]/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-[#35C489]/5 rounded-full blur-[90px]" />
      </div>

      {/* Screen Reader Live Announcement */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {`Step ${currentStep + 1} of ${JOURNEY_STEPS.length}: ${step.headline}`}
      </div>

      {/* Fallback for non-JS / disabled scripting */}
      <noscript>
        <div className="container mx-auto px-4 max-w-350 p-6 bg-white border border-[#1FA971]/30 rounded-2xl shadow-sm text-center">
          <h2 className="text-xl font-bold text-[#232B27] mb-2">
            Explore Opportunities on CampusConnectCo
          </h2>
          <p className="text-sm text-[#4A5550] mb-4">
            Discover verified internships, campus gigs, and hackathons tailored for university students.
          </p>
          <Link
            href="/opportunities"
            className="inline-flex px-6 py-2.5 bg-[#1FA971] text-white font-semibold text-sm rounded-xl hover:bg-[#199160] transition-colors"
          >
            Explore Opportunities
          </Link>
        </div>
      </noscript>

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-350">
        {/* Main Journey Card */}
        <div className="w-full bg-white border border-gray-200/80 rounded-3xl shadow-[0_12px_40px_-10px_rgba(31,169,113,0.08)] overflow-hidden">
          {/* Top Control Bar: Progress & Step Header */}
          <div className="px-5 sm:px-8 pt-6 pb-4 border-b border-gray-100 bg-[#FAFCFA]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left: Step Tag & Counter */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F3EE] text-[#1FA971] text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                {step.badge}
              </span>
              <span className="text-xs font-semibold text-gray-400">
                Step <span className="text-[#232B27] font-bold">{currentStep + 1}</span> of{" "}
                {JOURNEY_STEPS.length}
              </span>
            </div>

            {/* Middle: Progress Bar & Step Dots */}
            <div className="flex items-center gap-3 flex-1 max-w-xs sm:max-w-sm">
              <div
                role="progressbar"
                aria-valuenow={currentStep + 1}
                aria-valuemin={1}
                aria-valuemax={JOURNEY_STEPS.length}
                aria-label="Onboarding journey progress"
                className="w-full h-2 bg-gray-100 rounded-full overflow-hidden relative"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-[#35C489] to-[#1FA971] rounded-full"
                  initial={false}
                  animate={{ width: `${progressPercent}%` }}
                  transition={transitionSettings}
                />
              </div>

              {/* Interactive Step Dots */}
              <div className="flex items-center gap-1 shrink-0" role="tablist" aria-label="Journey steps">
                {JOURNEY_STEPS.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    role="tab"
                    aria-selected={currentStep === idx}
                    aria-label={`Go to step ${idx + 1}: ${s.badge}`}
                    onClick={() => goToStep(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1FA971] cursor-pointer ${
                      currentStep === idx
                        ? "bg-[#1FA971] scale-125 ring-2 ring-[#1FA971]/20"
                        : idx < currentStep
                        ? "bg-[#35C489]/60 hover:bg-[#1FA971]"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Skip Button */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleSkip}
                className="text-xs font-medium text-gray-500 hover:text-gray-800 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1FA971] cursor-pointer"
                aria-label="Skip onboarding journey"
              >
                <span>Skip tour</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Step Content */}
          <div className="p-6 sm:p-8 lg:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={step.id}
                variants={slideVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={transitionSettings}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
              >
                {/* Left Column: Headline, Humor Subtext & Highlights */}
                <div className="lg:col-span-7 flex flex-col items-start text-left">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#1FA971] mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1FA971]" />
                    {step.tagline}
                  </div>

                  {/* Mandatory Exact Message */}
                  <h3 className="text-2xl sm:text-3xl lg:text-[2.1rem] leading-tight font-extrabold text-[#232B27] mb-4 tracking-tight">
                    {step.headline}
                  </h3>

                  {/* Playful, Humorous Context */}
                  <p className="text-sm sm:text-base text-[#4A5550] mb-6 leading-relaxed font-normal">
                    {step.humorContext}
                  </p>

                  {/* Value Highlights */}
                  <ul className="space-y-2.5 mb-8 w-full" aria-label="Step highlights">
                    {step.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#232B27]">
                        <CheckCircle2 className="w-4 h-4 text-[#1FA971] shrink-0 mt-0.5" />
                        <span className="font-medium text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Action Navigation Controls */}
                  <div className="flex items-center flex-wrap gap-3 w-full pt-2">
                    {/* Back Button */}
                    {!isFirstStep && (
                      <button
                        type="button"
                        onClick={goToPrev}
                        className="h-11 px-4 text-xs sm:text-sm font-semibold text-[#232B27] bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1FA971] cursor-pointer"
                        aria-label="Previous step"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                    )}

                    {/* Next Button (Steps 1-4) */}
                    {!isLastStep ? (
                      <button
                        type="button"
                        onClick={goToNext}
                        className="h-11 px-6 text-xs sm:text-sm font-bold text-white bg-[#1FA971] hover:bg-[#199160] rounded-xl transition-all shadow-md shadow-[#1FA971]/20 flex items-center gap-2 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1FA971] cursor-pointer"
                        aria-label="Next step"
                      >
                        <span>Next Step</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      /* Final CTA (Step 5) -> Canonical Discovery Route /opportunities */
                      <Link
                        href="/opportunities"
                        onClick={handleComplete}
                        className="h-12 px-8 text-sm sm:text-base font-extrabold text-white bg-gradient-to-r from-[#1FA971] to-[#178557] hover:from-[#199160] hover:to-[#147048] rounded-xl transition-all shadow-lg shadow-[#1FA971]/25 flex items-center gap-2.5 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1FA971]"
                        aria-label="Explore Opportunities"
                      >
                        <span>Explore Opportunities</span>
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    )}

                    {/* Step jumping quick indicator */}
                    <span className="text-xs text-gray-400 ml-auto hidden sm:inline">
                      Tip: Use <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] text-gray-600 font-mono">←</kbd>{" "}
                      <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] text-gray-600 font-mono">→</kbd> keys to navigate • <kbd className="px-1.5 py-0.5 bg-gray-100 border border-gray-200 rounded text-[10px] text-gray-600 font-mono">Esc</kbd> to skip
                    </span>
                  </div>
                </div>

                {/* Right Column: Custom Animated SVG Visual Illustration */}
                <div className="lg:col-span-5 w-full flex items-center justify-center">
                  <div className="relative w-full max-w-sm sm:max-w-md aspect-square bg-gradient-to-br from-[#FAFCFA] to-[#E8F3EE]/40 border border-[#1FA971]/15 rounded-2xl p-6 sm:p-8 flex items-center justify-center overflow-hidden shadow-xs">
                    {/* Render step-specific vector scene */}
                    {step.id === 1 && <RadarScene prefersReducedMotion={prefersReducedMotion} />}
                    {step.id === 2 && <EcosystemScene prefersReducedMotion={prefersReducedMotion} />}
                    {step.id === 3 && <SkillMatchScene prefersReducedMotion={prefersReducedMotion} />}
                    {step.id === 4 && <ZeroFluffScene prefersReducedMotion={prefersReducedMotion} />}
                    {step.id === 5 && <LaunchReadyScene prefersReducedMotion={prefersReducedMotion} />}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ORIGINAL SVG ILLUSTRATIONS MATCHING CAMPUSCONNECTCO'S GREEN-AND-WHITE IDENTITY
// ─────────────────────────────────────────────────────────────────────────────

interface SceneProps {
  prefersReducedMotion: boolean | null;
}

/** Step 1: Radar / Campus Scanner Visual */
function RadarScene({ prefersReducedMotion }: SceneProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none" aria-hidden="true">
      {/* Concentric Radar Rings */}
      <div className="absolute w-64 h-64 border border-[#1FA971]/15 rounded-full" />
      <div className="absolute w-48 h-48 border border-[#1FA971]/25 rounded-full" />
      <div className="absolute w-32 h-32 border border-[#1FA971]/35 rounded-full" />

      {/* Crosshairs */}
      <div className="absolute w-full h-px bg-[#1FA971]/15" />
      <div className="absolute h-full w-px bg-[#1FA971]/15" />

      {/* Sweeping Radar Beam */}
      <motion.div
        className="absolute w-32 h-32 origin-bottom-right"
        style={{
          top: "calc(50% - 128px)",
          left: "calc(50% - 128px)",
          background: "conic-gradient(from 0deg at 100% 100%, rgba(31,169,113,0.3) 0deg, transparent 60deg)",
        }}
        animate={prefersReducedMotion ? {} : { rotate: 360 }}
        transition={prefersReducedMotion ? {} : { duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* Central Campus Node */}
      <div className="relative z-10 w-12 h-12 bg-white rounded-2xl shadow-md border border-[#1FA971]/30 flex items-center justify-center text-[#1FA971]">
        <Compass className="w-6 h-6 animate-pulse" />
      </div>

      {/* Floating Opportunity Blips */}
      <motion.div
        className="absolute top-12 right-10 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-[#1FA971]/30 shadow-sm flex items-center gap-1.5"
        animate={prefersReducedMotion ? {} : { y: [-2, 2, -2] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="w-2 h-2 rounded-full bg-[#1FA971] animate-ping" />
        <span className="text-[10px] font-bold text-[#232B27]">₹15,000 Next.js Gig</span>
      </motion.div>

      <motion.div
        className="absolute bottom-10 left-8 bg-white/95 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-1.5"
        animate={prefersReducedMotion ? {} : { y: [2, -2, 2] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <MapPin className="w-3 h-3 text-[#1FA971]" />
        <span className="text-[10px] font-bold text-gray-700">Design Intern • 1.2km</span>
      </motion.div>
    </div>
  );
}

/** Step 2: All-In-One Ecosystem Visual */
function EcosystemScene({ prefersReducedMotion }: SceneProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none" aria-hidden="true">
      {/* Central Hub */}
      <div className="relative z-20 w-16 h-16 bg-[#1FA971] rounded-2xl shadow-lg shadow-[#1FA971]/30 border-2 border-white flex flex-col items-center justify-center text-white">
        <Sparkles className="w-7 h-7" />
      </div>

      {/* Card 1: Internships */}
      <motion.div
        className="absolute top-4 left-6 z-10 bg-white border border-[#1FA971]/25 rounded-xl p-2.5 shadow-md flex items-center gap-2 max-w-[150px]"
        animate={prefersReducedMotion ? {} : { y: [-3, 3, -3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-7 h-7 rounded-lg bg-[#E8F3EE] flex items-center justify-center text-[#1FA971]">
          <Briefcase className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-[#232B27] leading-tight">Internships</div>
          <div className="text-[9px] text-[#1FA971] font-semibold">₹25,000/mo</div>
        </div>
      </motion.div>

      {/* Card 2: Campus Gigs */}
      <motion.div
        className="absolute top-10 right-4 z-10 bg-white border border-[#1FA971]/25 rounded-xl p-2.5 shadow-md flex items-center gap-2 max-w-[150px]"
        animate={prefersReducedMotion ? {} : { y: [3, -3, 3] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      >
        <div className="w-7 h-7 rounded-lg bg-[#E8F3EE] flex items-center justify-center text-[#1FA971]">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-[#232B27] leading-tight">Campus Gigs</div>
          <div className="text-[9px] text-[#1FA971] font-semibold">Weekend Sprints</div>
        </div>
      </motion.div>

      {/* Card 3: Hackathons */}
      <motion.div
        className="absolute bottom-6 z-10 bg-white border border-[#1FA971]/25 rounded-xl p-2.5 shadow-md flex items-center gap-2 max-w-[160px]"
        animate={prefersReducedMotion ? {} : { y: [-2, 2, -2] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
      >
        <div className="w-7 h-7 rounded-lg bg-[#E8F3EE] flex items-center justify-center text-[#1FA971]">
          <Trophy className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] font-bold text-[#232B27] leading-tight">Hackathons</div>
          <div className="text-[9px] text-[#1FA971] font-semibold">₹1,00,000 Pool</div>
        </div>
      </motion.div>

      {/* Connecting Dotted Vector Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-[#1FA971]/30 stroke-dasharray-2">
        <line x1="30%" y1="20%" x2="50%" y2="50%" strokeWidth="1.5" />
        <line x1="75%" y1="25%" x2="50%" y2="50%" strokeWidth="1.5" />
        <line x1="50%" y1="80%" x2="50%" y2="50%" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/** Step 3: Skill Match Reticle Visual */
function SkillMatchScene({ prefersReducedMotion }: SceneProps) {
  const skills = [
    { name: "React", match: "98%", color: "bg-[#1FA971] text-white" },
    { name: "UI/UX", match: "95%", color: "bg-[#E8F3EE] text-[#1FA971]" },
    { name: "Python", match: "92%", color: "bg-white text-[#232B27]" },
    { name: "Growth", match: "89%", color: "bg-[#E8F3EE] text-[#1FA971]" },
  ];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none" aria-hidden="true">
      <div className="w-full max-w-[240px] bg-white border border-[#1FA971]/30 rounded-2xl p-4 shadow-md">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#1FA971]" />
            <span className="text-[11px] font-bold text-[#232B27]">Profile Skill Match</span>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#E8F3EE] text-[#1FA971]">
            Active
          </span>
        </div>

        <div className="space-y-2">
          {skills.map((s, i) => (
            <motion.div
              key={s.name}
              className="flex items-center justify-between p-1.5 rounded-lg border border-gray-100 bg-[#FAFCFA] text-xs"
              animate={prefersReducedMotion ? {} : { x: [0, (i % 2 === 0 ? 2 : -2), 0] }}
              transition={{ duration: 2.5 + i * 0.3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1FA971]" />
                <span className="font-semibold text-gray-800 text-[11px]">{s.name}</span>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${s.color}`}>
                {s.match}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Step 4: Zero Fluff Guarantee Visual */
function ZeroFluffScene({ prefersReducedMotion }: SceneProps) {
  return (
    <div className="relative w-full h-full flex items-center justify-center select-none" aria-hidden="true">
      {/* Central Shield */}
      <motion.div
        className="w-20 h-20 rounded-3xl bg-[#1FA971] text-white flex flex-col items-center justify-center shadow-lg shadow-[#1FA971]/30 border-2 border-white relative z-10"
        animate={prefersReducedMotion ? {} : { scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <ShieldCheck className="w-10 h-10" />
      </motion.div>

      {/* Floating Checked Cards */}
      <div className="absolute top-5 left-4 bg-white border border-[#1FA971]/30 rounded-xl px-2.5 py-1.5 shadow-sm flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#1FA971]" />
        <span className="text-[10px] font-bold text-gray-800">Milestone Escrow</span>
      </div>

      <div className="absolute bottom-5 right-4 bg-white border border-[#1FA971]/30 rounded-xl px-2.5 py-1.5 shadow-sm flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#1FA971]" />
        <span className="text-[10px] font-bold text-gray-800">Verified Founders Only</span>
      </div>

      <div className="absolute bottom-6 left-6 bg-red-50 border border-red-200 rounded-xl px-2.5 py-1.5 shadow-xs flex items-center gap-1.5 line-through text-red-500">
        <X className="w-3 h-3 text-red-500" />
        <span className="text-[9px] font-semibold">Unpaid &quot;Exposure&quot;</span>
      </div>
    </div>
  );
}

/** Step 5: Launch Ready Rocket Scene */
function LaunchReadyScene({ prefersReducedMotion }: SceneProps) {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none" aria-hidden="true">
      {/* Rocket Visual */}
      <motion.div
        className="relative z-10 w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#1FA971] to-[#35C489] text-white flex items-center justify-center shadow-xl shadow-[#1FA971]/30 border-2 border-white"
        animate={prefersReducedMotion ? {} : { y: [-4, 4, -4], rotate: [0, 2, -2, 0] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <Rocket className="w-10 h-10" />
      </motion.div>

      {/* Launch plume / energy rings */}
      <div className="w-12 h-3 bg-[#1FA971]/20 rounded-full blur-xs mt-3" />
      <div className="w-24 h-1 bg-[#1FA971]/10 rounded-full blur-xs mt-1" />

      {/* Floating celebratory sparkle chips */}
      <div className="absolute top-6 right-8 bg-[#E8F3EE] text-[#1FA971] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
        <Sparkles className="w-3 h-3" />
        <span>You&apos;re Set!</span>
      </div>

      <div className="absolute bottom-6 left-8 bg-white border border-[#1FA971]/20 px-2.5 py-1 rounded-xl text-[10px] font-bold text-[#232B27] shadow-xs">
        500+ Live Matches
      </div>
    </div>
  );
}
