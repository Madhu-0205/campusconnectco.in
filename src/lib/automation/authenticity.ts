/**
 * Opportunity Source Authenticity & Organization Association Evaluator
 * CampusConnectCo — Phase 15
 *
 * Implements strict separation:
 * SOURCE TRUST ≠ VERIFICATION ≠ QUALITY
 *
 * Does NOT classify an entire platform as OFFICIAL merely because of its domain.
 * Evaluates whether the SPECIFIC OPPORTUNITY reliably associates with the legitimate organization.
 */

import { AuthenticityEvaluation, SourceTrustLevel } from "./types";

const UNTRUSTED_DOMAINS = [
  "t.me",
  "telegram.me",
  "wa.me",
  "api.whatsapp.com",
  "chat.whatsapp.com",
  "discord.gg",
  "bit.ly",
  "tinyurl.com",
  "cutt.ly",
  "rb.gy",
  "is.gd",
  "goo.gl",
  "shorte.st"
];

const KNOWN_AGGREGATORS = [
  "indeed.com",
  "naukri.com",
  "internshala.com",
  "monster.com",
  "foundit.in",
  "ziprecruiter.com",
  "glassdoor.com",
  "simplyhired.com",
  "unstop.com",
  "letsintern.com",
  "remoteok.com",
  "remoteok.io",
  "hiringcafe.com",
  "wellfound.com"
];

const ATS_PATTERNS = [
  { platform: "greenhouse", pattern: /boards\.greenhouse\.io\/([^/?#]+)/i },
  { platform: "lever", pattern: /jobs\.lever\.co\/([^/?#]+)/i },
  { platform: "workday", pattern: /([a-z0-9-]+)(?:\.wd\d+)?\.myworkdayjobs\.com/i },
  { platform: "ashby", pattern: /jobs\.ashbyhq\.com\/([^/?#]+)/i },
  { platform: "smartrecruiters", pattern: /jobs\.smartrecruiters\.com\/([^/?#]+)/i },
  { platform: "jobvite", pattern: /jobs\.jobvite\.com\/([^/?#]+)/i },
  { platform: "workable", pattern: /apply\.workable\.com\/([^/?#]+)/i }
];

/**
 * Normalizes company name for slug and domain correlation.
 * Removes entity suffixes (LLC, Inc, Pvt Ltd, Technologies) and punctuation.
 */
export function normalizeCompanyForMatching(company: string): string {
  return company
    .toLowerCase()
    .replace(/\b(inc|incorporated|corp|corporation|llc|ltd|limited|pvt|private|technologies|tech|solutions|co|company|group)\b/gi, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

export interface AuthenticityInput {
  company: string;
  applicationUrl: string;
  sourceUrl?: string;
  sourceName?: string;
  sourceTrust?: SourceTrustLevel;
}

/**
 * Evaluates source trust level and verification state for a specific opportunity.
 * Supports both options object and positional arguments.
 * Strictly decouples source channel trust from individual opportunity authenticity.
 */
export function evaluateAuthenticity(
  companyOrOptions: string | AuthenticityInput,
  applicationUrlParam?: string,
  sourceUrlParam?: string,
  _sourceNameParam?: string,
  sourceTrustParam?: SourceTrustLevel
): AuthenticityEvaluation {
  let company = "";
  let applicationUrl = "";
  let sourceUrl = "";
  let _sourceName = "";
  let channelTrust: SourceTrustLevel | undefined;

  if (typeof companyOrOptions === "object" && companyOrOptions !== null) {
    company = companyOrOptions.company || "";
    applicationUrl = companyOrOptions.applicationUrl || "";
    sourceUrl = companyOrOptions.sourceUrl || "";
    _sourceName = companyOrOptions.sourceName || "";
    channelTrust = companyOrOptions.sourceTrust;
  } else {
    company = companyOrOptions || "";
    applicationUrl = applicationUrlParam || "";
    sourceUrl = sourceUrlParam || "";
    _sourceName = _sourceNameParam || "";
    channelTrust = sourceTrustParam;
  }

  const warnings: string[] = [];
  const normalizedCompany = normalizeCompanyForMatching(company);

  if (!normalizedCompany || normalizedCompany.length < 2) {
    return {
      sourceTrust: channelTrust || "UNKNOWN",
      verificationState: "UNVERIFIED",
      isOfficialAssociation: false,
      confidenceReason: "Organization name is missing or too short to establish authenticity.",
      warnings: ["Missing or invalid organization name."]
    };
  }

  // Helper: extract hostname safely
  let appHostname = "";
  let sourceHostname = "";
  try {
    appHostname = new URL(applicationUrl).hostname.toLowerCase();
  } catch {
    warnings.push("Invalid application URL format.");
  }
  try {
    sourceHostname = new URL(sourceUrl).hostname.toLowerCase();
  } catch {
    // Non-fatal if sourceUrl is malformed, but noted
  }

  // 1. Immediate rejection: Untrusted / Messaging / URL shorteners
  const isUntrustedApp = UNTRUSTED_DOMAINS.some(d => appHostname === d || appHostname.endsWith(`.${d}`));
  const isUntrustedSource = UNTRUSTED_DOMAINS.some(d => sourceHostname === d || sourceHostname.endsWith(`.${d}`));
  if (isUntrustedApp || isUntrustedSource) {
    return {
      sourceTrust: "UNTRUSTED",
      verificationState: "UNVERIFIED",
      isOfficialAssociation: false,
      confidenceReason: "Destination uses a messaging app, unverified chat link, or URL shortener.",
      warnings: ["Untrusted application channel. High spam/phishing risk."]
    };
  }

  // 2. Check direct company career domain (e.g. careers.google.com, stripe.com/jobs)
  // Strips subdomains like 'careers.', 'jobs.', 'www.'
  const cleanAppHost = appHostname.replace(/^(careers\.|jobs\.|talent\.|www\.)/, "");
  const hostDomainParts = cleanAppHost.split(".");
  const appRootDomain = hostDomainParts.length >= 2 ? hostDomainParts[hostDomainParts.length - 2] : "";

  if (appRootDomain && (appRootDomain === normalizedCompany || normalizedCompany.includes(appRootDomain) || appRootDomain.includes(normalizedCompany))) {
    // Direct official company domain match
    return {
      sourceTrust: channelTrust || "OFFICIAL",
      verificationState: "OFFICIAL_SOURCE_CONFIRMED",
      isOfficialAssociation: true,
      confidenceReason: `Direct official domain match: ${appHostname} corresponds to organization ${company}.`,
      warnings
    };
  }

  // 3. Check official university domain (.edu, .edu.in, .ac.in, etc.)
  const isAcademic = appHostname.endsWith(".edu") ||
    appHostname.endsWith(".edu.in") ||
    appHostname.endsWith(".ac.in") ||
    appHostname.endsWith(".res.in");
  if (isAcademic) {
    return {
      sourceTrust: channelTrust || "OFFICIAL",
      verificationState: "OFFICIAL_SOURCE_CONFIRMED",
      isOfficialAssociation: true,
      confidenceReason: `Official academic institution domain: ${appHostname}.`,
      warnings
    };
  }

  // 4. Check official government domain (.gov, .gov.in)
  const isGovernment = appHostname.endsWith(".gov") || appHostname.endsWith(".gov.in");
  if (isGovernment) {
    return {
      sourceTrust: "OFFICIAL",
      verificationState: "OFFICIAL_SOURCE_CONFIRMED",
      isOfficialAssociation: true,
      confidenceReason: `Official government portal: ${appHostname}.`,
      warnings
    };
  }

  // 5. Check ATS Hosting Platforms (Greenhouse, Lever, Workday, etc.)
  // Critical requirement: Do NOT mark official just because it is Greenhouse/Lever.
  // Must verify if the SPECIFIC BOARD SLUG matches the company!
  for (const ats of ATS_PATTERNS) {
    const appMatch = applicationUrl.match(ats.pattern);
    const sourceMatch = sourceUrl.match(ats.pattern);
    const slug = (appMatch?.[1] || sourceMatch?.[1] || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    if (slug) {
      const slugMatchesCompany =
        slug === normalizedCompany ||
        normalizedCompany.includes(slug) ||
        slug.includes(normalizedCompany);

      if (slugMatchesCompany) {
        return {
          sourceTrust: channelTrust || "OFFICIAL",
          verificationState: "OFFICIAL_SOURCE_CONFIRMED",
          isOfficialAssociation: true,
          confidenceReason: `Official ${ats.platform} board verified: slug "${slug}" unambiguously associates with ${company}.`,
          warnings
        };
      } else {
        warnings.push(`ATS platform (${ats.platform}) board "${slug}" does not unambiguously correlate with organization "${company}".`);
        return {
          sourceTrust: channelTrust || "KNOWN_AGGREGATOR",
          verificationState: "SOURCE_CONFIRMED",
          isOfficialAssociation: false,
          confidenceReason: `Listing is hosted on ${ats.platform} but board slug "${slug}" does not cleanly match organization "${company}". Requires review.`,
          warnings
        };
      }
    }
  }

  // 6. Check GitHub Repositories
  if (appHostname === "github.com" || sourceHostname === "github.com") {
    const ghMatch = (applicationUrl + " " + sourceUrl).match(/github\.com\/([^/?#\s]+)/i);
    const ghOrg = (ghMatch?.[1] || "").toLowerCase().replace(/[^a-z0-9]/g, "");

    if (ghOrg && (ghOrg === normalizedCompany || normalizedCompany.includes(ghOrg))) {
      return {
        sourceTrust: channelTrust || "OFFICIAL",
        verificationState: "OFFICIAL_SOURCE_CONFIRMED",
        isOfficialAssociation: true,
        confidenceReason: `Official GitHub organization repository: github.com/${ghOrg} matches ${company}.`,
        warnings
      };
    }

    return {
      sourceTrust: channelTrust || "COMMUNITY_VERIFIED",
      verificationState: "SOURCE_CONFIRMED",
      isOfficialAssociation: false,
      confidenceReason: "GitHub repository is a trusted curation source but not demonstrably maintained by the hiring organization itself.",
      warnings
    };
  }

  // 7. Check Hackathon Platforms (Devfolio, MLH, Devpost)
  // The platform itself is not sufficient proof of authenticity.
  // Only classify as verified official association if the specific event organizer matches the company.
  const isHackathonPlatform = ["devfolio.co", "mlh.io", "devpost.com"].some(d => appHostname.endsWith(d) || sourceHostname.endsWith(d));
  if (isHackathonPlatform) {
    const isMlhOfficial = (appHostname.endsWith("mlh.io") || sourceHostname.endsWith("mlh.io")) && 
      (normalizedCompany.includes("mlh") || normalizedCompany.includes("majorleaguehacking"));
    
    // Check if slug or subdomain matches company
    const platformMatch = (applicationUrl + " " + sourceUrl).match(/(?:https?:\/\/)?([a-z0-9-]+)\.(?:devfolio\.co|devpost\.com)/i);
    const eventSlug = platformMatch?.[1]?.toLowerCase().replace(/[^a-z0-9]/g, "");
    const slugMatchesCompany = eventSlug && (eventSlug === normalizedCompany || normalizedCompany.includes(eventSlug));

    if (isMlhOfficial || slugMatchesCompany) {
      return {
        sourceTrust: channelTrust || "OFFICIAL",
        verificationState: "OFFICIAL_SOURCE_CONFIRMED",
        isOfficialAssociation: true,
        confidenceReason: `Verified hackathon organizer page: ${appHostname} explicitly associates with ${company}.`,
        warnings
      };
    }

    warnings.push(`Hackathon platform (${appHostname}) listing requires organizer association confirmation.`);
    return {
      sourceTrust: channelTrust || "OFFICIAL",
      verificationState: "SOURCE_CONFIRMED",
      isOfficialAssociation: false,
      confidenceReason: `Event discovered on hackathon platform (${appHostname}), but specific organizer association requires review.`,
      warnings
    };
  }

  // 8. Check Known Aggregators
  const isAggregator = KNOWN_AGGREGATORS.some(d => appHostname.endsWith(d) || sourceHostname.endsWith(d));
  if (isAggregator) {
    return {
      sourceTrust: channelTrust || "KNOWN_AGGREGATOR",
      verificationState: "SOURCE_CONFIRMED",
      isOfficialAssociation: false,
      confidenceReason: `Discovered from recognized aggregator (${appHostname}). Requires review before publishing as official.`,
      warnings
    };
  }

  // 9. Default fallback: Unknown third-party domain
  if (channelTrust === "CURATED_FEED" || channelTrust === "COMMUNITY_VERIFIED" || channelTrust === "TRUSTED" || channelTrust === "OFFICIAL") {
    warnings.push(`Destination domain (${appHostname}) is not recognized as the official organization domain for ${company}.`);
    return {
      sourceTrust: channelTrust,
      verificationState: "SOURCE_CONFIRMED",
      isOfficialAssociation: false,
      confidenceReason: `Discovered via ${channelTrust} channel, but destination domain (${appHostname}) requires review before verifying official organization association.`,
      warnings
    };
  }

  warnings.push(`Unrecognized destination domain: ${appHostname}.`);
  return {
    sourceTrust: channelTrust || "UNKNOWN",
    verificationState: "UNVERIFIED",
    isOfficialAssociation: false,
    confidenceReason: `Domain ${appHostname} is not recognized as an authoritative or verified source for ${company}.`,
    warnings
  };
}
