/**
 * Agent-Reach Discovery Adapter
 * CampusConnectCo — Phase 15
 *
 * Integrates with the local Agent-Reach installation (Panniantong/Agent-Reach)
 * to provide autonomous internet opportunity discovery using Agent-Reach's
 * WebChannel (Jina Reader) and RSS/Feedparser capabilities.
 */

import { exec } from "child_process";
import { promisify } from "util";
import { RawDiscoveredItem } from "../types";

const execAsync = promisify(exec);

export interface AgentReachStatus {
  version: string;
  isAvailable: boolean;
  pythonPath: string;
  channels: Record<string, any>;
  error?: string;
}

const AGENT_REACH_VENV_PYTHON = process.env.AGENT_REACH_PYTHON || "/Users/madhu/.agent-reach-venv/bin/python";
const AGENT_REACH_CLI = process.env.AGENT_REACH_CLI || "/Users/madhu/.agent-reach-venv/bin/agent-reach";

/**
 * Checks the runtime status and capabilities of the installed Agent-Reach environment.
 */
export async function checkAgentReachStatus(): Promise<AgentReachStatus> {
  try {
    // 1. Fast, reliable CLI and version verification (no network overhead)
    const { stdout: verOut } = await execAsync(`${AGENT_REACH_CLI} --version`, { timeout: 5000 });
    const versionMatch = verOut.match(/v?(\d+\.\d+\.\d+)/i);
    const version = versionMatch ? versionMatch[1] : "1.5.0";

    // 2. Query doctor channels if available
    let channels: Record<string, any> = {
      web: { status: "ok", name: "Jina Reader" },
      rss: { status: "ok", name: "feedparser" }
    };

    try {
      const { stdout: doctorOut } = await execAsync(`${AGENT_REACH_CLI} doctor --json`, { timeout: 15000 });
      channels = JSON.parse(doctorOut);
    } catch (_docErr) {
      // Non-fatal, doctor performs remote pings
    }

    return {
      version,
      isAvailable: true,
      pythonPath: AGENT_REACH_VENV_PYTHON,
      channels
    };
  } catch (err: any) {
    return {
      version: "unknown",
      isAvailable: false,
      pythonPath: AGENT_REACH_VENV_PYTHON,
      channels: {},
      error: err.message
    };
  }
}

/**
 * Executes a discovery run using Agent-Reach's WebChannel (Jina Reader markdown extractor).
 */
export async function discoverViaAgentReachWeb(
  targetUrl: string,
  sourceId: string = "agent_reach_web",
  maxItems: number = 10
): Promise<RawDiscoveredItem[]> {
  const pythonScript = `
import json, sys
from agent_reach.channels.web import WebChannel

try:
    web = WebChannel()
    content = web.read("${targetUrl}")
    print(json.dumps({"success": True, "content": content}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
`;

  try {
    const { stdout } = await execAsync(
      `${AGENT_REACH_VENV_PYTHON} -c '${pythonScript.replace(/'/g, "'\\''")}'`,
      { timeout: 30000 }
    );

    const res = JSON.parse(stdout);
    if (!res.success || !res.content) {
      console.warn(`[Agent-Reach Web] Fetch failed: ${res.error || "empty content"}`);
      return [];
    }

    // Extract opportunities from the structured markdown
    return parseOpportunitiesFromMarkdown(res.content, targetUrl, sourceId, maxItems);
  } catch (err: any) {
    console.error(`[Agent-Reach Web] Execution error: ${err.message}`);
    return [];
  }
}

/**
 * Executes a discovery run using Agent-Reach's feedparser backend.
 */
export async function discoverViaAgentReachFeed(
  feedUrl: string,
  sourceId: string = "agent_reach_feed",
  maxItems: number = 10
): Promise<RawDiscoveredItem[]> {
  const pythonScript = `
import json, sys, feedparser

try:
    d = feedparser.parse("${feedUrl}")
    items = []
    for entry in d.entries[:${maxItems}]:
        items.append({
            "title": getattr(entry, "title", ""),
            "link": getattr(entry, "link", ""),
            "summary": getattr(entry, "summary", "")[:2000],
            "published": getattr(entry, "published", ""),
            "id": getattr(entry, "id", getattr(entry, "link", ""))
        })
    print(json.dumps({"success": True, "items": items}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
`;

  try {
    const { stdout } = await execAsync(
      `${AGENT_REACH_VENV_PYTHON} -c '${pythonScript.replace(/'/g, "'\\''")}'`,
      { timeout: 25000 }
    );

    const res = JSON.parse(stdout);
    if (!res.success || !Array.isArray(res.items)) {
      console.warn(`[Agent-Reach Feed] Fetch failed: ${res.error || "no items"}`);
      return [];
    }

    return res.items.map((item: any) => {
      // Parse company and role if title is "Company: Role" or "Role at Company"
      let company = "Tech Organization";
      let title = item.title;

      if (title.includes(":")) {
        const parts = title.split(":");
        company = parts[0].trim();
        title = parts.slice(1).join(":").trim();
      } else if (title.toLowerCase().includes(" at ")) {
        const parts = title.split(/ at /i);
        title = parts[0].trim();
        company = parts[1].trim();
      }

      return {
        externalId: item.id || item.link,
        title,
        company,
        description: item.summary || `${title} at ${company}`,
        applicationUrl: item.link,
        sourceUrl: item.link,
        source: sourceId,
        sourceName: "Agent-Reach Feedparser",
        opportunityType: title.toLowerCase().includes("intern") ? "INTERNSHIP" : "GIG",
        workMode: "remote",
        location: "Remote",
        metadata: {
          discoveredVia: "Agent-Reach Feedparser",
          publishedDate: item.published
        }
      } as RawDiscoveredItem;
    });
  } catch (err: any) {
    console.error(`[Agent-Reach Feed] Execution error: ${err.message}`);
    return [];
  }
}

/**
 * Extracts opportunities from Markdown output produced by Agent-Reach's WebChannel.
 */
function parseOpportunitiesFromMarkdown(
  markdown: string,
  sourceUrl: string,
  sourceId: string,
  maxItems: number
): RawDiscoveredItem[] {
  const items: RawDiscoveredItem[] = [];
  const lines = markdown.split("\n");

  for (let i = 0; i < lines.length && items.length < maxItems; i++) {
    const line = lines[i].trim();

    // Look for markdown links representing job or internship listings
    // Format e.g.: [Role Title](https://...) or **[Company]** - [Role](...)
    const linkMatch = line.match(/\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/);
    if (linkMatch) {
      const text = linkMatch[1].trim();
      const url = linkMatch[2].trim();

      // Filter out navigation links, privacy links, headers
      if (
        text.length > 5 &&
        !url.includes("login") &&
        !url.includes("privacy") &&
        !url.includes("terms") &&
        !url.includes("twitter.com") &&
        !url.includes("facebook.com") &&
        (text.toLowerCase().includes("engineer") ||
          text.toLowerCase().includes("developer") ||
          text.toLowerCase().includes("intern") ||
          text.toLowerCase().includes("designer") ||
          text.toLowerCase().includes("manager") ||
          text.toLowerCase().includes("hiring"))
      ) {
        let company = "Tech Organization";
        let title = text;

        if (text.includes(" - ")) {
          const parts = text.split(" - ");
          company = parts[0].trim();
          title = parts.slice(1).join(" - ").trim();
        } else if (text.toLowerCase().includes(" at ")) {
          const parts = text.split(/ at /i);
          title = parts[0].trim();
          company = parts[1].trim();
        }

        items.push({
          externalId: url,
          title,
          company,
          description: `${title} opportunity at ${company}. Discovered autonomously via Agent-Reach WebChannel.`,
          applicationUrl: url,
          sourceUrl: url,
          source: sourceId,
          sourceName: "Agent-Reach WebChannel (Jina Reader)",
          opportunityType: title.toLowerCase().includes("intern") ? "INTERNSHIP" : "GIG",
          workMode: "remote",
          location: "Remote / Hybrid",
          metadata: {
            discoveredVia: "Agent-Reach WebChannel (Jina Reader)",
            parentPage: sourceUrl
          }
        });
      }
    }
  }

  return items;
}
