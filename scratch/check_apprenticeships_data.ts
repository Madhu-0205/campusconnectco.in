import fetch from "node-fetch";

async function checkData() {
  const headers = { "User-Agent": "CampusConnect-Research/1.0" };
  const res = await fetch("https://api.github.com/repos/francescoronel/apprenticeships/contents/src/data", { headers });
  if (res.ok) {
    const files: any = await res.json();
    console.log("Files in src/data:", files.map((f: any) => f.name));
    for (const f of files) {
      if (f.name.endsWith(".json") || f.name.endsWith(".ts")) {
        console.log(`Checking ${f.name} (${f.download_url})...`);
        const fRes = await fetch(f.download_url);
        const text = await fRes.text();
        console.log(`Snippet of ${f.name}:`, text.slice(0, 500));
      }
    }
  }

  // Also check content
  const cRes = await fetch("https://api.github.com/repos/francescoronel/apprenticeships/contents/content", { headers });
  if (cRes.ok) {
    const cFiles: any = await cRes.json();
    console.log("Files in content:", cFiles.map((f: any) => f.name));
  }
}

checkData();
