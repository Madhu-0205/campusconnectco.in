async function main() {
  console.log("==================================================");
  console.log("TEST 3: REAL API STREAM TEST (POST /api/ai/chat)");
  console.log("==================================================");

  const prompt = "What skills should a beginner learn for a data analyst internship?";
  console.log(`Sending request with prompt: "${prompt}"...`);

  const startTime = Date.now();
  const res = await fetch("http://localhost:3000/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: prompt }],
      context: { mode: "career-advice" },
    }),
  });

  const statusCode = res.status;
  const contentType = res.headers.get("content-type") || "";
  console.log(`HTTP Status: ${statusCode}`);
  console.log(`Content-Type: ${contentType}`);

  if (statusCode !== 200) {
    console.error(`FAIL: Expected HTTP 200, got ${statusCode}`);
    const errText = await res.text();
    console.error("Error body:", errText);
    process.exit(1);
  }

  if (!contentType.includes("text/event-stream")) {
    console.error(`FAIL: Expected text/event-stream, got ${contentType}`);
    process.exit(1);
  }

  if (!res.body) {
    console.error("FAIL: No response body returned.");
    process.exit(1);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";
  let chunkCount = 0;
  let hasDoneSignal = false;
  const deltas: string[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    chunkCount++;
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
        } catch (e) {
          // ignore partial json
        }
      }
    }
  }

  const durationMs = Date.now() - startTime;
  console.log(`\nStream complete in ${durationMs}ms:`);
  console.log(`- Total SSE chunks received: ${chunkCount}`);
  console.log(`- Total token deltas received: ${deltas.length}`);
  console.log(`- Received data: [DONE]: ${hasDoneSignal}`);
  console.log(`- Full text character length: ${fullText.length}`);

  console.log("\n--- Full Streamed Content ---");
  console.log(fullText);
  console.log("-----------------------------\n");

  // Verification checks:
  if (!hasDoneSignal) {
    console.error("FAIL: Missing data: [DONE] termination signal.");
    process.exit(1);
  }

  if (deltas.length < 5) {
    console.error(`FAIL: Too few delta chunks (${deltas.length}). Stream did not stream properly.`);
    process.exit(1);
  }

  const isFallback =
    fullText.includes("AI assistance is temporarily unavailable") ||
    fullText.includes("Verified Guidance from CampusConnectCo Platform Records") ||
    fullText.includes("Live Puter AI response is temporarily unavailable");

  if (isFallback) {
    console.error("FAIL: Received fallback response instead of real Groq-generated content.");
    process.exit(1);
  }

  // Check for expected data analyst skills mentioned by LLM (e.g. SQL, Excel, Python)
  const lower = fullText.toLowerCase();
  const mentionsSkills =
    lower.includes("sql") ||
    lower.includes("excel") ||
    lower.includes("python") ||
    lower.includes("tableau") ||
    lower.includes("power bi");

  if (!mentionsSkills) {
    console.warn("WARNING: Expected standard data analyst skill keywords in response.");
  }

  console.log(`- Mentions data analyst skills (SQL/Python/Excel/Tableau/Power BI): ${mentionsSkills}`);
  console.log("- Static fallback detected: false");
  console.log("\n✅ REAL API STREAM TEST VERIFIED!");
}

main().catch((err) => {
  console.error("Stream test crashed:", err);
  process.exit(1);
});
