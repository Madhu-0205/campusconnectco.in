async function testRssFetch() {
  const url = "https://www.jobs.ac.uk/jobs/phd.rss";
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  console.log("Jobs.ac.uk status:", res.status);
  const text = await res.text();
  console.log("Length:", text.length);
  console.log("First 300 chars:", text.slice(0, 300));
}
testRssFetch();
