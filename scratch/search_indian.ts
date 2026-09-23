import fetch from "node-fetch";

async function searchIndian() {
  const headers = { "User-Agent": "CampusConnect-Research/1.0" };
  const r1 = await fetch("https://api.github.com/search/repositories?q=indian+scholarships+in:name,description", { headers });
  const d1: any = await r1.json();
  console.log("Indian scholarships repos:", d1.items?.slice(0, 5).map((r: any) => `${r.full_name}: ${r.html_url}`));

  const r2 = await fetch("https://api.github.com/search/repositories?q=fellowships+india+in:name,description", { headers });
  const d2: any = await r2.json();
  console.log("Indian fellowships repos:", d2.items?.slice(0, 5).map((r: any) => `${r.full_name}: ${r.html_url}`));
}

searchIndian();
