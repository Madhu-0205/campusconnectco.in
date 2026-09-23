import { discoverViaAgentReachFeed } from "../src/lib/automation/sources/agent-reach-adapter";

async function testHnParse() {
  console.log("Testing discoverViaAgentReachFeed on hnrss.org/jobs...");
  const items = await discoverViaAgentReachFeed("https://hnrss.org/jobs", "hn_jobs", 3);
  console.log("Found items:", items.length);
  if (items.length > 0) {
    console.log("Sample 1:", JSON.stringify(items[0], null, 2));
  }
}
testHnParse();
