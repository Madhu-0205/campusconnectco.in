/**
 * Mohan Careers (mohancareers.com) Opportunity Collector
 * CampusConnectCo — Phase 16D
 *
 * Dedicated collector for Mohan Careers using its official WordPress REST API:
 * Endpoint: https://mohancareers.com/wp-json/wp/v2/posts
 *
 * Safety & Quality Policies:
 * - Direct employer application link extraction (Jio, Deloitte, Accenture, etc.)
 * - Filters out internal, ad, and social links (Telegram/WhatsApp)
 * - Retains full provenance: sourceUrl (post.link) and externalId (post.id)
 * - Initial source trust: UNKNOWN (requires human review)
 * - Zero fabricated fields: missing deadlines or salaries remain null
 * - Robust error handling: handles timeouts, HTTP errors, and bounded pagination
 */

import { normalizeDate, validateSafeUrl } from "../normalizer";
import { RawDiscoveredItem, SourceConfig } from "../types";

export interface MohanCareersCollectorOptions {
  mockPosts?: any[];
  maxPages?: number;
  timeoutMs?: number;
}

/**
 * Decodes common HTML entities from titles and descriptions.
 */
export function decodeHtmlEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#038;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extracts the genuine direct employer application URL from WordPress post HTML.
 * Filters out internal links, ads, and social media channels (Telegram, WhatsApp).
 */
export function extractApplicationUrl(htmlContent: string): string | null {
  if (!htmlContent) return null;

  // Patterns for anchors: <a ... href="..." ...>...</a>
  const anchorRegex = /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis;
  const matches = [...htmlContent.matchAll(anchorRegex)];

  const candidates: { url: string; score: number }[] = [];

  for (const match of matches) {
    let rawUrl = match[1]?.trim();
    const anchorText = match[2]?.replace(/<[^>]+>/g, "").trim() || "";

    if (!rawUrl) continue;

    // Decode entities
    rawUrl = rawUrl.replace(/&amp;/g, "&");

    // Check basic protocol
    if (!rawUrl.startsWith("http://") && !rawUrl.startsWith("https://")) {
      continue;
    }

    try {
      const parsed = new URL(rawUrl);
      const host = parsed.hostname.toLowerCase();

      // Filter out internal, advertisement, and social aggregator domains
      if (
        host.includes("mohancareers.com") ||
        host.includes("google.com") ||
        host.includes("googlesyndication.com") ||
        host.includes("doubleclick.net") ||
        host.includes("t.me") ||
        host.includes("telegram.me") ||
        host.includes("telegram.org") ||
        host.includes("whatsapp.com") ||
        host.includes("facebook.com") ||
        host.includes("instagram.com") ||
        host.includes("twitter.com") ||
        host.includes("x.com") ||
        host.includes("youtube.com") ||
        host.includes("pinterest.com")
      ) {
        continue;
      }

      // Check if URL is safe from SSRF
      const safeCheck = validateSafeUrl(rawUrl);
      if (!safeCheck.valid || !safeCheck.cleanUrl) {
        continue;
      }

      let score = 1;

      // Bonus if anchor text indicates apply action
      if (/^(click\s*here|apply\s*now|apply\s*here|apply\s*online|apply)$/i.test(anchorText)) {
        score += 10;
      }

      // Bonus if surrounding HTML mentions "apply link"
      const matchIndex = match.index || 0;
      const surroundingStart = Math.max(0, matchIndex - 100);
      const surroundingContext = htmlContent.slice(surroundingStart, matchIndex);
      if (/apply\s*link/i.test(surroundingContext)) {
        score += 20;
      }

      // Bonus for known career portals / ATS
      if (
        host.includes("myworkdayjobs.com") ||
        host.includes("greenhouse.io") ||
        host.includes("lever.co") ||
        host.includes("smartrecruiters.com") ||
        host.includes("oraclecloud.com") ||
        host.includes("careers.") ||
        host.includes("jobs.") ||
        host.includes("deloitte.com") ||
        host.includes("amazon.jobs") ||
        host.includes("accenture.com") ||
        host.includes("capgemini.com") ||
        host.includes("naukri.com") ||
        host.includes("linkedin.com") ||
        host.endsWith(".gov.in") ||
        host.endsWith(".nic.in")
      ) {
        score += 5;
      }

      candidates.push({ url: safeCheck.cleanUrl, score });
    } catch {
      // Ignore URL parse errors
    }
  }

  if (candidates.length === 0) return null;

  // Sort by score descending
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].url;
}

/**
 * Extracts company and role cleanly from post title and content.
 */
export function extractCompanyAndRole(
  titleRendered: string,
  contentRendered: string
): { company: string; role: string; cleanTitle: string } {
  const decodedTitle = decodeHtmlEntities(titleRendered);

  let company = "";
  let role = "";

  // Check structured title with pipe: e.g. "Deloitte Recruitment 2026 | Service Associate | Apply Now"
  const pipeParts = decodedTitle.split("|").map((p) => p.trim());

  if (pipeParts.length >= 3) {
    const p0 = pipeParts[0];
    const p1 = pipeParts[1];
    const p2 = pipeParts[2];

    if (/Govt Jobs/i.test(p0)) {
      const compMatch = p1.match(/^([A-Za-z0-9\s\.\&]+?)\s+(?:Recruitment|Notification|Jobs|Walk-in)/i);
      company = compMatch ? compMatch[1].trim() : p1;
      role = p2.replace(/\s*\|\s*Apply\s*Now/i, "").trim();
    } else {
      const compMatch = p0.match(/^([A-Za-z0-9\s\.\&]+?)\s+(?:Recruitment|Notification|Jobs|Hiring|Is Hiring)/i);
      company = compMatch ? compMatch[1].trim() : p0.split(" ")[0];
      role = p1.replace(/Apply\s*Now/i, "").trim();
    }
  } else if (pipeParts.length === 2) {
    const p0 = pipeParts[0];
    const p1 = pipeParts[1];
    const compMatch = p0.match(/^([A-Za-z0-9\s\.\&]+?)\s+(?:Recruitment|Notification|Jobs|Hiring|Is Hiring)/i);
    company = compMatch ? compMatch[1].trim() : p0.split(" ")[0];

    if (/Hiring Freshers|Freshers Hiring|Latest/i.test(p1)) {
      // Look for specific role in content
      const roleMatch =
        contentRendered.match(/JOB\s*ROLE\s*:\s*([^<\n]+)/i) ||
        contentRendered.match(/position of\s*([^<\n,]+)/i) ||
        contentRendered.match(/role of\s*([^<\n,]+)/i);
      role = roleMatch ? decodeHtmlEntities(roleMatch[1].replace(/<[^>]+>/g, "").trim()) : p0;
    } else {
      role = p1.replace(/Apply\s*Now/i, "").trim();
    }
  } else {
    // Single title without pipe: e.g. "Jio mass hiring for freshers/women's 2026"
    const compMatch = decodedTitle.match(
      /^([A-Za-z0-9\s\.\&]+?)\s+(?:Recruitment|Notification|Jobs|Hiring|Is Hiring|mass hiring)/i
    );
    company = compMatch ? compMatch[1].trim() : decodedTitle.split(" ")[0];

    const roleMatch =
      contentRendered.match(/JOB\s*ROLE\s*:\s*([^<\n]+)/i) ||
      contentRendered.match(/position of\s*([^<\n,]+)/i);
    role = roleMatch ? decodeHtmlEntities(roleMatch[1].replace(/<[^>]+>/g, "").trim()) : decodedTitle;
  }

  // Clean company prefix noise
  company = company
    .replace(/^(Latest|Upcoming|Urgent|Top)\s+/i, "")
    .replace(/\s+Is$/i, "")
    .trim();

  // If company is still empty, fallback safely
  if (!company) {
    company = decodedTitle.split(" ")[0] || "Mohan Careers Listing";
  }

  const cleanTitle = role && role !== company ? `${company} - ${role}` : decodedTitle;

  return { company, role: role || cleanTitle, cleanTitle };
}

/**
 * Extracts explicit deadline from post text if explicitly stated.
 * Never uses post publication date as deadline.
 */
export function extractExplicitDeadline(contentRendered: string): Date | null {
  if (!contentRendered) return null;

  const plainText = contentRendered.replace(/<[^>]+>/g, " ");
  const deadlineMatch = plainText.match(
    /(?:last\s*date|application\s*deadline|apply\s*before|closing\s*date)[^:\n]{0,25}:\s*([^\n\.\,]{4,40})/i
  );

  if (deadlineMatch && deadlineMatch[1]) {
    const rawDateStr = deadlineMatch[1].trim();
    const parsed = normalizeDate(rawDateStr);
    if (parsed && !isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return null;
}

/**
 * Determines work mode and location from categories, title, and content.
 */
export function determineWorkModeAndLocation(
  categories: number[] = [],
  title: string,
  content: string
): { workMode: "remote" | "hybrid" | "on-site"; location: string | null } {
  const text = `${title} ${content}`.toLowerCase();

  // Category 4 on MohanCareers is "Work From Home Jobs"
  const isWfhCategory = categories.includes(4);

  if (isWfhCategory || text.includes("work from home") || text.includes("wfh") || text.includes("remote job")) {
    return { workMode: "remote", location: "Remote (India)" };
  }

  if (text.includes("hybrid")) {
    return { workMode: "hybrid", location: "India (Hybrid)" };
  }

  // Check for prominent Indian tech hubs
  const cities = [
    "bengaluru",
    "bangalore",
    "hyderabad",
    "chennai",
    "pune",
    "mumbai",
    "delhi",
    "noida",
    "gurugram",
    "gurgaon",
    "kolkata",
    "ahmedabad"
  ];

  for (const city of cities) {
    if (text.includes(city)) {
      const capitalized = city.charAt(0).toUpperCase() + city.slice(1);
      return { workMode: "on-site", location: `${capitalized}, India` };
    }
  }

  return { workMode: "on-site", location: "India" };
}

/**
 * Primary collector function for Mohan Careers.
 * Fetches from WP REST API or uses mock payload for testing.
 */
export async function fetchMohanCareersItems(
  config: SourceConfig,
  options?: MohanCareersCollectorOptions
): Promise<RawDiscoveredItem[]> {
  const items: RawDiscoveredItem[] = [];
  const maxItems = config.maxItemsPerRun || 15;
  const timeoutMs = options?.timeoutMs || 10000;
  const maxPages = options?.maxPages || 2;

  // 1. If mock posts are passed (for tests), process them directly
  if (options?.mockPosts) {
    return processPostsToRawItems(options.mockPosts, config, maxItems);
  }

  // 2. Fetch live from WordPress REST API with bounded pagination
  const baseUrl = config.endpointUrl || "https://mohancareers.com/wp-json/wp/v2/posts";
  let currentPage = 1;

  while (items.length < maxItems && currentPage <= maxPages) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const pageUrl = new URL(baseUrl);
      pageUrl.searchParams.set("page", String(currentPage));
      pageUrl.searchParams.set("per_page", String(Math.min(maxItems - items.length, 10)));

      const res = await fetch(pageUrl.toString(), {
        headers: {
          "User-Agent": "CampusConnectCo-OpportunityBot/1.0 (+https://campusconnectco.in; opportunity-bot@campusconnectco.in)",
          Accept: "application/json"
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (res.status === 400) {
        // WordPress returns 400 when page exceeds total pages: gracefully exit
        break;
      }

      if (!res.ok) {
        throw new Error(`Mohan Careers API returned HTTP ${res.status}: ${res.statusText}`);
      }

      const posts = await res.json();
      if (!Array.isArray(posts) || posts.length === 0) {
        break;
      }

      const pageItems = processPostsToRawItems(posts, config, maxItems - items.length);
      items.push(...pageItems);

      // Check if more pages exist via Link or X-WP-TotalPages
      const totalPagesHeader = res.headers.get("x-wp-totalpages");
      if (totalPagesHeader && currentPage >= parseInt(totalPagesHeader, 10)) {
        break;
      }

      currentPage++;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === "AbortError") {
        throw new Error(`Mohan Careers API request timed out after ${timeoutMs}ms`);
      }
      throw err;
    }
  }

  return items;
}

/**
 * Normalizes an array of raw WordPress post objects into RawDiscoveredItem objects.
 */
export function processPostsToRawItems(
  posts: any[],
  config: SourceConfig,
  limit: number
): RawDiscoveredItem[] {
  const items: RawDiscoveredItem[] = [];

  for (const post of posts) {
    if (items.length >= limit) break;
    if (!post || typeof post !== "object") continue;

    const postId = post.id ? String(post.id) : null;
    const postUrl = post.link || `https://mohancareers.com/?p=${post.id}`;
    const rawTitle = post.title?.rendered || "";
    const rawContent = post.content?.rendered || "";
    const categories: number[] = Array.isArray(post.categories) ? post.categories : [];
    const publishedDate = post.date ? new Date(post.date) : new Date();

    // 1. Extract employer application URL
    const appUrl = extractApplicationUrl(rawContent);

    // If no valid employer application link exists, we skip it to prevent staging non-actionable blog articles
    if (!appUrl) {
      continue;
    }

    // 2. Extract company and clean role
    const { company, cleanTitle } = extractCompanyAndRole(rawTitle, rawContent);

    // 3. Determine work mode and location without inventing
    const { workMode, location } = determineWorkModeAndLocation(categories, rawTitle, rawContent);

    // 4. Extract explicit deadline if stated (never use post date)
    const deadline = extractExplicitDeadline(rawContent);

    // 5. Clean description excerpt
    const plainDesc = rawContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const description = decodeHtmlEntities(plainDesc).slice(0, 3000);

    items.push({
      source: config.source,
      sourceName: config.sourceName,
      sourceUrl: postUrl,
      externalId: postId,
      applicationUrl: appUrl,
      title: cleanTitle,
      company,
      description: description || `Career opportunity at ${company}: ${cleanTitle}. Apply via official career portal.`,
      opportunityType: /intern/i.test(cleanTitle) ? "INTERNSHIP" : /apprentice/i.test(cleanTitle) ? "APPRENTICESHIP" : "JOB",
      location,
      country: "India",
      workMode,
      deadline,
      discoveredAt: publishedDate,
      tags: ["mohan-careers", "fresher-hiring", "india-careers"]
    });
  }

  return items;
}
