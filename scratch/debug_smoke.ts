import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.log("[CONSOLE ERROR]:", msg.text());
    }
  });
  page.on("pageerror", (err) => {
    console.log("[PAGEERROR]:", err.message);
  });

  console.log("=== NAVIGATING TO / ===");
  await page.goto("https://www.campusconnectco.in/", { waitUntil: "networkidle" });
  console.log("Title:", await page.title());
  console.log("Student Journey count:", await page.locator("text=Student Discovery Journey").count());
  console.log("Still exploring count:", await page.locator("text=Still exploring?").count());
  console.log("Journey by testid/tag:", await page.locator("[data-journey], text=Explore curated opportunities").count());

  console.log("=== NAVIGATING TO /opportunities ===");
  await page.goto("https://www.campusconnectco.in/opportunities", { waitUntil: "networkidle" });
  console.log("Title:", await page.title());
  console.log("Articles:", await page.locator("article").count());
  console.log("Error boundary count:", await page.locator("text=Something broke").count());
  const bodyText = await page.locator("body").innerText();
  console.log("Body snippet:", bodyText.slice(0, 300));

  await browser.close();
}

main().catch(console.error);
