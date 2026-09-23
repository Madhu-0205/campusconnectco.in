import fetch from "node-fetch";

async function probe() {
  const headers = { "User-Agent": "CampusConnect-Research/1.0" };

  // 1. zapplyjobs files
  const zRes = await fetch("https://api.github.com/repos/zapplyjobs/Research-Internships-for-Undergraduates/contents", { headers });
  if (zRes.ok) {
    const zFiles: any = await zRes.json();
    console.log("zapplyjobs files:", zFiles.map((f: any) => f.name));
    // Check if there are markdown files for countries
    const countries = zFiles.filter((f: any) => f.name.endsWith(".md") || f.type === "dir");
    console.log("Country dirs/files:", countries.map((c: any) => c.name));
  }

  // 2. monajalal full sections on fellowships and scholarships
  const mRes = await fetch("https://raw.githubusercontent.com/monajalal/Resources-For-CS-Students/master/README.md", { headers });
  if (mRes.ok) {
    const mText = await mRes.text();
    // Look for lines containing "fellowship" or "scholarship" and links
    const lines = mText.split("\n");
    const felLines = lines.filter(l => /fellowship/i.test(l) && /https?:\/\//i.test(l));
    console.log(`\nmonajalal Fellowship lines (${felLines.length}):`, felLines.slice(0, 8));
    const schLines = lines.filter(l => /scholarship/i.test(l) && /https?:\/\//i.test(l));
    console.log(`\nmonajalal Scholarship lines (${schLines.length}):`, schLines.slice(0, 8));
  }

  // 3. Search for open datasets of student scholarships and fellowships
  const fSearch = await fetch("https://api.github.com/search/repositories?q=open-source+fellowships+or+scholarships&sort=stars", { headers });
  if (fSearch.ok) {
    const fData: any = await fSearch.json();
    console.log("\nTop Fellowship/Scholarship Repos:", fData.items?.slice(0, 5).map((r: any) => `${r.full_name}: ${r.html_url}`));
  }
}

probe().catch(console.error);
