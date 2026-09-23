import { discoverViaAgentReachWeb } from "../src/lib/automation/sources/agent-reach-adapter";

async function testMlhWeb() {
  console.log("Testing Agent-Reach Web on MLH events...");
  const items = await discoverViaAgentReachWeb("https://mlh.io/seasons/2026/events", "mlh_events_web", 5);
  console.log("MLH Web items found:", items.length);
  if (items.length > 0) {
    console.log("Sample MLH web item:", JSON.stringify(items[0], null, 2));
  }
}
testMlhWeb();
