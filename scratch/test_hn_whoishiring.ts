async function testHnWhoIsHiring() {
  const url = "https://hnrss.org/whoishiring/jobs";
  try {
    const res = await fetch(url);
    console.log("hn whoishiring status:", res.status);
    const text = await res.text();
    console.log("Length:", text.length);
    console.log("Contains items:", text.includes("<item>"));
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}
testHnWhoIsHiring();
