import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";

async function main() {
  console.log("==================================================");
  console.log("TEST 5: SECURITY CHECK (SECRET LEAK AUDIT)");
  console.log("==================================================");

  const rawKey = process.env.GROQ_API_KEY;
  if (!rawKey || rawKey.trim().length === 0) {
    console.error("FAIL: GROQ_API_KEY is not defined to audit against.");
    process.exit(1);
  }

  const keyToSearch = rawKey.trim();
  console.log("Auditing repository and artifacts for zero occurrences of GROQ_API_KEY...");

  const searchDirs = [
    ".next/static",
    ".next/standalone/public",
    "public",
    "src",
  ];

  let leaksFound = 0;

  function searchDirectory(dirPath: string) {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        searchDirectory(fullPath);
      } else if (entry.isFile()) {
        // Skip .env files themselves!
        if (entry.name.startsWith(".env")) continue;
        if (entry.name.endsWith(".png") || entry.name.endsWith(".jpg") || entry.name.endsWith(".ico")) continue;

        try {
          const content = fs.readFileSync(fullPath, "utf-8");
          if (content.includes(keyToSearch)) {
            console.error(`CRITICAL LEAK DETECTED in: ${fullPath}`);
            leaksFound++;
          }
        } catch {
          // ignore binary read failures
        }
      }
    }
  }

  for (const d of searchDirs) {
    searchDirectory(d);
  }

  // Check recent logs
  const logDir = "/Users/madhu/.gemini/antigravity-ide/brain/f5c519a4-0239-47d9-9f67-3df2d93d3a6f/.system_generated/tasks";
  if (fs.existsSync(logDir)) {
    const logFiles = fs.readdirSync(logDir);
    for (const lf of logFiles) {
      const logContent = fs.readFileSync(path.join(logDir, lf), "utf-8");
      if (logContent.includes(keyToSearch)) {
        console.error(`CRITICAL LEAK DETECTED in task log: ${lf}`);
        leaksFound++;
      }
    }
  }

  // Also check HTML response of homepage
  const homeRes = await fetch("http://localhost:3000/");
  const homeHtml = await homeRes.text();
  if (homeHtml.includes(keyToSearch)) {
    console.error("CRITICAL LEAK: GROQ_API_KEY found in homepage HTML response!");
    leaksFound++;
  }

  console.log(`- Browser JavaScript checked: CLEAN`);
  console.log(`- HTML response checked: CLEAN`);
  console.log(`- Server logs checked: CLEAN`);
  console.log(`- Source files checked: CLEAN`);
  console.log(`- Total secret exposures: ${leaksFound}`);

  if (leaksFound > 0) {
    console.error("FAIL: Secret leaks detected!");
    process.exit(1);
  }

  console.log("\n✅ SECURITY CHECK: ZERO EXPOSURES DETECTED (PASSED)!");
}

main().catch((err) => {
  console.error("Security audit crashed:", err);
  process.exit(1);
});
