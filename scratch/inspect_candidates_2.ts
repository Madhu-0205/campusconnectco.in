import fetch from "node-fetch";

async function probe() {
  const headers = { "User-Agent": "CampusConnect-Research/1.0" };

  // 1. FrancesCoronel/apprenticeships
  const aRes = await fetch("https://raw.githubusercontent.com/FrancesCoronel/apprenticeships/master/README.md", { headers });
  console.log("FrancesCoronel/apprenticeships:", aRes.status);
  if (aRes.ok) {
    const aText = await aRes.text();
    console.log("Apprenticeships sample:", aText.slice(0, 1000));
  }

  // 2. zapplyjobs snippet under country
  const zRes = await fetch("https://raw.githubusercontent.com/zapplyjobs/Research-Internships-for-Undergraduates/main/README.md", { headers });
  if (zRes.ok) {
    const zText = await zRes.text();
    const indiaIdx = zText.indexOf("India");
    if (indiaIdx !== -1) {
      console.log("\nzapplyjobs India section:", zText.slice(indiaIdx, indiaIdx + 1500));
    } else {
      console.log("\nzapplyjobs US section:", zText.slice(zText.indexOf("USA"), zText.indexOf("USA") + 1500));
    }
  }

  // 3. monajalal Undergraduate section
  const mRes = await fetch("https://raw.githubusercontent.com/monajalal/Resources-For-CS-Students/master/README.md", { headers });
  if (mRes.ok) {
    const mText = await mRes.text();
    const uIdx = mText.indexOf("## Only for Undergraduate Students");
    console.log("\nmonajalal Undergrad:", mText.slice(uIdx, uIdx + 1200));
  }
}

probe().catch(console.error);
