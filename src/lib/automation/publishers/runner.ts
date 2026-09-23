/**
 * Playwright Automation Runner
 * CampusConnectCo — Phase 15
 *
 * Launches Chromium, authenticates with dedicated Founder Automation Bot session,
 * selects the appropriate OpportunityPublisherStrategy, executes the form submission,
 * verifies publication integrity, and updates provenance.
 */

import { chromium, type Browser, type Page } from "playwright";

import { isAutomationBotEmail } from "@/lib/auth-checks";
import rawPrisma from "@/lib/prisma";
const prisma = rawPrisma as any;

import { publisherRegistry } from "./base";
import { CanonicalOpportunity, PublicationResult } from "../types";
import "./internship";
import "./gig";
import "./staging";

export interface PublishOpportunityOptions {
  opportunity: CanonicalOpportunity;
  baseUrl?: string;
  botEmail?: string;
  botPassword?: string;
  headless?: boolean;
}

/**
 * Publishes an opportunity into CampusConnectCo through the real Founder UI workflow.
 * STRICT SECURITY: Automation MUST operate under a dedicated bot account (opportunity-bot@campusconnectco.in).
 * Personal Founder accounts are strictly rejected.
 */
export async function publishOpportunityThroughFounderWorkflow(
  options: PublishOpportunityOptions
): Promise<PublicationResult> {
  const {
    opportunity,
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    botEmail = process.env.FOUNDER_BOT_EMAIL || "opportunity-bot@campusconnectco.in",
    botPassword = process.env.FOUNDER_BOT_PASSWORD,
    headless = true
  } = options;

  // Enforce dedicated automation bot account — personal accounts are strictly forbidden
  if (!isAutomationBotEmail(botEmail) || botEmail.toLowerCase().includes("madhuvalurouthu")) {
    throw new Error(
      `SECURITY VIOLATION: Automation publisher must operate strictly under the dedicated automation bot account (opportunity-bot@campusconnectco.in). Attempted: ${botEmail}`
    );
  }

  if (!botPassword) {
    throw new Error(
      "SECURITY CONFIGURATION ERROR: FOUNDER_BOT_PASSWORD must be set in environment for automated publishing."
    );
  }

  // 1. Strict Idempotency Guard: Check whether already published
  if (opportunity.id) {
    const existingStaged = await prisma.discoveredOpportunity.findUnique({
      where: { id: opportunity.id },
      select: { status: true, publishedOpportunityId: true, publishedOpportunityType: true }
    });

    if (existingStaged?.status === "PUBLISHED" && existingStaged.publishedOpportunityId) {
      return {
        success: true,
        publishedOpportunityId: existingStaged.publishedOpportunityId,
        publishedOpportunityType: (existingStaged.publishedOpportunityType as any) || "INTERNSHIP",
        publishedUrl: `/${existingStaged.publishedOpportunityType?.toLowerCase() || "internships"}/${existingStaged.publishedOpportunityId}`,
        publishedAt: new Date()
      };
    }
  }

  // 2. Select Publisher Strategy
  let strategy = publisherRegistry.get(opportunity.opportunityType);
  if (!strategy) {
    // If no direct strategy, check if it can be published as an Internship or Staged
    strategy = opportunity.opportunityType === "GIG"
      ? publisherRegistry.get("GIG")
      : publisherRegistry.get("INTERNSHIP") || publisherRegistry.get("OTHER");
  }

  if (!strategy) {
    return {
      success: false,
      error: `No publisher strategy registered for opportunity type: ${opportunity.opportunityType}`
    };
  }

  // 3. Launch Headless Chromium
  let browser: Browser | null = null;
  try {
    browser = await chromium.launch({
      headless,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    });

    const context = await browser.newContext({
      baseURL: baseUrl,
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();

    // 4. Authenticate as Dedicated Founder Automation Bot
    await authenticateBotSession(page, baseUrl, botEmail, botPassword);

    // 5. Execute Form Publishing via Strategy
    const pubResult = await strategy.publish(page, opportunity);

    if (!pubResult.success || !pubResult.publishedOpportunityId) {
      // Mark as unconfirmed or error in staging
      if (opportunity.id) {
        await prisma.discoveredOpportunity.update({
          where: { id: opportunity.id },
          data: {
            status: pubResult.unconfirmed ? "NEEDS_REVIEW" : "NEEDS_REVIEW",
            reviewNotes: pubResult.error || "Publication unconfirmed."
          }
        });
      }
      await browser.close();
      return pubResult;
    }

    // 6. Verify Publication in Database
    const isVerified = await strategy.verifyPublication(pubResult.publishedOpportunityId);
    if (!isVerified) {
      if (opportunity.id) {
        await prisma.discoveredOpportunity.update({
          where: { id: opportunity.id },
          data: {
            status: "NEEDS_REVIEW",
            reviewNotes: "Opportunity ID captured from UI but could not be verified active in database."
          }
        });
      }
      await browser.close();
      return {
        success: false,
        unconfirmed: true,
        error: "Opportunity created in UI but failed active verification check."
      };
    }

    // 7. Record Publication Provenance in Staging
    if (opportunity.id) {
      await prisma.discoveredOpportunity.update({
        where: { id: opportunity.id },
        data: {
          status: "PUBLISHED",
          publishedOpportunityId: pubResult.publishedOpportunityId,
          publishedOpportunityType: pubResult.publishedOpportunityType,
          publishedAt: pubResult.publishedAt || new Date(),
          publishedBy: "AUTOMATION_BOT",
          reviewNotes: `Successfully published via Founder UI (${strategy.name}).`
        }
      });
    }

    // 8. Update SourceHealth metrics
    if (opportunity.source) {
      await prisma.sourceHealth.updateMany({
        where: { source: opportunity.source },
        data: { itemsPublished: { increment: 1 } }
      });
    }

    await browser.close();
    return pubResult;
  } catch (err: any) {
    if (browser) await browser.close();
    return {
      success: false,
      error: `Automation runner crashed: ${err.message}`
    };
  }
}

/**
 * Authenticates the Playwright session as the dedicated Founder Automation Bot.
 */
async function authenticateBotSession(
  page: Page,
  baseUrl: string,
  email: string,
  password: string
): Promise<void> {
  // Check if we already have an active session
  await page.goto("/dashboard/founder", { waitUntil: "domcontentloaded", timeout: 15000 });

  // If redirected to sign-in or login required
  if (page.url().includes("/auth") || page.url().includes("/sign-in")) {
    await page.goto("/auth/sign-in", { waitUntil: "domcontentloaded", timeout: 15000 });

    const emailInput = page.locator('input[type="email"]').first();
    await emailInput.waitFor({ state: "visible", timeout: 8000 });
    await emailInput.fill(email);

    const passwordInput = page.locator('input[type="password"]').first();
    await passwordInput.fill(password);

    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    // Wait for redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  }

  // Authoritative Server-Side Identity Verification: Ensure active session belongs strictly to the bot
  const identityCheck = await page.evaluate(async () => {
    try {
      const res = await fetch("/api/automation/identity");
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  });

  if (!identityCheck?.authenticated || identityCheck?.email?.toLowerCase() !== email.toLowerCase() || !identityCheck?.isBot) {
    throw new Error(
      `SECURITY VIOLATION: Automation session must belong to dedicated bot ${email}. Verified session: ${JSON.stringify(
        identityCheck
      )}. Failing closed.`
    );
  }
}
