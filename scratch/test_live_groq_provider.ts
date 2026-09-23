import dotenv from "dotenv";
dotenv.config();

import { GroqProvider } from "../src/lib/ai/provider";

async function main() {
  console.log("==================================================");
  console.log("TEST 2: REAL GROQ PROVIDER VERIFICATION");
  console.log("==================================================");

  const provider = new GroqProvider();

  console.log(`Provider is available: ${provider.isAvailable()}`);
  console.log(`Model configured: ${provider.getModel()}`);
  console.log(`Attribution: ${provider.getAttribution()}`);

  if (!provider.isAvailable()) {
    console.error("FAIL: GroqProvider reported unavailable. Check GROQ_API_KEY.");
    process.exit(1);
  }

  const prompt = "Explain CampusConnectCo in one short paragraph.";
  console.log(`Sending real prompt: "${prompt}"...`);

  const startTime = Date.now();
  const response = await provider.chat([
    {
      role: "system",
      content: "You are the CampusConnectCo AI assistant. Keep responses professional and concise.",
    },
    {
      role: "user",
      content: prompt,
    },
  ]);
  const durationMs = Date.now() - startTime;

  console.log(`\nResponse received in ${durationMs}ms:`);
  console.log("--------------------------------------------------");
  console.log(response);
  console.log("--------------------------------------------------");

  // Verification checks:
  const isFallback =
    response.includes("AI assistance is temporarily unavailable") ||
    response.includes("Verified Guidance from CampusConnectCo Platform Records") ||
    response.includes("Live Puter AI response is temporarily unavailable");

  if (isFallback) {
    console.error("FAIL: Response matched static fallback text! Not a live Groq response.");
    process.exit(1);
  }

  if (!response || response.trim().length < 20) {
    console.error("FAIL: Response is empty or too short.");
    process.exit(1);
  }

  // Safety check: ensure no API key is in the response
  if (process.env.GROQ_API_KEY && response.includes(process.env.GROQ_API_KEY)) {
    console.error("CRITICAL SECURITY ERROR: API key found in response!");
    process.exit(1);
  }

  console.log("\n✅ REAL GROQ PROVIDER RESPONSE VERIFIED!");
}

main().catch((err) => {
  console.error("Provider test failed with error:", err?.message || err);
  process.exit(1);
});
