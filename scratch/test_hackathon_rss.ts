async function testHackathonRss() {
  const urls = [
    "https://devpost.com/hackathons.rss",
    "https://mlh.io/seasons/2026/events.rss",
    "https://mlh.io/feed"
  ];
  for (const u of urls) {
    try {
      const res = await fetch(u, { method: "HEAD" });
      console.log(`[${u}] Status: ${res.status}`);
    } catch (e: any) {
      console.log(`[${u}] Error: ${e.message}`);
    }
  }
}
testHackathonRss();
