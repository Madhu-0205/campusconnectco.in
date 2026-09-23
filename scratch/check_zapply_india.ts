import fetch from "node-fetch";

async function checkIndia() {
  const headers = { "User-Agent": "CampusConnect-Research/1.0" };
  const res = await fetch("https://raw.githubusercontent.com/zapplyjobs/Research-Internships-for-Undergraduates/main/README.md", { headers });
  const text = await res.text();
  const lines = text.split("\n");
  const indiaIdx = lines.findIndex(l => l.includes("India"));
  console.log("India section lines:\n", lines.slice(indiaIdx, indiaIdx + 30).join("\n"));
}

checkIndia();
