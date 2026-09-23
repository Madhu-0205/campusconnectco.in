import https from "https";
import http from "http";

const URLS = [
  { name: "Amazon Apprenticeship", url: "https://www.amazon.jobs/en/landing_pages/apprentices" },
  { name: "CodeMash", url: "https://codemash.org/" },
  { name: "Fulbright-Nehru", url: "http://www.usief.org.in/Fulbright-Nehru-Fellowships.aspx" },
  { name: "Shopify Dev Intellectsoft", url: "https://weworkremotely.com/remote-jobs/intellectsoft-senior-shopify-full-stack-developer-ir-471" },
  { name: "Invisible Tech AI", url: "https://job-boards.eu.greenhouse.io/agency/jobs/4754242101" },
  { name: "Tencent NLP Research", url: "https://tencent.wd1.myworkdayjobs.com/Tencent_Careers/job/UK-London/NLP-Research-Intern_R106758-1" },
];

async function checkUrl(name: string, urlStr: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(urlStr);
      const mod = parsed.protocol === "https:" ? https : http;
      const req = mod.request(
        parsed,
        {
          method: "HEAD",
          timeout: 10000,
          headers: {
            "User-Agent": "Mozilla/5.0 (CampusConnectCo Verification Bot/1.0)",
          },
        },
        (res) => {
          console.log(`[${name}] Status: ${res.statusCode} | URL: ${urlStr}`);
          resolve();
        }
      );
      req.on("error", (err) => {
        console.log(`[${name}] Error: ${err.message} | URL: ${urlStr}`);
        resolve();
      });
      req.on("timeout", () => {
        req.destroy();
        console.log(`[${name}] Timeout | URL: ${urlStr}`);
        resolve();
      });
      req.end();
    } catch (e: any) {
      console.log(`[${name}] Invalid URL: ${e.message}`);
      resolve();
    }
  });
}

async function main() {
  console.log("=== CHECKING EXTERNAL APPLICATION URLS ===");
  for (const item of URLS) {
    await checkUrl(item.name, item.url);
  }
}

main();
