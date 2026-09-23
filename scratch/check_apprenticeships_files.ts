import fetch from "node-fetch";

async function checkRepoFiles() {
  const headers = { "User-Agent": "CampusConnect-Research/1.0" };
  const res = await fetch("https://api.github.com/repos/francescoronel/apprenticeships/contents", { headers });
  if (res.ok) {
    const files: any = await res.json();
    console.log("Root files:", files.map((f: any) => f.name));
    const dataDir = files.find((f: any) => f.name === "data" || f.name === "src");
    if (dataDir) {
      const dRes = await fetch(dataDir.url, { headers });
      const dFiles: any = await dRes.json();
      console.log(`Files in ${dataDir.name}:`, dFiles.map((f: any) => f.name));
    }
  }
}

checkRepoFiles();
