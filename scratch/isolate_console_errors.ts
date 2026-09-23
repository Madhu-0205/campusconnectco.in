import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const urls = [
    "https://www.campusconnectco.in/",
    "https://www.campusconnectco.in/opportunities",
    "https://www.campusconnectco.in/opportunities?type=internship",
    "https://www.campusconnectco.in/opportunities?type=gig",
    "https://www.campusconnectco.in/opportunities?q=Engineer",
    "https://www.campusconnectco.in/opportunities?type=internship&category=engineering",
    "https://www.campusconnectco.in/internships/bangalore",
  ];

  for (const url of urls) {
    const page = await browser.newPage();
    const errs: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") errs.push(msg.text());
    });
    page.on("pageerror", err => errs.push(err.message));

    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForTimeout(1000);

    const reactErrors = errs.filter(e => e.includes("441"));
    console.log(`URL: ${url}`);
    console.log(`  React 441 errors: ${reactErrors.length}`);
    if (errs.length > 0) {
      console.log(`  All console errors (${errs.length}):`, errs);
    }
    await page.close();
  }

  await browser.close();
}

main().catch(console.error);
