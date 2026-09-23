/**
 * Internship Opportunity Publisher Strategy
 * CampusConnectCo — Phase 15
 *
 * Automates the real Founder Internship posting flow at /dashboard/founder/internships
 */

import type { Page } from "playwright";

import prisma from "@/lib/prisma";

import { CanonicalOpportunity, PublicationResult } from "../types";

import { FieldMapping, OpportunityPublisherStrategy, publisherRegistry } from "./base";

export class InternshipPublisherStrategy implements OpportunityPublisherStrategy {
  readonly opportunityType = "INTERNSHIP" as const;
  readonly targetRoute = "/dashboard/founder/internships";
  readonly name = "Founder Internship Publisher";

  readonly fieldMappings: FieldMapping[] = [
    { canonicalField: "title", formSelector: '[data-testid="founder-internship-title"]', fieldType: "text", required: true },
    { canonicalField: "company", formSelector: '[data-testid="founder-internship-company"]', fieldType: "text", required: true },
    { canonicalField: "location", formSelector: '[data-testid="founder-internship-location"]', fieldType: "text", required: false },
    { canonicalField: "description", formSelector: '[data-testid="founder-internship-description"]', fieldType: "textarea", required: true },
    { canonicalField: "skills", formSelector: '[data-testid="founder-internship-skills"]', fieldType: "text", required: false },
    { canonicalField: "duration", formSelector: '[data-testid="founder-internship-duration"]', fieldType: "text", required: false },
    { canonicalField: "compensation", formSelector: '[data-testid="founder-internship-stipend"]', fieldType: "number", required: false },
    { canonicalField: "deadline", formSelector: '[data-testid="founder-internship-deadline"]', fieldType: "date", required: false },
    { canonicalField: "applicationUrl", formSelector: '[data-testid="founder-internship-link"]', fieldType: "text", required: false }
  ];

  validate(opportunity: CanonicalOpportunity): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!opportunity.title || opportunity.title.trim().length < 3) errors.push("Title must be at least 3 characters.");
    if (!opportunity.company || opportunity.company.trim().length < 2) errors.push("Company name is required.");
    if (!opportunity.description || opportunity.description.trim().length < 10) errors.push("Description must be at least 10 characters.");
    return { valid: errors.length === 0, errors };
  }

  async publish(page: Page, opportunity: CanonicalOpportunity): Promise<PublicationResult> {
    const validation = this.validate(opportunity);
    if (!validation.valid) {
      return { success: false, error: `Validation failed: ${validation.errors.join(", ")}` };
    }

    try {
      // 1. Navigate to target Founder dashboard
      await page.goto(this.targetRoute, { waitUntil: "domcontentloaded", timeout: 20000 });

      // 2. Open New Internship modal
      const newBtn = page.locator('[data-testid="founder-new-internship-btn"]').or(page.locator('button:has-text("New Internship")')).first();
      await newBtn.waitFor({ state: "visible", timeout: 10000 });
      await newBtn.click();

      // 3. Fill form inputs using stable selectors (with resilient fallbacks)
      const titleInput = page.locator('[data-testid="founder-internship-title"]').or(page.locator('input[placeholder*="Frontend Developer Intern"]')).first();
      await titleInput.waitFor({ state: "visible", timeout: 8000 });
      await titleInput.fill(opportunity.title);

      const companyInput = page.locator('[data-testid="founder-internship-company"]').or(page.locator('input[placeholder*="Acme Corp"]')).first();
      await companyInput.fill(opportunity.company);

      if (opportunity.location) {
        const locInput = page.locator('[data-testid="founder-internship-location"]').or(page.locator('input[placeholder*="Remote / Bangalore"]')).first();
        await locInput.fill(opportunity.location);
      }

      const descInput = page.locator('[data-testid="founder-internship-description"]').or(page.locator('textarea[placeholder*="Describe responsibilities"]')).first();
      await descInput.fill(opportunity.description);

      if (opportunity.skills) {
        const skillsInput = page.locator('[data-testid="founder-internship-skills"]').or(page.locator('input[placeholder*="React, TypeScript"]')).first();
        await skillsInput.fill(opportunity.skills);
      }

      if (opportunity.duration) {
        const durInput = page.locator('[data-testid="founder-internship-duration"]').or(page.locator('input[placeholder*="3 months"]')).first();
        await durInput.fill(opportunity.duration);
      }

      if (opportunity.compensation) {
        const stipendInput = page.locator('[data-testid="founder-internship-stipend"]').or(page.locator('input[placeholder*="10000"]')).first();
        await stipendInput.fill(String(Math.round(opportunity.compensation)));
      }

      if (opportunity.deadline) {
        const deadlineInput = page.locator('[data-testid="founder-internship-deadline"]').or(page.locator('input[type="date"]')).first();
        const dateStr = opportunity.deadline.toISOString().split("T")[0];
        await deadlineInput.fill(dateStr);
      }

      if (opportunity.applicationUrl) {
        const linkInput = page.locator('[data-testid="founder-internship-link"]').or(page.locator('input[placeholder*="https://company.com/apply"]')).first();
        await linkInput.fill(opportunity.applicationUrl);
      }

      // Work mode tag toggle
      if (opportunity.workMode) {
        const tagText = opportunity.workMode === "remote" ? "Remote" : opportunity.workMode === "hybrid" ? "Hybrid" : "Onsite";
        const modeBtn = page.locator(`button:has-text("${tagText}")`).first();
        if (await modeBtn.isVisible()) {
          await modeBtn.click();
        }
      }

      // 4. Submit form and intercept creation response
      const saveBtn = page.locator('[data-testid="founder-internship-save-btn"]').or(page.locator('button:has-text("Save")')).first();
      const saveResponsePromise = page.waitForResponse(
        r => r.url().includes("/api/founder/internships") && (r.status() === 200 || r.status() === 201),
        { timeout: 15000 }
      ).catch(() => null);

      await saveBtn.click();
      await saveResponsePromise;
      await page.waitForTimeout(1000);

      // Verify in database
      const verifiedRecord = await prisma.internship.findFirst({
        where: {
          title: opportunity.title,
          company: opportunity.company,
          deletedAt: null
        },
        orderBy: { createdAt: "desc" }
      });

      if (!verifiedRecord) {
        return {
          success: false,
          unconfirmed: true,
          error: "Form was submitted but resulting Internship record could not be confirmed in database."
        };
      }

      return {
        success: true,
        publishedOpportunityId: verifiedRecord.id,
        publishedOpportunityType: "INTERNSHIP",
        publishedUrl: `/internships/${verifiedRecord.id}`,
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
    const record = await prisma.internship.findUnique({
      where: { id: opportunityId },
      select: { id: true, status: true, deletedAt: true }
    });
    return !!record && record.deletedAt === null && (record.status === "OPEN" || record.status === "PENDING_APPROVAL");
  }
}

// Register strategy
publisherRegistry.register(new InternshipPublisherStrategy());
