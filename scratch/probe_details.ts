import fetch from "node-fetch";

async function probe() {
  const headers = { "User-Agent": "CampusConnect-Research/1.0" };

  // 1. Inspect zapplyjobs markdown structure
  const zRes = await fetch("https://raw.githubusercontent.com/zapplyjobs/Research-Internships-for-Undergraduates/main/README.md", { headers });
  const zText = await zRes.text();
  console.log("--- zapplyjobs headings ---");
  const zHeadings = zText.match(/^#+\s+.+$/gm)?.slice(0, 20);
  console.log(zHeadings);
  console.log("\nSample zapplyjobs table rows:");
  const tableRows = zText.split("\n").filter(l => l.includes("|") && !l.includes("---")).slice(0, 10);
  console.log(tableRows);

  // 2. Inspect monajalal headings
  const mRes = await fetch("https://raw.githubusercontent.com/monajalal/Resources-For-CS-Students/master/README.md", { headers });
  const mText = await mRes.text();
  console.log("\n--- monajalal headings ---");
  const mHeadings = mText.match(/^#+\s+.+$/gm);
  console.log(mHeadings);

  // 3. Search for tech apprenticeships repositories
  const aRes = await fetch("https://api.github.com/search/code?q=path:README.md+filename:README.md+%22Tech+Apprenticeships%22+in:file", { headers });
  if (aRes.ok) {
    const aData: any = await aRes.json();
    console.log("\nApprenticeships code search matches:", aData.total_count);
    aData.items?.slice(0, 5).forEach((item: any) => {
      console.log(`- ${item.repository.full_name}: ${item.html_url}`);
    });
  } else {
    console.log("Apprenticeships code search failed:", aRes.status);
    // Try repo search
    const rRes = await fetch("https://api.github.com/search/repositories?q=tech+apprenticeships+sort:updated", { headers });
    const rData: any = await rRes.json();
    console.log("Apprenticeships repo search:", rData.items?.slice(0, 5).map((r: any) => r.full_name));
  }
}

probe().catch(console.error);
