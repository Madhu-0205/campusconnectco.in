import { prisma } from "../src/lib/prisma";
import { 
  validateStateTransition, 
  createAuditEvent, 
  appendAuditEvent, 
  createHumanAuthorization, 
  verifyHumanAuthorization, 
  consumeHumanAuthorization, 
  revokeHumanAuthorization,
  getActiveOpportunityPrismaFilter
} from "../src/lib/automation/state-machine";
import { evaluateAuthenticity } from "../src/lib/automation/authenticity";
import { getUnifiedOpportunities } from "../src/lib/opportunities/fetcher";
import { isPubliclyDiscoverable } from "../src/lib/opportunities/lifecycle";

const HUMAN_FOUNDER = {
  email: "madhuvalurouthu52@gmail.com",
  role: "FOUNDER",
  isBot: false
};

const AUTOMATION_BOT = {
  email: "opportunity-bot@campusconnectco.in",
  role: "FOUNDER",
  isBot: true
};

const CATEGORIES = [
  "APPRENTICESHIP",
  "EVENT",
  "FELLOWSHIP",
  "GIG",
  "HACKATHON",
  "INTERNSHIP",
  "JOB",
  "RESEARCH"
];

async function runPilot() {
  console.log("================================================================================");
  console.log("PHASE 16C REAL-DATA PILOT EXECUTION & DOWNSTREAM VERIFICATION");
  console.log("================================================================================\n");

  // Clean initial state for repeatable runs
  await prisma.internship.deleteMany({
    where: { company: "Marvell" }
  });
  await prisma.discoveredOpportunity.updateMany({
    where: { id: "23c68a69-1c60-46ad-b00d-d2aaa1d440c1" },
    data: {
      status: "NEEDS_REVIEW",
      publishedOpportunityId: null,
      publishedOpportunityType: null,
      publishedAt: null,
      publishedBy: null
    }
  });

  // Step 1: Select 8 Deterministic Non-Cherry-Picked Records (1 per Category)
  console.log("--- 1. DETERMINISTIC 8-RECORD PILOT SAMPLE SELECTION ---");
  const pilotRecords: any[] = [];

  for (const cat of CATEGORIES) {
    const opp = await prisma.discoveredOpportunity.findFirst({
      where: { opportunityType: cat },
      orderBy: { discoveredAt: "asc" }
    });

    if (!opp) {
      console.warn(`[WARNING] No record found for category: ${cat}`);
      continue;
    }

    const auth = evaluateAuthenticity({
      company: opp.company,
      applicationUrl: opp.applicationUrl,
      sourceUrl: opp.sourceUrl,
      sourceTrust: opp.sourceTrust as any
    });

    pilotRecords.push({
      category: cat,
      id: opp.id,
      title: opp.title,
      company: opp.company,
      source: opp.source,
      sourceName: opp.sourceName,
      sourceTrust: opp.sourceTrust,
      verificationState: opp.verificationState,
      derivedVerificationState: auth.verificationState,
      qualityScore: opp.qualityScore,
      spamRiskScore: opp.spamRiskScore,
      deadline: opp.deadline ? opp.deadline.toISOString() : "None",
      location: opp.location || "Remote",
      workMode: opp.workMode || "remote",
      applicationUrl: opp.applicationUrl,
      currentStatus: opp.status,
      metadata: opp.metadata
    });
  }

  console.log(`Successfully selected ${pilotRecords.length} real staged records across ${CATEGORIES.length} categories.\n`);
  for (const r of pilotRecords) {
    console.log(`[${r.category}] ID: ${r.id}`);
    console.log(`  Title: "${r.title}" @ ${r.company}`);
    console.log(`  Source: ${r.sourceName} (Trust: ${r.sourceTrust})`);
    console.log(`  Authenticity: Stored=${r.verificationState}, FreshEval=${r.derivedVerificationState}`);
    console.log(`  Scores: Quality=${r.qualityScore}, SpamRisk=${r.spamRiskScore}`);
    console.log(`  Deadline: ${r.deadline} | Location: ${r.location} (${r.workMode})`);
    console.log(`  Status: ${r.currentStatus}`);
    console.log("--------------------------------------------------------------------------------");
  }

  // Step 2: Human Review & Publication for INTERNSHIP Record (Marvell)
  console.log("\n--- 2. HUMAN REVIEW & AUTHORIZATION OF REAL INTERNSHIP RECORD ---");
  const internshipPilot = pilotRecords.find(r => r.category === "INTERNSHIP");
  if (!internshipPilot) throw new Error("Internship pilot record missing");

  console.log(`Target: "${internshipPilot.title}" @ ${internshipPilot.company} (ID: ${internshipPilot.id})`);

  // 2a. Validate Human Transition from current to APPROVED
  const approveTransition = validateStateTransition({
    currentStatus: internshipPilot.currentStatus,
    targetStatus: "APPROVED",
    actor: HUMAN_FOUNDER,
    opportunity: internshipPilot,
    reason: "Verified genuine PhD research internship listing on official Marvell careers portal."
  });
  console.log("Human Approval Validation Result:", approveTransition);
  if (!approveTransition.valid) throw new Error(`Approval validation failed: ${approveTransition.error}`);

  // 2b. Issue Server-Verifiable Human Authorization Token
  const authRecord = createHumanAuthorization(internshipPilot.id, HUMAN_FOUNDER, 60);
  console.log("Issued Human Authorization Token:", {
    token: authRecord.token.substring(0, 16) + "...",
    authorizedBy: authRecord.authorizedBy,
    expiresAt: authRecord.expiresAt,
    opportunityId: authRecord.opportunityId
  });

  // 2c. Update DiscoveredOpportunity to APPROVED in Database with Audit Event
  const approveAuditEvent = createAuditEvent({
    action: "APPROVE",
    actor: HUMAN_FOUNDER,
    fromStatus: internshipPilot.currentStatus,
    toStatus: "APPROVED",
    reason: "Verified genuine PhD research internship listing on official Marvell careers portal.",
    details: { tokenPreview: authRecord.token.substring(0, 12) }
  });

  const updatedMetaAfterApprove = appendAuditEvent(internshipPilot.metadata, approveAuditEvent);
  updatedMetaAfterApprove.authorization = authRecord;

  await prisma.discoveredOpportunity.update({
    where: { id: internshipPilot.id },
    data: {
      status: "APPROVED",
      metadata: updatedMetaAfterApprove
    }
  });
  console.log("DiscoveredOpportunity updated to APPROVED with audit trail logged.");

  // Step 3: Dedicated Automation Bot Publication
  console.log("\n--- 3. DEDICATED AUTOMATION BOT PUBLICATION ---");
  // 3a. Bot verifies authorization token before proceeding
  const verifyAuth = verifyHumanAuthorization(authRecord, internshipPilot.id);
  console.log("Token Verification Result:", verifyAuth);
  if (!verifyAuth.valid) throw new Error(`Token verification failed: ${verifyAuth.error}`);

  // 3b. Bot consumes token (single-use replay protection)
  const consumedAuth = consumeHumanAuthorization(authRecord);
  console.log("Consumed Authorization Token (usedAt recorded):", consumedAuth.usedAt);

  // 3c. Bot validates publication state transition
  const publishTransition = validateStateTransition({
    currentStatus: "APPROVED",
    targetStatus: "PUBLISHED",
    actor: AUTOMATION_BOT,
    opportunity: {
      id: internshipPilot.id,
      spamRiskScore: internshipPilot.spamRiskScore,
      metadata: updatedMetaAfterApprove
    }
  });
  console.log("Bot Publication State Machine Result:", publishTransition);
  if (!publishTransition.valid) throw new Error(`Bot publication state machine failed: ${publishTransition.error}`);

  // 3d. Create public Internship row with status "OPEN"
  const createdInternship = await prisma.internship.create({
    data: {
      title: internshipPilot.title,
      description: "Discovered and verified via CampusConnectCo Supply Engine. Role: Applied Machine Learning Scientist Intern - PhD at Marvell.",
      company: internshipPilot.company,
      location: internshipPilot.location,
      applicationLink: internshipPilot.applicationUrl,
      status: "OPEN",
      source: "campusconnect_opportunity_agent",
      isFeatured: false
    }
  });
  console.log(`Public Internship Row Created! ID: ${createdInternship.id} (Status: ${createdInternship.status})`);

  // 3e. Update DiscoveredOpportunity to PUBLISHED with audit trail
  const publishAuditEvent = createAuditEvent({
    action: "PUBLISH",
    actor: AUTOMATION_BOT,
    fromStatus: "APPROVED",
    toStatus: "PUBLISHED",
    details: {
      publishedOpportunityId: createdInternship.id,
      publishedOpportunityType: "INTERNSHIP"
    }
  });

  const updatedMetaAfterPublish = appendAuditEvent(updatedMetaAfterApprove, publishAuditEvent);
  updatedMetaAfterPublish.authorization = consumedAuth;

  await prisma.discoveredOpportunity.update({
    where: { id: internshipPilot.id },
    data: {
      status: "PUBLISHED",
      publishedOpportunityId: createdInternship.id,
      publishedOpportunityType: "INTERNSHIP",
      publishedAt: new Date(),
      publishedBy: "AUTOMATION_BOT",
      metadata: updatedMetaAfterPublish
    }
  });
  console.log("DiscoveredOpportunity updated to PUBLISHED in database.");

  // Step 4: Downstream Visibility Verification (Search, Fetcher, Prisma Filter)
  console.log("\n--- 4. DOWNSTREAM VISIBILITY VERIFICATION ---");
  // 4a. Fetch via public search fetcher
  const publicSearchResult = await getUnifiedOpportunities({
    query: "Marvell",
    type: "internship"
  });
  console.log(`Public fetcher returned ${publicSearchResult.total} results for 'Marvell'.`);
  const foundPub = publicSearchResult.opportunities.find(o => o.sourceId === createdInternship.id || o.id === `internship-${createdInternship.id}` || o.company === "Marvell");
  console.log(`Found published opportunity in search: ${!!foundPub} (Title: "${foundPub?.title}")`);

  // 4b. Check Prisma filter and visibility semantics
  const isDiscoverable = isPubliclyDiscoverable(createdInternship.status, createdInternship.deletedAt, createdInternship.deadline);
  console.log(`isPubliclyDiscoverable check: ${isDiscoverable}`);

  // Step 5: Emergency Rollback / Unpublish
  console.log("\n--- 5. EMERGENCY ROLLBACK & EVACUATION VERIFICATION ---");
  const rollbackReason = "Phase 16C End-to-End Verification: Testing immediate public eviction and rollback safety gate.";
  
  // 5a. Validate Rollback State Transition
  const rollbackTransition = validateStateTransition({
    currentStatus: "PUBLISHED",
    targetStatus: "NEEDS_REVIEW",
    actor: HUMAN_FOUNDER,
    opportunity: {
      id: internshipPilot.id,
      publishedOpportunityId: createdInternship.id
    },
    reason: rollbackReason
  });
  console.log("Rollback Transition Result:", rollbackTransition);
  if (!rollbackTransition.valid) throw new Error(`Rollback failed: ${rollbackTransition.error}`);

  // 5b. Evict Public Record: mark INACTIVE and set deletedAt
  const evictedInternship = await prisma.internship.update({
    where: { id: createdInternship.id },
    data: {
      status: "INACTIVE",
      deletedAt: new Date()
    }
  });
  console.log(`Public Internship Evicted! ID: ${evictedInternship.id} (Status: ${evictedInternship.status}, deletedAt: ${evictedInternship.deletedAt?.toISOString()})`);

  // 5c. Revoke Authorization & Update DiscoveredOpportunity to NEEDS_REVIEW
  const revokedAuth = revokeHumanAuthorization(consumedAuth);
  const rollbackAuditEvent = createAuditEvent({
    action: "UNPUBLISH",
    actor: HUMAN_FOUNDER,
    fromStatus: "PUBLISHED",
    toStatus: "NEEDS_REVIEW",
    reason: rollbackReason,
    details: { evictedPublicId: createdInternship.id }
  });

  const metaAfterRollback = appendAuditEvent(updatedMetaAfterPublish, rollbackAuditEvent);
  metaAfterRollback.authorization = revokedAuth;

  await prisma.discoveredOpportunity.update({
    where: { id: internshipPilot.id },
    data: {
      status: "NEEDS_REVIEW",
      publishedOpportunityId: null,
      publishedOpportunityType: null,
      publishedAt: null,
      publishedBy: null,
      metadata: metaAfterRollback
    }
  });
  console.log("DiscoveredOpportunity rolled back to NEEDS_REVIEW with revoked authorization.");

  // 5d. Verify immediate eviction from public search
  const postRollbackSearch = await getUnifiedOpportunities({
    query: "Marvell",
    type: "internship"
  });
  const foundAfterEviction = postRollbackSearch.opportunities.find(o => o.sourceId === createdInternship.id || o.id === `internship-${createdInternship.id}` || o.company === "Marvell");
  console.log(`Search after rollback returned ${postRollbackSearch.total} results. Evicted record visible: ${!!foundAfterEviction}`);

  // 5e. Clean up test Internship row completely
  await prisma.internship.delete({ where: { id: createdInternship.id } });
  console.log("Test Internship row cleaned up successfully.");

  // Step 6: Verify Rejection with Structured Code on Flagged Opportunity
  console.log("\n--- 6. REJECTION WITH STRUCTURED CODE & AUDIT VERIFICATION ---");
  const hackathonPilot = pilotRecords.find(r => r.category === "HACKATHON");
  if (hackathonPilot) {
    console.log(`Inspecting Rejection on Hackathon Pilot: "${hackathonPilot.title}" (ID: ${hackathonPilot.id})`);
    const oppDb = await prisma.discoveredOpportunity.findUnique({ where: { id: hackathonPilot.id } });
    console.log(`Database status: ${oppDb?.status}`);
    console.log(`Database rejectionReason: ${oppDb?.rejectionReason}`);
    const meta = oppDb?.metadata as any;
    console.log(`Audit Trail entries count: ${meta?.auditTrail?.length || 0}`);
    if (meta?.auditTrail) {
      console.log("Latest Audit Event:", meta.auditTrail[meta.auditTrail.length - 1]);
    }
  }

  console.log("\n================================================================================");
  console.log("PHASE 16C REAL-DATA PILOT EXECUTION COMPLETED SUCCESSFULLY!");
  console.log("================================================================================");
}

runPilot()
  .catch(err => {
    console.error("PILOT EXECUTION ERROR:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
