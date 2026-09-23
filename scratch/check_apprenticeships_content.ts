import fetch from "node-fetch";

async function checkApprenticeshipContent() {
  const headers = { "User-Agent": "CampusConnect-Research/1.0" };
  const res = await fetch("https://api.github.com/repos/francescoronel/apprenticeships/contents/content/apprenticeships", { headers });
  if (res.ok) {
    const files: any = await res.json();
    console.log("Apprenticeships count:", files.length);
    console.log("Sample files:", files.slice(0, 10).map((f: any) => f.name));
    
    // Inspect the first markdown/json file
    const sample = files[0];
    if (sample) {
      const sRes = await fetch(sample.download_url);
      const sText = await sRes.text();
      console.log(`\nSample ${sample.name} content:\n`, sText);
    }
  }
}

checkApprenticeshipContent();
