import https from "https";

function fetchPage(urlStr: string): Promise<{ status: number; text: string }> {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(urlStr);
      const req = https.get(
        parsed,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => {
            if (data.length < 50000) data += chunk;
          });
          res.on("end", () => {
            resolve({ status: res.statusCode || 0, text: data });
          });
        }
      );
      req.on("error", (e) => resolve({ status: 500, text: e.message }));
      req.setTimeout(10000, () => {
        req.destroy();
        resolve({ status: 408, text: "Timeout" });
      });
    } catch (e: any) {
      resolve({ status: 400, text: e.message });
    }
  });
}

async function main() {
  console.log("Checking WeWorkRemotely Intellectsoft page content...");
  const wwr = await fetchPage("https://weworkremotely.com/remote-jobs/intellectsoft-senior-shopify-full-stack-developer-ir-471");
  console.log("WWR Status:", wwr.status);
  const isExpired = wwr.text.toLowerCase().includes("this job is no longer available") ||
                    wwr.text.toLowerCase().includes("job has expired") ||
                    wwr.text.toLowerCase().includes("listing is closed") ||
                    wwr.text.toLowerCase().includes("position has been filled");
  console.log("WWR Expired text present:", isExpired);

  console.log("\nChecking Greenhouse Agency page content...");
  const gh = await fetchPage("https://job-boards.eu.greenhouse.io/agency/jobs/4754242101");
  console.log("Greenhouse Status:", gh.status);
  const isGhClosed = gh.text.toLowerCase().includes("no longer accepting applications") ||
                     gh.text.toLowerCase().includes("job is no longer available");
  console.log("Greenhouse Closed text present:", isGhClosed);

  console.log("\nChecking Amazon Apprenticeships page content...");
  const az = await fetchPage("https://www.amazon.jobs/en/landing_pages/apprentices");
  console.log("Amazon Apprenticeships Status:", az.status);
}

main();
