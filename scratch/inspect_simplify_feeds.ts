async function inspectFeeds() {
  const s2026 = "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json";
  const newGrad = "https://raw.githubusercontent.com/SimplifyJobs/New-Grad-Positions/dev/.github/scripts/listings.json";

  try {
    const res2026 = await fetch(s2026);
    const data2026 = await res2026.json();
    console.log("Summer 2026 count:", data2026.length);
    console.log("Summer 2026 sample:", JSON.stringify(data2026[0], null, 2));

    const resGrad = await fetch(newGrad);
    const dataGrad = await resGrad.json();
    console.log("New Grad count:", dataGrad.length);
    console.log("New Grad sample:", JSON.stringify(dataGrad[0], null, 2));
  } catch (err: any) {
    console.error("Error inspecting feeds:", err.message);
  }
}

inspectFeeds();
