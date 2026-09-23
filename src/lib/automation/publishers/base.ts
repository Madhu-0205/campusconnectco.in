/**
 * Generic Opportunity Publisher Strategy & Registry
 * CampusConnectCo — Phase 15
 *
 * Provides a pluggable, opportunity-type agnostic abstraction for publishing
 * into CampusConnectCo through the real Founder workflow.
 */

import type { Page } from "playwright";

import { CanonicalOpportunity, OpportunityType, PublicationResult } from "../types";

export interface FieldMapping {
  canonicalField: keyof CanonicalOpportunity;
  formSelector: string;
  fieldType: "text" | "textarea" | "number" | "date" | "select" | "button_toggle";
  required: boolean;
}

export interface OpportunityPublisherStrategy {
  /** The opportunity type supported by this publisher (e.g. INTERNSHIP, GIG) */
  readonly opportunityType: OpportunityType;

  /** Target Founder URL in the web application */
  readonly targetRoute: string;

  /** Human-readable name */
  readonly name: string;

  /** Field mappings for form automation */
  readonly fieldMappings: FieldMapping[];

  /** Validates whether the canonical opportunity has all required fields for this strategy */
  validate(opportunity: CanonicalOpportunity): { valid: boolean; errors: string[] };

  /** Executes UI form submission using Playwright on an authenticated Founder page */
  publish(page: Page, opportunity: CanonicalOpportunity): Promise<PublicationResult>;

  /** Verifies that the record was genuinely created in the database and is publicly accessible */
  verifyPublication(opportunityId: string): Promise<boolean>;
}

class PublisherRegistry {
  private strategies: Map<string, OpportunityPublisherStrategy> = new Map();

  public register(strategy: OpportunityPublisherStrategy): void {
    this.strategies.set(strategy.opportunityType.toUpperCase(), strategy);
  }

  public get(opportunityType: string): OpportunityPublisherStrategy | undefined {
    const direct = this.strategies.get(opportunityType.toUpperCase());
    if (direct) return direct;
    return this.strategies.get("OTHER");
  }

  public has(opportunityType: string): boolean {
    return this.strategies.has(opportunityType.toUpperCase());
  }

  public getAll(): OpportunityPublisherStrategy[] {
    return Array.from(this.strategies.values());
  }
}

export const publisherRegistry = new PublisherRegistry();
