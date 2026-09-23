async function testArxiv() {
  const url = "http://export.arxiv.org/api/query?search_query=cat:cs.AI&start=0&max_results=5";
  const res = await fetch(url);
  console.log("Arxiv status:", res.status);
  const text = await res.text();
  console.log("Length:", text.length);
  console.log("Contains entry:", text.includes("<entry>"));
}
testArxiv();
