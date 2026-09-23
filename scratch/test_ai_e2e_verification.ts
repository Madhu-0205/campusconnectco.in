interface StreamResult {
  query: string;
  statusCode: number;
  contentType: string | null;
  chunksReceived: number;
  hasDoneSignal: boolean;
  fullText: string;
  isTruthfulFallback: boolean;
  isDisguised: boolean;
}

async function testQuery(query: string): Promise<StreamResult> {
  console.log(`\n========================================`);
  console.log(`Testing Query: "${query}"`);
  console.log(`========================================`);

  const res = await fetch("http://localhost:3000/api/ai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: query }],
      context: { mode: "general" },
    }),
  });

  const statusCode = res.status;
  const contentType = res.headers.get("content-type");
  console.log(`Status: ${statusCode}, Content-Type: ${contentType}`);

  if (!res.body) {
    throw new Error("No response body received from /api/ai/chat");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let fullText = "";
  let chunksReceived = 0;
  let hasDoneSignal = false;

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
            fullText += parsed.delta;
          }
        } catch {}
      }
    }
  }

  const isTruthfulFallback =
    fullText.includes("AI assistance is temporarily unavailable") ||
    fullText.includes("Live Puter AI response is temporarily unavailable");

  // A disguised fallback would claim to be live AI without indicating unavailable status
  const isDisguised = !isTruthfulFallback && fullText.includes("CampusConnectCo");

  console.log(`Chunks received: ${chunksReceived}`);
  console.log(`Has [DONE] signal: ${hasDoneSignal}`);
  console.log(`Output length: ${fullText.length} chars`);
  console.log(`Preview: ${fullText.slice(0, 150).replace(/\n/g, " ")}...`);
  console.log(`Truthful fallback: ${isTruthfulFallback}`);

  return {
    query,
    statusCode,
    contentType,
    chunksReceived,
    hasDoneSignal,
    fullText,
    isTruthfulFallback,
    isDisguised,
  };
}

async function main() {
  const queries = [
    "Hello",
    "What internships are available?",
    "What skills should I learn for a data analyst internship?",
    "Find opportunities related to Python.",
  ];

  const results: StreamResult[] = [];

  for (const q of queries) {
    const r = await testQuery(q);
    results.push(r);
  }

  console.log("\n========================================");
  console.log("AI END-TO-END VERIFICATION SUMMARY:");
  console.log("========================================");

  for (const r of results) {
    console.log(`\nQuery: "${r.query}"`);
    console.log(`  - Status: ${r.statusCode} (Expected: 200)`);
    console.log(`  - Content-Type: ${r.contentType}`);
    console.log(`  - Stream chunks: ${r.chunksReceived}`);
    console.log(`  - SSE [DONE] signal: ${r.hasDoneSignal}`);
    console.log(`  - Truthful unavailable notice: ${r.isTruthfulFallback ? "YES (Truthful)" : "NO (Live AI Response)"}`);
    console.log(`  - Disguised fallback: ${r.isDisguised ? "YES (DISGUISED ERROR)" : "NO (Truthful)"}`);
  }

  const all200 = results.every((r) => r.statusCode === 200);
  const allStreamed = results.every((r) => r.chunksReceived > 0 && r.hasDoneSignal);
  const noneDisguised = results.every((r) => !r.isDisguised);

  if (all200 && allStreamed && noneDisguised) {
    console.log("\n✅ AI SSE Protocol & Truthful Stream Contract Verified!");
  } else {
    console.error("\n❌ AI Stream verification failed!");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("AI E2E runner crashed:", err);
  process.exit(1);
});
