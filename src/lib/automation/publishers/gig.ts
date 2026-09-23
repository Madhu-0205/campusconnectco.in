/**
 * Gig Opportunity Publisher Strategy
 * CampusConnectCo — Phase 15
 *
 * Automates the real Founder Gig posting flow at /dashboard/founder/gigs/new
 */

import type { Page } from "playwright";

import prisma from "@/lib/prisma";

import { CanonicalOpportunity, PublicationResult } from "../types";

import { FieldMapping, OpportunityPublisherStrategy, publisherRegistry } from "./base";

export class GigPublisherStrategy implements OpportunityPublisherStrategy {
  readonly opportunityType = "GIG" as const;
  readonly targetRoute = "/dashboard/founder/gigs/new";
  readonly name = "Founder Gig Publisher";

  readonly fieldMappings: FieldMapping[] = [
    { canonicalField: "title", formSelector: '[data-testid="founder-gig-title"]', fieldType: "text", required: true },
    { canonicalField: "description", formSelector: '[data-testid="founder-gig-description"]', fieldType: "textarea", required: true },
    { canonicalField: "skills", formSelector: '[data-testid="founder-gig-skills"]', fieldType: "text", required: false },
    { canonicalField: "workMode", formSelector: '[data-testid="founder-gig-workmode"]', fieldType: "select", required: false },
    { canonicalField: "city", formSelector: '[data-testid="founder-gig-city"]', fieldType: "text", required: false },
    { canonicalField: "compensation", formSelector: '[data-testid="founder-gig-budget"]', fieldType: "number", required: true },
    { canonicalField: "deadline", formSelector: '[data-testid="founder-gig-deadline"]', fieldType: "date", required: false }
  ];

  validate(opportunity: CanonicalOpportunity): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!opportunity.title || opportunity.title.trim().length < 3) errors.push("Gig title must be at least 3 characters.");
    if (!opportunity.description || opportunity.description.trim().length < 10) errors.push("Gig description must be at least 10 characters.");
    if (!opportunity.compensation || opportunity.compensation <= 0) errors.push("Budget must be a positive number.");
    return { valid: errors.length === 0, errors };
  }

  async publish(page: Page, opportunity: CanonicalOpportunity): Promise<PublicationResult> {
    const validation = this.validate(opportunity);
    if (!validation.valid) {
      return { success: false, error: `Validation failed: ${validation.errors.join(", ")}` };
    }

    try {
      // 1. Navigate to target Founder gig creation page
      await page.goto(this.targetRoute, { waitUntil: "domcontentloaded", timeout: 20000 });

      // 2. Fill form inputs using stable selectors
      const titleInput = page.locator('[data-testid="founder-gig-title"]').or(page.locator('input[placeholder*="Campus Ambassador Program"]')).first();
      await titleInput.waitFor({ state: "visible", timeout: 10000 });
      await titleInput.fill(opportunity.title);

      const descInput = page.locator('[data-testid="founder-gig-description"]').or(page.locator('textarea[placeholder*="Outline the responsibilities"]')).first();
      await descInput.fill(opportunity.description);

      if (opportunity.skills) {
        const skillsInput = page.locator('[data-testid="founder-gig-skills"]').or(page.locator('input[placeholder*="Community, Growth"]')).first();
        await skillsInput.fill(opportunity.skills);
      }

      if (opportunity.workMode) {
        const modeSelect = page.locator('[data-testid="founder-gig-workmode"]').or(page.locator("select")).first();
        if (await modeSelect.isVisible()) {
          await modeSelect.selectOption(opportunity.workMode === "on-site" ? "on-site" : opportunity.workMode);
        }
      }

      if (opportunity.city && opportunity.workMode !== "remote") {
        const cityInput = page.locator('[data-testid="founder-gig-city"]').or(page.locator('input[placeholder*="Hyderabad, Bengaluru"]')).first();
        if (await cityInput.isVisible()) {
          await cityInput.fill(opportunity.city);
        }
      }

      const budgetInput = page.locator('[data-testid="founder-gig-budget"]').or(page.locator('input[placeholder="5000"]')).first();
      await budgetInput.fill(String(Math.round(opportunity.compensation || 1000)));

      if (opportunity.deadline) {
        const deadlineInput = page.locator('[data-testid="founder-gig-deadline"]').or(page.locator('input[type="date"]')).first();
        const dateStr = opportunity.deadline.toISOString().split("T")[0];
        await deadlineInput.fill(dateStr);
      }

      // 3. Submit form and intercept response
      const submitBtn = page.locator('[data-testid="founder-gig-submit-btn"]').or(page.locator('button:has-text("Publish Listing")')).first();
      const saveResponsePromise = page.waitForResponse(
        r => r.url().includes("/api/gigs") && (r.status() === 200 || r.status() === 201),
        { timeout: 15000 }
      ).catch(() => null);

      await submitBtn.click();
      await saveResponsePromise;
      await page.waitForTimeout(1000);

      // 4. Verify in database
      const verifiedGig = await prisma.gig.findFirst({
        where: {
          title: opportunity.title,
          deletedAt: null
        },
        orderBy: { createdAt: "desc" }
      });

      if (!verifiedGig) {
        return {
          success: false,
          unconfirmed: true,
          error: "Form was submitted but resulting Gig record could not be confirmed in database."
        };
      }

      return {
        success: true,
        publishedOpportunityId: verifiedGig.id,
        publishedOpportunityType: "GIG",
        publishedUrl: `/gigs/${verifiedGig.id}`,
        publishedAt: new Date()
      };
    } catch (err: any) {
      return {
        success: false,
        error: `Playwright submission failed: ${err.message}`
      };
    }
  }

  async verifyPublication(opportunityId: string): Promise<boolean> {
    const record = await prisma.gig.findUnique({
      where: { id: opportunityId },
      select: { id: true, status: true, deletedAt: true }
    });
    return !!record && record.deletedAt === null && (record.status === "OPEN" || record.status === "active");
  }
}

// Register strategy
publisherRegistry.register(new GigPublisherStrategy());
