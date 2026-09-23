import fetch from "node-fetch";

async function inspectZapply() {
  const headers = { "User-Agent": "CampusConnect-Research/1.0" };
  const res = await fetch("https://raw.githubusercontent.com/zapplyjobs/Research-Internships-for-Undergraduates/main/README.md", { headers });
  const text = await res.text();
  console.log("Total length:", text.length);
  const lines = text.split("\n");
  console.log("Total lines:", lines.length);
  // Find lines with markdown links e.g. [Title](URL)
  const linkLines = lines.filter(l => l.trim().startsWith("- [") || l.trim().startsWith("* [") || /^\d+\.\s+\[/.test(l.trim()));
  console.log("Link list items count:", linkLines.length);
  console.log("Sample link lines:\n", linkLines.slice(0, 15).join("\n"));
}

inspectZapply();
