async function checkActive() {
  const s2026 = "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json";
  const res = await fetch(s2026);
  const data = await res.json();
  const active = data.filter((i: any) => i.active === true && i.is_visible !== false);
  console.log("Summer 2026 active items:", active.length);
  if (active.length > 0) {
    console.log("Active sample:", JSON.stringify(active[0], null, 2));
  }
}
checkActive();
