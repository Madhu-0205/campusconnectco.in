async function checkMlhRaw() {
  const res = await fetch("https://mlh.io/seasons/2026/events.rss");
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Length:", text.length);
  console.log("Snippet:", text.slice(0, 300));
}
checkMlhRaw();
