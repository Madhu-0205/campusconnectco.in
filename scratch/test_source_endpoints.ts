async function testSources() {
  const urls = [
    { name: "SimplifyJobs Summer 2025", url: "https://raw.githubusercontent.com/SimplifyJobs/Summer2025-Internships/dev/.github/scripts/listings.json" },
    { name: "SimplifyJobs Summer 2026", url: "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json" },
    { name: "SimplifyJobs New Grad", url: "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json" },
    { name: "WWR Remote Design RSS", url: "https://weworkremotely.com/categories/remote-design-jobs.rss" },
    { name: "WWR Sales & Marketing RSS", url: "https://weworkremotely.com/categories/remote-sales-and-marketing-jobs.rss" },
    { name: "Devfolio Hackathons", url: "https://api.devfolio.co/api/hackathons?filter=application_open&page=1&limit=20" },
    { name: "RemoteOK Jobs", url: "https://remoteok.com/api" }
  ];

  for (const s of urls) {
    try {
      const res = await fetch(s.url, {
        method: "HEAD",
        headers: { "User-Agent": "CampusConnectCo-OpportunityBot/1.0" }
      });
      console.log(`[${s.name}] Status: ${res.status}`);
    } catch (err: any) {
      console.log(`[${s.name}] Error: ${err.message}`);
    }
  }
}

testSources();
