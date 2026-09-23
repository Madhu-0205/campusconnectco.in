import fetch from "node-fetch";

async function main() {
  const headers = {
    "User-Agent": "CampusConnect-Research/1.0"
  };

  // 1. Check conference-data files
  const confRes = await fetch("https://api.github.com/repos/tech-conferences/conference-data/contents/conferences", { headers });
  if (confRes.ok) {
    const data: any = await confRes.json();
    console.log("Conference years available:", data.map((d: any) => d.name));
    
    // Check 2024 or latest year
    const year = data[data.length - 1]?.name;
    if (year) {
      const yearRes = await fetch(`https://api.github.com/repos/tech-conferences/conference-data/contents/conferences/${year}`, { headers });
      if (yearRes.ok) {
        const yearFiles: any = await yearRes.json();
        console.log(`Files in ${year}:`, yearFiles.slice(0, 5).map((f: any) => f.name));
      }
    }
  }

  // 2. Search GitHub for tech fellowships repositories
  const felRes = await fetch("https://api.github.com/search/repositories?q=fellowships+students+in:name,description&sort=stars&order=desc", { headers });
  if (felRes.ok) {
    const felData: any = await felRes.json();
    console.log("\nTop Fellowship Repos:");
    felData.items?.slice(0, 5).forEach((r: any) => {
      console.log(`- ${r.full_name}: ${r.description} (${r.html_url})`);
    });
  }

  // 3. Search GitHub for scholarships
  const schRes = await fetch("https://api.github.com/search/repositories?q=scholarships+students+in:name,description&sort=stars&order=desc", { headers });
  if (schRes.ok) {
    const schData: any = await schRes.json();
    console.log("\nTop Scholarship Repos:");
    schData.items?.slice(0, 5).forEach((r: any) => {
      console.log(`- ${r.full_name}: ${r.description} (${r.html_url})`);
    });
  }

  // 4. Search GitHub for tech apprenticeships
  const appRes = await fetch("https://api.github.com/search/repositories?q=apprenticeship+software+in:name,description&sort=stars&order=desc", { headers });
  if (appRes.ok) {
    const appData: any = await appRes.json();
    console.log("\nTop Apprenticeship Repos:");
    appData.items?.slice(0, 5).forEach((r: any) => {
      console.log(`- ${r.full_name}: ${r.description} (${r.html_url})`);
    });
  }

  // 5. Search GitHub for research internships
  const resRes = await fetch("https://api.github.com/search/repositories?q=research+internships+undergrad+in:name,description&sort=stars&order=desc", { headers });
  if (resRes.ok) {
    const resData: any = await resRes.json();
    console.log("\nTop Research Repos:");
    resData.items?.slice(0, 5).forEach((r: any) => {
      console.log(`- ${r.full_name}: ${r.description} (${r.html_url})`);
    });
  }
}

main().catch(console.error);
