import fetch from "node-fetch";

async function inspectAnjali() {
  const headers = { "User-Agent": "CampusConnect-Research/1.0" };
  const res = await fetch("https://raw.githubusercontent.com/anjalibhavan/postgrad-scholarships-for-indian-students/master/README.md", { headers });
  console.log("Status:", res.status);
  if (res.ok) {
    const text = await res.text();
    console.log("Length:", text.length);
    console.log("Snippet:\n", text.slice(0, 1500));
  }
}

inspectAnjali();
