async function testHnRss() {
  const url = "https://hnrss.org/jobs";
  try {
    const res = await fetch(url);
    console.log("hnrss status:", res.status);
    const text = await res.text();
    console.log("hnrss length:", text.length);
    console.log("Contains items:", text.includes("<item>"));
    console.log("First 400 chars:", text.slice(0, 400));
  } catch (err: any) {
    console.error("hnrss error:", err.message);
  }
}
testHnRss();
