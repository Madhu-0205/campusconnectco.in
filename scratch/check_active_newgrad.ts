async function checkNewGradActive() {
  const url = "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json";
  const res = await fetch(url);
  const data = await res.json();
  const active = data.filter((i: any) => i.active === true && i.is_visible !== false);
  console.log("New Grad active items:", active.length);
  if (active.length > 0) {
    console.log("Active New Grad sample:", JSON.stringify(active[0], null, 2));
  }
}
checkNewGradActive();
