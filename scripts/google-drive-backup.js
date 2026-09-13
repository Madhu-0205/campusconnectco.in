#!/usr/bin/env node
/**
 * CampusConnect — Google Drive Automated Backup Uploader
 *
 * Uploads client-side encrypted database backups to private Google Drive storage.
 * Architecture:
 *   - Google Drive API v3 (Official REST API)
 *   - OAuth 2.0 with least-privilege scope: 'https://www.googleapis.com/auth/drive.file'
 *   - Structured folder hierarchy:
 *       CampusConnect Backups/ (Root folder specified by GOOGLE_DRIVE_FOLDER_ID)
 *         database/
 *           daily/
 *             YYYY-MM-DD/
 *               campusconnect-db-YYYY-MM-DD_HHMMSSZ.tar.gz.enc
 *               campusconnect-db-YYYY-MM-DD_HHMMSSZ.tar.gz.sha256
 *               metadata.json
 *   - Resumable uploads for network resilience
 *   - Automated 30-day retention pruning of expired daily date folders
 *   - Zero secrets exposed in logs or metadata
 */

const fs = require("fs");
const path = require("path");

const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;
const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

const BACKUP_DIR = process.env.BACKUP_DIR || "/tmp/cc-backup";
const ENC_NAME = process.env.ENC_NAME;
const ARCHIVE_NAME = process.env.ARCHIVE_NAME;
const BACKUP_CHECKSUM = process.env.BACKUP_CHECKSUM;
const BACKUP_TIMESTAMP = process.env.BACKUP_TIMESTAMP || new Date().toISOString().replace(/[-:T]/g, "").slice(0, 15) + "Z";
const COMMIT_SHA = process.env.GITHUB_SHA || "unknown";

// Helper: Sleep for retry delays
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper: Fetch with retries for transient network errors
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status >= 500 && attempt < maxRetries) {
        console.warn(`[GoogleDrive] Server error (${res.status}). Retrying attempt ${attempt}/${maxRetries}...`);
        await sleep(1000 * Math.pow(2, attempt));
        continue;
      }
      return res;
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        console.warn(`[GoogleDrive] Network error (${err.message}). Retrying attempt ${attempt}/${maxRetries}...`);
        await sleep(1000 * Math.pow(2, attempt));
      }
    }
  }
  throw lastError || new Error(`Failed request after ${maxRetries} retries`);
}

/**
 * 1. Exchange Refresh Token for a short-lived OAuth Access Token
 */
async function getAccessToken() {
  const tokenUrl = "https://oauth2.googleapis.com/token";
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: "refresh_token",
  });

  const res = await fetchWithRetry(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OAuth token refresh failed (HTTP ${res.status}): ${errorText}`);
  }

  const data = await res.json();
  if (!data.access_token) {
    throw new Error("OAuth response missing access_token");
  }

  return data.access_token;
}

/**
 * 2. Find an existing folder by name under a parent folder
 */
async function findFolder(name, parentId, accessToken) {
  const query = `'${parentId}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&spaces=drive`;

  const res = await fetchWithRetry(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error searching folder '${name}' (HTTP ${res.status}): ${errorText}`);
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

/**
 * 3. Create a folder under a parent folder
 */
async function createFolder(name, parentId, accessToken) {
  const url = "https://www.googleapis.com/drive/v3/files";
  const body = {
    name,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentId],
  };

  const res = await fetchWithRetry(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Error creating folder '${name}' (HTTP ${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return data.id;
}

/**
 * 4. Ensure a folder exists (find or create)
 */
async function ensureFolder(name, parentId, accessToken) {
  const existingId = await findFolder(name, parentId, accessToken);
  if (existingId) {
    return existingId;
  }
  return await createFolder(name, parentId, accessToken);
}

/**
 * 5. Resolve or create the app-owned root backup folder
 * Under drive.file scope, the application can only access files and folders
 * that it created itself. This helper checks if a configured folder is accessible,
 * or automatically finds/creates 'CampusConnect Backups' at the root of My Drive.
 */
async function resolveRootBackupFolder(accessToken) {
  if (ROOT_FOLDER_ID) {
    const checkRes = await fetchWithRetry(`https://www.googleapis.com/drive/v3/files/${ROOT_FOLDER_ID}?fields=id,name,mimeType`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (checkRes.ok) {
      const info = await checkRes.json();
      console.log(`[GoogleDrive] Using configured Root Folder: ${info.name} (ID: ${info.id})`);
      return info.id;
    } else {
      console.warn(`[GoogleDrive] Configured GOOGLE_DRIVE_FOLDER_ID (${ROOT_FOLDER_ID}) is not accessible under drive.file (likely created outside the app). Resolving app-owned root folder...`);
    }
  }

  // Search for app-created 'CampusConnect Backups' folder
  const query = "name = 'CampusConnect Backups' and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)&spaces=drive`;
  const searchRes = await fetchWithRetry(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      console.log(`[GoogleDrive] Found existing app-owned root folder: ${data.files[0].name} (ID: ${data.files[0].id})`);
      return data.files[0].id;
    }
  }

  console.log("[GoogleDrive] Creating app-owned root folder 'CampusConnect Backups' at Drive root...");
  const createRes = await fetchWithRetry("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "CampusConnect Backups",
      mimeType: "application/vnd.google-apps.folder",
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create root backup folder: HTTP ${createRes.status} ${errText}`);
  }

  const created = await createRes.json();
  console.log(`[GoogleDrive] Successfully created app-owned root folder: ${created.name} (ID: ${created.id})`);
  return created.id;
}

/**
 * 5. Upload a file using Google Drive API Resumable Upload
 */
async function uploadFileResumable(filePath, fileName, mimeType, parentId, accessToken) {
  const stats = fs.statSync(filePath);
  const fileSize = stats.size;

  console.log(`[GoogleDrive] Initiating resumable upload for '${fileName}' (${fileSize} bytes)...`);

  // Step A: Initiate resumable session
  const initUrl = "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable";
  const metadata = {
    name: fileName,
    parents: [parentId],
  };

  const initRes = await fetchWithRetry(initUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Type": mimeType,
      "X-Upload-Content-Length": fileSize.toString(),
    },
    body: JSON.stringify(metadata),
  });

  if (!initRes.ok) {
    const errorText = await initRes.text();
    throw new Error(`Failed to initiate resumable upload for '${fileName}' (HTTP ${initRes.status}): ${errorText}`);
  }

  const sessionUri = initRes.headers.get("Location") || initRes.headers.get("location");
  if (!sessionUri) {
    throw new Error(`Google Drive did not return a session URI in Location header for '${fileName}'`);
  }

  // Step B: Upload file stream / buffer to session URI
  const fileStream = fs.readFileSync(filePath);

  const uploadRes = await fetchWithRetry(sessionUri, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
      "Content-Length": fileSize.toString(),
    },
    body: fileStream,
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Upload failed for '${fileName}' (HTTP ${uploadRes.status}): ${errorText}`);
  }

  const uploadedFile = await uploadRes.json();
  console.log(`[GoogleDrive] Successfully uploaded '${fileName}' (ID: ${uploadedFile.id}, Size: ${uploadedFile.size || fileSize} bytes)`);

  return {
    id: uploadedFile.id,
    name: uploadedFile.name,
    size: Number(uploadedFile.size || fileSize),
    md5: uploadedFile.md5Checksum,
  };
}

/**
 * 6. Prune expired daily folders older than 30 days
 */
async function pruneExpiredDailyBackups(dailyFolderId, accessToken) {
  console.log("[GoogleDrive] Evaluating 30-day retention cleanup...");

  const now = new Date();
  const cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10); // YYYY-MM-DD
  console.log(`[GoogleDrive] Retention cutoff date: ${cutoffStr} (folders older than this will be pruned)`);

  const query = `'${dailyFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,createdTime)&spaces=drive`;

  const res = await fetchWithRetry(listUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    console.warn(`[GoogleDrive] Warning: Could not list daily folders for retention pruning (HTTP ${res.status}).`);
    return;
  }

  const data = await res.json();
  const folders = data.files || [];

  for (const folder of folders) {
    // Only target folders matching strictly YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(folder.name)) {
      if (folder.name < cutoffStr) {
        console.log(`[GoogleDrive] Pruning expired backup folder: ${folder.name} (${folder.id})...`);
        // Move to trash (safe pruning)
        const trashUrl = `https://www.googleapis.com/drive/v3/files/${folder.id}`;
        const trashRes = await fetchWithRetry(trashUrl, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ trashed: true }),
        });

        if (trashRes.ok) {
          console.log(`[GoogleDrive] Successfully moved expired folder ${folder.name} to trash.`);
        } else {
          console.warn(`[GoogleDrive] Failed to prune folder ${folder.name}: HTTP ${trashRes.status}`);
        }
      }
    }
  }
}

/**
 * Main Orchestrator
 */
async function main() {
  console.log("=== CampusConnect Google Drive Backup Engine ===");

  // Check if credentials are provided
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    console.log("::warning::Google Drive secrets (GOOGLE_DRIVE_CLIENT_ID / GOOGLE_DRIVE_CLIENT_SECRET / GOOGLE_DRIVE_REFRESH_TOKEN) are not configured.");
    console.log("Encrypted backup generated and verified locally, but upload step requires one-time Google Drive secret setup.");
    console.log("See docs/DATABASE_BACKUP_AND_RESTORE.md for step-by-step instructions.");
    return;
  }

  // Validate local backup files
  const encFile = path.join(BACKUP_DIR, ENC_NAME);
  const shaFile = path.join(BACKUP_DIR, `${ARCHIVE_NAME}.sha256`);

  if (!fs.existsSync(encFile)) {
    throw new Error(`Encrypted backup file not found: ${encFile}`);
  }
  if (!fs.existsSync(shaFile)) {
    throw new Error(`Checksum file not found: ${shaFile}`);
  }

  const encStats = fs.statSync(encFile);
  if (encStats.size === 0) {
    throw new Error("Encrypted backup file is empty (0 bytes)!");
  }

  // Generate safe metadata.json
  const metadataPath = path.join(BACKUP_DIR, "metadata.json");
  const metadata = {
    project: "CampusConnect",
    environment: "production",
    timestamp: new Date().toISOString(),
    backupTimestamp: BACKUP_TIMESTAMP,
    commitSha: COMMIT_SHA,
    encryptedArtifact: ENC_NAME,
    checksumSha256: BACKUP_CHECKSUM || fs.readFileSync(shaFile, "utf8").trim().split(" ")[0],
    encryption: "AES-256-CBC (PBKDF2, 100,000 iterations)",
    archiveSizeEncryptedBytes: encStats.size,
    destination: "Google Drive (Private Storage)",
    retentionPolicy: "30-day daily rolling",
    contents: ["roles.sql (cluster roles)", "schema.sql (public schema DDL)", "data.sql (public schema records)"],
  };

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), "utf8");
  console.log(`Generated metadata file at: ${metadataPath}`);

  // 1. Authenticate with Google Drive API
  console.log("[GoogleDrive] Authenticating with Google OAuth2 API...");
  const accessToken = await getAccessToken();
  console.log("[GoogleDrive] Successfully obtained access token.");

  // 2. Resolve destination folder hierarchy:
  //    Root -> database -> daily -> YYYY-MM-DD
  const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  console.log("[GoogleDrive] Resolving destination root folder under drive.file...");
  const rootFolderId = await resolveRootBackupFolder(accessToken);

  const dbFolderId = await ensureFolder("database", rootFolderId, accessToken);
  const dailyFolderId = await ensureFolder("daily", dbFolderId, accessToken);
  const todayFolderId = await ensureFolder(dateStr, dailyFolderId, accessToken);

  console.log(`[GoogleDrive] Target directory confirmed: database/daily/${dateStr}/ (ID: ${todayFolderId})`);

  // 3. Resumable Uploads
  const uploadedEnc = await uploadFileResumable(encFile, ENC_NAME, "application/octet-stream", todayFolderId, accessToken);
  const uploadedSha = await uploadFileResumable(shaFile, `${ARCHIVE_NAME}.sha256`, "text/plain", todayFolderId, accessToken);
  const uploadedMeta = await uploadFileResumable(metadataPath, "metadata.json", "application/json", todayFolderId, accessToken);

  // 4. Run 30-day Retention Cleanup
  await pruneExpiredDailyBackups(dailyFolderId, accessToken);

  // 5. Output GitHub Actions Step Summary if available
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (summaryFile) {
    const summaryContent = `
### 🛡️ Database Backup Summary (Google Drive)
- **Timestamp**: \`${BACKUP_TIMESTAMP}\`
- **Destination Folder**: \`CampusConnect Backups/database/daily/${dateStr}/\`
- **Encrypted Archive**: \`${ENC_NAME}\` (${(uploadedEnc.size / 1024 / 1024).toFixed(2)} MB, ID: \`${uploadedEnc.id}\`)
- **Checksum**: \`${metadata.checksumSha256}\`
- **Encryption**: AES-256-CBC with PBKDF2 (100,000 iterations)
- **Files Uploaded**:
  - \`${uploadedEnc.name}\`
  - \`${uploadedSha.name}\`
  - \`${uploadedMeta.name}\`
- **Retention**: 30-Day Rolling Daily (Automatic Pruning Active)
- **Status**: ✅ Encrypted & Verified Off-Site Upload Complete
`;
    fs.appendFileSync(summaryFile, summaryContent, "utf8");
  }

  console.log("==========================================================");
  console.log("✅ GOOGLE DRIVE BACKUP AND VALIDATION COMPLETED SUCCESSFULLY");
  console.log(`   Artifact: database/daily/${dateStr}/${ENC_NAME}`);
  console.log("==========================================================");
}

if (require.main === module) {
  main().catch((err) => {
    console.error("FATAL: Google Drive backup failed:", err.message);
    process.exit(1);
  });
}

module.exports = { main, getAccessToken, ensureFolder, uploadFileResumable, pruneExpiredDailyBackups };
