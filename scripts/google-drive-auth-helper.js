#!/usr/bin/env node
/**
 * CampusConnect — Google Drive OAuth Helper (Local Setup Only)
 *
 * This script runs strictly on your local machine to obtain your one-time
 * GOOGLE_DRIVE_REFRESH_TOKEN for GitHub Secrets.
 *
 * It uses the narrowest least-privilege OAuth scope:
 *   'https://www.googleapis.com/auth/drive.file'
 *
 * Usage:
 *   node scripts/google-drive-auth-helper.js
 */

const http = require("http");
const readline = require("readline");

const SCOPE = "https://www.googleapis.com/auth/drive.file";
const PORT = 8085;
const REDIRECT_URI = `http://localhost:${PORT}`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function main() {
  console.log("=================================================================");
  console.log("       CampusConnect — Google Drive OAuth Setup Helper           ");
  console.log("=================================================================");
  console.log("This tool helps you generate a secure GOOGLE_DRIVE_REFRESH_TOKEN.");
  console.log("Least-Privilege Scope: https://www.googleapis.com/auth/drive.file");
  console.log("(Access restricted ONLY to files created by the backup app)");
  console.log("-----------------------------------------------------------------\n");

  const clientId = (await question("Enter your Google Client ID: ")).trim();
  const clientSecret = (await question("Enter your Google Client Secret: ")).trim();

  if (!clientId || !clientSecret) {
    console.error("ERROR: Client ID and Client Secret are required.");
    process.exit(1);
  }

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", SCOPE);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");

  console.log("\n1. Start a local temporary callback listener...");

  const server = http.createServer(async (req, res) => {
    const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
    const code = reqUrl.searchParams.get("code");
    const error = reqUrl.searchParams.get("error");

    if (error) {
      res.writeHead(400, { "Content-Type": "text/html" });
      res.end(`<h1>Authentication Failed</h1><p>${error}</p>`);
      console.error(`\nAuthentication failed with error: ${error}`);
      server.close();
      process.exit(1);
    }

    if (code) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<h1>Authentication Successful!</h1><p>You may close this tab and return to your terminal.</p>`);

      try {
        console.log("\n2. Exchanging authorization code for Refresh Token...");
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code: code,
            grant_type: "authorization_code",
            redirect_uri: REDIRECT_URI,
          }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok) {
          console.error("Token exchange failed:", tokenData);
          server.close();
          process.exit(1);
        }

        console.log("\n=================================================================");
        console.log("🎉 SUCCESS! Google Drive Refresh Token Obtained");
        console.log("=================================================================");
        console.log("\nAdd the following secret to GitHub Repository Settings:");
        console.log("Secret Name: GOOGLE_DRIVE_REFRESH_TOKEN");
        console.log("Value:");
        console.log(tokenData.refresh_token);
        console.log("\n(Never share or commit this token to Git)\n");
      } catch (err) {
        console.error("Error exchanging token:", err.message);
      } finally {
        server.close();
        rl.close();
        process.exit(0);
      }
    }
  });

  server.listen(PORT, () => {
    console.log(`\n2. Open the following URL in your web browser:\n`);
    console.log(`👉  ${authUrl.toString()}\n`);
    console.log(`Waiting for Google authentication callback on ${REDIRECT_URI}...\n`);
  });
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
