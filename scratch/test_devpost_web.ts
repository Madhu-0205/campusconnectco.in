import { discoverViaAgentReachWeb } from "../src/lib/automation/sources/agent-reach-adapter";

async function testAgentReachWeb() {
  console.log("Testing Agent-Reach Web with Devpost...");
  try {
    const items = await discoverViaAgentReachWeb("https://devpost.com/hackathons", "agent_reach_devpost", 5);
    console.log("Devpost items found:", items.length);
    if (items.length > 0) {
      console.log("Sample:", JSON.stringify(items[0], null, 2));
    }
  } catch (err: any) {
    console.error("Devpost error:", err.message);
  }
}

testAgentReachWeb();
