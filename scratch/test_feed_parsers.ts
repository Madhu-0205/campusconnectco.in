import { discoverViaAgentReachFeed } from "../src/lib/automation/sources/agent-reach-adapter";

async function inspectFeeds() {
  console.log("--- Testing CERN SmartRecruiters API ---");
  try {
    const res = await fetch("https://careers.smartrecruiters.com/CERN/api/more?page=1");
    const json = await res.json();
    console.log("CERN items count:", json.content?.length);
    if (json.content?.length > 0) {
      console.log("CERN sample:", JSON.stringify(json.content[0], null, 2));
    }
  } catch (e: any) {
    console.error("CERN error:", e.message);
  }

  console.log("\n--- Testing Jobs.ac.uk Research RSS via Agent-Reach ---");
  try {
    const items = await discoverViaAgentReachFeed("https://www.jobs.ac.uk/jobs/phd.rss", "jobs_ac_uk_research", 3);
    console.log("Jobs.ac.uk items count:", items.length);
    if (items.length > 0) {
      console.log("Jobs.ac.uk sample:", JSON.stringify(items[0], null, 2));
    }
  } catch (e: any) {
    console.error("Jobs.ac.uk error:", e.message);
  }

  console.log("\n--- Testing Scholarship Positions RSS via Agent-Reach ---");
  try {
    const items = await discoverViaAgentReachFeed("https://scholarship-positions.com/feed/", "scholarship_positions", 3);
    console.log("Scholarship items count:", items.length);
    if (items.length > 0) {
      console.log("Scholarship sample:", JSON.stringify(items[0], null, 2));
    }
  } catch (e: any) {
    console.error("Scholarship error:", e.message);
  }
}

inspectFeeds();
