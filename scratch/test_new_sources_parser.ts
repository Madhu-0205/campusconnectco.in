import fetch from "node-fetch";

async function testParsers() {
  const headers = { "User-Agent": "CampusConnect-Research/1.0" };

  console.log("=== Testing 1: Apprenticeships ===");
  // Test apprenticeship files
  const sampleApps = ["amazon.md", "accenture.md", "adobe-digital-academy.md", "airbnb.md", "7factor.md"];
  for (const file of sampleApps) {
    const res = await fetch(`https://raw.githubusercontent.com/FrancesCoronel/apprenticeships/main/content/apprenticeships/${file}`, { headers });
    if (res.ok) {
      const text = await res.text();
      const company = text.match(/company:\s*"([^"]+)"/)?.[1] || "";
      const desc = text.match(/description:\s*"([^"]+)"/)?.[1] || "";
      const link = text.match(/link:\s*"([^"]+)"/)?.[1] || "";
      console.log(`[APPRENTICESHIP] ${company}: ${link} (${desc.slice(0, 80)}...)`);
    }
  }

  console.log("\n=== Testing 2: Events (Confs.tech) ===");
  const confRes = await fetch("https://raw.githubusercontent.com/tech-conferences/conference-data/main/conferences/2025/general.json", { headers });
  if (confRes.ok) {
    const confs: any = await confRes.json();
    console.log(`Loaded ${confs.length} events from confs.tech general.json`);
    confs.slice(0, 4).forEach((c: any) => {
      console.log(`[EVENT] ${c.name}: ${c.url} | Date: ${c.startDate} | Online: ${c.online} | City: ${c.city}`);
    });
  }

  console.log("\n=== Testing 3: Research (zapplyjobs) ===");
  const zRes = await fetch("https://raw.githubusercontent.com/zapplyjobs/Research-Internships-for-Undergraduates/main/README.md", { headers });
  if (zRes.ok) {
    const zText = await zRes.text();
    const lines = zText.split("\n");
    const researchItems: any[] = [];
    for (const line of lines) {
      const match = line.match(/\*\s*\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)(?:,\s*(.*))?/);
      if (match) {
        researchItems.push({ title: match[1], url: match[2], note: match[3] || "" });
      }
    }
    console.log(`Parsed ${researchItems.length} research opportunities from zapplyjobs`);
    researchItems.slice(0, 4).forEach((r) => {
      console.log(`[RESEARCH] ${r.title}: ${r.url} (${r.note})`);
    });
  }

  console.log("\n=== Testing 4: Indian Scholarships & Fellowships ===");
  const iRes = await fetch("https://raw.githubusercontent.com/anjalibhavan/postgrad-scholarships-for-indian-students/master/README.md", { headers });
  if (iRes.ok) {
    const iText = await iRes.text();
    const lines = iText.split("\n");
    const indianItems: any[] = [];
    for (const line of lines) {
      const match = line.match(/\d+\.\s*\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)(?::\s*(.*))?/);
      if (match) {
        const title = match[1];
        const url = match[2];
        const isFellowship = /fellowship/i.test(title);
        indianItems.push({ title, url, type: isFellowship ? "FELLOWSHIP" : "SCHOLARSHIP" });
      }
    }
    console.log(`Parsed ${indianItems.length} Indian scholarships/fellowships`);
    indianItems.forEach((it) => {
      console.log(`[${it.type}] ${it.title}: ${it.url}`);
    });
  }

  console.log("\n=== Testing 5: CS Fellowships & Scholarships (monajalal) ===");
  const mRes = await fetch("https://raw.githubusercontent.com/monajalal/Resources-For-CS-Students/master/README.md", { headers });
  if (mRes.ok) {
    const mText = await mRes.text();
    const lines = mText.split("\n");
    const csItems: any[] = [];
    for (const line of lines) {
      const match = line.match(/(?:^|\s)(\d+\.)?\s*([A-Za-z0-9\s\(\)\-\.]+?(?:fellowship|scholarship|grant)[A-Za-z0-9\s\(\)\-\.]*?)\s+(https?:\/\/[^\s]+)/i);
      if (match) {
        const title = match[2].trim();
        const url = match[3].trim();
        const isFellowship = /fellowship/i.test(title);
        csItems.push({ title, url, type: isFellowship ? "FELLOWSHIP" : "SCHOLARSHIP" });
      }
    }
    console.log(`Parsed ${csItems.length} CS fellowships/scholarships`);
    csItems.slice(0, 6).forEach((it) => {
      console.log(`[${it.type}] ${it.title}: ${it.url}`);
    });
  }
}

testParsers().catch(console.error);
