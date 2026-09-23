import { discoverViaAgentReachFeed } from "../src/lib/automation/sources/agent-reach-adapter";

async function testMlhRss() {
  console.log("Testing MLH 2026 events RSS...");
  const items = await discoverViaAgentReachFeed("https://mlh.io/seasons/2026/events.rss", "mlh_hackathons", 5);
  console.log("Found MLH items:", items.length);
  if (items.length > 0) {
    console.log("Sample MLH item:", JSON.stringify(items[0], null, 2));
  }
}
testMlhRss();
