import fetch from "node-fetch";

async function printReadme() {
  const headers = { "User-Agent": "CampusConnect-Research/1.0" };
  const res = await fetch("https://raw.githubusercontent.com/FrancesCoronel/apprenticeships/master/README.md", { headers });
  const text = await res.text();
  console.log(text);
}

printReadme();
