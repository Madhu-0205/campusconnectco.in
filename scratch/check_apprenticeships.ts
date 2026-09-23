import fetch from "node-fetch";

async function checkApprenticeships() {
  const headers = { "User-Agent": "CampusConnect-Research/1.0" };
  const res = await fetch("https://raw.githubusercontent.com/FrancesCoronel/apprenticeships/master/README.md", { headers });
  const text = await res.text();
  console.log("Length:", text.length);
  // Find tables or list of companies
  const lines = text.split("\n");
  const tables = lines.filter(l => l.startsWith("|") && !l.includes("---"));
  console.log("Table lines count:", tables.length);
  console.log("Sample table lines:\n", tables.slice(0, 15).join("\n"));
}

checkApprenticeships();
