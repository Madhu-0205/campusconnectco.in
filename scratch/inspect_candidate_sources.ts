import fetch from "node-fetch";

async function check() {
  const headers = { "User-Agent": "CampusConnect-Research/1.0" };

  // Check zapplyjobs research internships
  const res1 = await fetch("https://raw.githubusercontent.com/zapplyjobs/Research-Internships-for-Undergraduates/main/README.md", { headers });
  console.log("zapplyjobs/Research-Internships:", res1.status, res1.ok);
  if (res1.ok) {
    const text = await res1.text();
    console.log("Snippet:", text.slice(0, 600));
  }

  // Check monajalal scholarships / fellowships
  const res2 = await fetch("https://raw.githubusercontent.com/monajalal/Resources-For-CS-Students/master/README.md", { headers });
  console.log("monajalal/Resources-For-CS-Students:", res2.status, res2.ok);
  if (res2.ok) {
    const text = await res2.text();
    console.log("Snippet:", text.slice(0, 600));
  }

  // Check tech conferences
  const res3 = await fetch("https://api.github.com/repos/tech-conferences/conference-data/contents/conferences", { headers });
  if (res3.ok) {
    const years: any = await res3.json();
    console.log("Years in conference-data:", years.map((y: any) => y.name));
    const year2025 = years.find((y: any) => y.name === "2025" || y.name === "2026") || years[years.length - 1];
    if (year2025) {
      const yearContents = await fetch(year2025.url, { headers });
      const files: any = await yearContents.json();
      console.log(`Files in ${year2025.name}:`, files.slice(0, 10).map((f: any) => f.name));
      const firstFile = files[0];
      if (firstFile?.download_url) {
        const dRes = await fetch(firstFile.download_url);
        const data = await dRes.json();
        console.log(`Sample event from ${firstFile.name}:`, JSON.stringify(data[0], null, 2));
      }
    }
  }
}

check();
