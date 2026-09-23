import React from "react";
import { renderToString } from "react-dom/server";
import { describe, it, expect } from "vitest";

import {
  StudentOpportunityJourney,
  JOURNEY_STEPS,
} from "@/components/onboarding/StudentOpportunityJourney";

describe("StudentOpportunityJourney — Specification & Copy Verification", () => {
  const MANDATORY_MESSAGES = [
    "Still exploring? Your next opportunity might be closer than you think.",
    "Internships, gigs, and hackathons—all in one place.",
    "Tell us what you’re good at. We’ll help you discover what fits.",
    "No endless searching. Just opportunities worth exploring.",
    "You made it this far. Ready to find your next opportunity?",
  ];

  it("defines exactly 5 steps in the onboarding journey", () => {
    expect(JOURNEY_STEPS).toHaveLength(5);
  });

  it("contains all 5 mandatory messages verbatim with exact punctuation", () => {
    MANDATORY_MESSAGES.forEach((msg, idx) => {
      expect(JOURNEY_STEPS[idx].headline).toBe(msg);
    });
  });

  it("verifies step 1 message: Still exploring? Your next opportunity might be closer than you think.", () => {
    expect(JOURNEY_STEPS[0].headline).toBe(
      "Still exploring? Your next opportunity might be closer than you think."
    );
    expect(JOURNEY_STEPS[0].badge).toBe("Hyperlocal Radar");
  });

  it("verifies step 2 message: Internships, gigs, and hackathons—all in one place.", () => {
    expect(JOURNEY_STEPS[1].headline).toBe(
      "Internships, gigs, and hackathons—all in one place."
    );
    expect(JOURNEY_STEPS[1].badge).toBe("All-In-One Ecosystem");
  });

  it("verifies step 3 message: Tell us what you’re good at. We’ll help you discover what fits.", () => {
    expect(JOURNEY_STEPS[2].headline).toBe(
      "Tell us what you’re good at. We’ll help you discover what fits."
    );
    expect(JOURNEY_STEPS[2].badge).toBe("Smart Skill Match");
  });

  it("verifies step 4 message: No endless searching. Just opportunities worth exploring.", () => {
    expect(JOURNEY_STEPS[3].headline).toBe(
      "No endless searching. Just opportunities worth exploring."
    );
    expect(JOURNEY_STEPS[3].badge).toBe("Zero Fluff Guarantee");
  });

  it("verifies step 5 message: You made it this far. Ready to find your next opportunity?", () => {
    expect(JOURNEY_STEPS[4].headline).toBe(
      "You made it this far. Ready to find your next opportunity?"
    );
    expect(JOURNEY_STEPS[4].badge).toBe("Launchpad Ready");
    expect(JOURNEY_STEPS[4].ctaText).toBe("Explore Opportunities");
  });
});

describe("StudentOpportunityJourney — SSR & Accessibility Semantics", () => {
  it("renders with proper semantic region and ARIA attributes", () => {
    const html = renderToString(React.createElement(StudentOpportunityJourney, { initialStep: 0 }));

    // Region landmark & label
    expect(html).toContain('role="region"');
    expect(html).toContain('aria-label="Student onboarding journey"');
    expect(html).toContain('aria-roledescription="multistep interactive journey"');

    // Live region for screen readers
    expect(html).toContain('aria-live="polite"');

    // Progress bar semantics
    expect(html).toContain('role="progressbar"');
    expect(html).toContain('aria-valuemin="1"');
    expect(html).toContain('aria-valuemax="5"');
    expect(html).toContain('aria-valuenow="1"');
  });

  it("renders non-JS accessible fallback pointing directly to /opportunities", () => {
    const html = renderToString(React.createElement(StudentOpportunityJourney));
    expect(html).toContain("<noscript>");
    expect(html).toContain('href="/opportunities"');
    expect(html).toContain("Explore Opportunities");
  });

  it("renders initial step 1 with Next button and Skip option", () => {
    const html = renderToString(React.createElement(StudentOpportunityJourney, { initialStep: 0 }));
    expect(html).toContain("Still exploring? Your next opportunity might be closer than you think.");
    expect(html).toContain("Next Step");
    expect(html).toContain("Skip tour");
    expect(html).toContain('aria-label="Skip onboarding journey"');
    expect(html).toContain('aria-label="Next step"');
  });

  it("renders step 5 with final CTA pointing strictly to /opportunities", () => {
    const html = renderToString(React.createElement(StudentOpportunityJourney, { initialStep: 4 }));
    expect(html).toContain("You made it this far. Ready to find your next opportunity?");
    expect(html).toContain('href="/opportunities"');
    expect(html).toContain("Explore Opportunities");
    expect(html).toContain('aria-label="Explore Opportunities"');
    expect(html).toContain('aria-valuenow="5"');
  });

  it("renders interactive step tabs with tablist semantics", () => {
    const html = renderToString(React.createElement(StudentOpportunityJourney, { initialStep: 2 }));
    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tab"');
    expect(html).toContain('aria-label="Go to step 1: Hyperlocal Radar"');
    expect(html).toContain('aria-label="Go to step 3: Smart Skill Match"');
  });

  it("ensures canonical discovery route /opportunities is used and not fake routes", () => {
    const html = renderToString(React.createElement(StudentOpportunityJourney, { initialStep: 4 }));
    // Must point to /opportunities
    expect(html).toContain('href="/opportunities"');
    // Must not point to fake or arbitrary routes
    expect(html).not.toContain('href="/discovery-journey"');
    expect(html).not.toContain('href="/explore"');
    expect(html).not.toContain('href="/onboarding-tour"');
  });

  it("verifies Back button is absent on step 1, but Next button is present", () => {
    const html = renderToString(React.createElement(StudentOpportunityJourney, { initialStep: 0 }));
    expect(html).toContain('aria-label="Next step"');
    expect(html).not.toContain('aria-label="Previous step"');
  });

  it("verifies Back button and Next button are both present on intermediate steps (2, 3, 4)", () => {
    [1, 2, 3].forEach((stepIdx) => {
      const html = renderToString(React.createElement(StudentOpportunityJourney, { initialStep: stepIdx }));
      expect(html).toContain('aria-label="Previous step"');
      expect(html).toContain(`Step <span class="text-[#232B27] font-bold">${stepIdx + 1}</span>`);
      expect(html).toContain("of");
    });
  });

  it("verifies step 5 replaces Next Step with Explore Opportunities link while preserving Back button", () => {
    const html = renderToString(React.createElement(StudentOpportunityJourney, { initialStep: 4 }));
    expect(html).toContain('aria-label="Previous step"');
    expect(html).not.toContain('aria-label="Next step"');
    expect(html).toContain('href="/opportunities"');
    expect(html).toContain("Explore Opportunities");
  });

  it("renders keyboard navigation shortcut hints for accessibility", () => {
    const html = renderToString(React.createElement(StudentOpportunityJourney, { initialStep: 0 }));
    expect(html).toContain("keys to navigate");
    expect(html).toContain("Esc");
    expect(html).toContain("to skip");
  });

  it("renders responsive mobile, tablet, and desktop layout classes", () => {
    const html = renderToString(React.createElement(StudentOpportunityJourney, { initialStep: 0 }));
    expect(html).toContain("grid-cols-1 lg:grid-cols-12");
    expect(html).toContain("lg:col-span-7");
    expect(html).toContain("lg:col-span-5");
  });
});
