import fetch from "node-fetch";

async function probeUrl(name: string, url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "CampusConnect-Probe/1.0"
      }
    });
    clearTimeout(timeout);
    const text = await res.text();
    console.log(`[PROBE] ${name}: status=${res.status}, length=${text.length}, type=${res.headers.get("content-type")}`);
    return { ok: res.ok, status: res.status, text: text.slice(0, 500) };
  } catch (err: any) {
    console.log(`[PROBE] ${name}: FAILED - ${err.message}`);
    return { ok: false, error: err.message };
  }
}

async function run() {
  console.log("--- Probing Candidate Sources ---");
  
  // 1. Events / Conferences
  // tech-conferences is a famous open source repo tracking tech conferences
  await probeUrl(
    "confs_tech_events",
    "https://raw.githubusercontent.com/tech-conferences/conference-data/main/conferences/2026/conferences.json"
  );
  await probeUrl(
    "confs_tech_events_2025",
    "https://raw.githubusercontent.com/tech-conferences/conference-data/main/conferences/2025/conferences.json"
  );
  await probeUrl(
    "confs_tech_events_index",
    "https://api.github.com/repos/tech-conferences/conference-data/contents/conferences"
  );

  // 2. Apprenticeships
  // Tech apprenticeships list on GitHub
  await probeUrl(
    "tech_apprenticeships_gh",
    "https://raw.githubusercontent.com/cmckenzie567/tech-apprenticeships/main/README.md"
  );
  await probeUrl(
    "apprenticeships_list_2",
    "https://raw.githubusercontent.com/george-stepanov/tech-apprenticeships/main/README.md"
  );

  // 3. Fellowships
  // Curated list of fellowships
  await probeUrl(
    "fellowships_gh_1",
    "https://raw.githubusercontent.com/pashamakh/tech-fellowships/main/README.md"
  );
  await probeUrl(
    "fellowships_mlh",
    "https://fellowship.mlh.io/"
  );
  await probeUrl(
    "outreachy_feed",
    "https://www.outreachy.org/api/v1/internships/"
  );

  // 4. Scholarships
  await probeUrl(
    "scholarships_gh_1",
    "https://raw.githubusercontent.com/taniarascia/scholarships/master/README.md"
  );
  await probeUrl(
    "scholarships_gh_women",
    "https://raw.githubusercontent.com/ladiesintraining/tech-scholarships/master/README.md"
  );

  // 5. Research Opportunities
  await probeUrl(
    "cs_research_mentorship",
    "https://raw.githubusercontent.com/csresearch/summer-internships/main/README.md"
  );
  await probeUrl(
    "undergrad_research_gh",
    "https://raw.githubusercontent.com/c4cs/undergrad-research-guide/master/README.md"
  );
}

run();
