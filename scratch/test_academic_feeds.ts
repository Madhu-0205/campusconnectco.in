async function testAcademicFeeds() {
  const feeds = [
    { name: "CERN RSS", url: "https://careers.smartrecruiters.com/CERN/api/more?page=1" },
    { name: "Nature Careers RSS", url: "https://www.nature.com/naturecareers.rss" },
    { name: "Jobs.ac.uk RSS PhD / Research", url: "https://www.jobs.ac.uk/jobs/phd.rss" },
    { name: "ScholarshipPos RSS", url: "https://scholarship-positions.com/feed/" },
    { name: "Internshala RSS / feed", url: "https://internshala.com" },
    { name: "Wellfound / AngelList Jobs RSS", url: "https://wellfound.com" }
  ];

  for (const f of feeds) {
    try {
      const res = await fetch(f.url, {
        method: "HEAD",
        headers: { "User-Agent": "Mozilla/5.0 (CampusConnectCo-Bot)" }
      });
      console.log(`[${f.name}] Status: ${res.status}`);
    } catch (e: any) {
      console.log(`[${f.name}] Failed: ${e.message}`);
    }
  }
}

testAcademicFeeds();
