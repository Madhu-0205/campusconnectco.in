async function testDevToListings() {
  try {
    const res = await fetch("https://dev.to/api/listings?per_page=5", {
      headers: { "User-Agent": "CampusConnectCo-Bot/1.0" }
    });
    console.log("Dev.to status:", res.status);
    const data = await res.json();
    console.log("Dev.to items count:", data?.length);
    if (data?.length > 0) {
      console.log("Dev.to sample:", JSON.stringify(data[0], null, 2));
    }
  } catch (err: any) {
    console.error("Dev.to error:", err.message);
  }
}
testDevToListings();
