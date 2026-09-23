async function main() {
  console.log("==================================================");
  console.log("PHASE 11.1: PRODUCTION API STREAM VERIFICATION");
  console.log("URL: https://www.campusconnectco.in/api/ai/chat");
  console.log("==================================================");

  const prompt = "What is CampusConnectCo?";
  console.log(`Sending prompt to production: "${prompt}"...`);

  const startTime = Date.now();
  const res = await fetch("https://www.campusconnectco.in/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      context: { mode: "general" },
    }),
  });

  const statusCode = res.status;
  const contentType = res.headers.get("content-type") || "";
  const vercelId = res.headers.get("x-vercel-id") || "";
  console.log(`HTTP Status: ${statusCode}`);
  console.log(`Content-Type: ${contentType}`);
  console.log(`x-vercel-id: ${vercelId}`);

  if (statusCode !== 200) {
    const errText = await res.text();
    console.error(`FAIL: Expected HTTP 200, got ${statusCode}:`, errText);
    process.exit(1);
  }

  if (!contentType.includes("text/event-stream")) {
    console.error(`FAIL: Expected text/event-stream, got ${contentType}`);
    process.exit(1);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";
  let chunksReceived = 0;
  let hasDoneSignal = false;
  const deltas: string[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunksReceived++;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith(":")) continue;
      if (trimmed === "data: [DONE]") {
        hasDoneSignal = true;
        break;
      }
      if (trimmed.startsWith("data:")) {
        try {
          const parsed = JSON.parse(trimmed.slice(5).trim());
          if (parsed.delta) {
            deltas.push(parsed.delta);
            fullText += parsed.delta;
          }
        } catch {}
      }
    }
  }

  const durationMs = Date.now() - startTime;
  console.log(`\nProduction stream complete in ${durationMs}ms:`);
  console.log(`- Total SSE chunks: ${chunksReceived}`);
  console.log(`- Total token deltas: ${deltas.length}`);
  console.log(`- Received data: [DONE]: ${hasDoneSignal}`);
  console.log(`- Full text character length: ${fullText.length}`);

  console.log("\n--- Production Streamed Content Preview ---");
  console.log(fullText.slice(0, 400));
  console.log("...\n-------------------------------------------");

  const isFallback =
    fullText.includes("AI assistance is temporarily unavailable") ||
    fullText.includes("Live Puter AI response is temporarily unavailable");

  console.log(`- Fallback message present: ${isFallback}`);
  console.log(`- Execution region from x-vercel-id: ${vercelId.includes("sin1") ? "sin1 (CONFIRMED)" : vercelId}`);

  if (isFallback) {
    console.error("FAIL: Production returned fallback message! Groq key was not active.");
    process.exit(1);
  }

  if (!hasDoneSignal || deltas.length < 5) {
    console.error("FAIL: Stream incomplete or did not deliver token deltas.");
    process.exit(1);
  }

  console.log("\n✅ PRODUCTION API STREAM VERIFIED (LIVE GROQ AI ACTIVE)!");
}

main().catch((err) => {
  console.error("Production stream test failed:", err);
  process.exit(1);
});
