/* eslint-disable @typescript-eslint/no-require-imports */
const { exec } = require("child_process");
const fs = require("fs").promises;
const path = require("path");

const workspaceDir = path.resolve(__dirname, "..");
const lockFile = path.join(workspaceDir, ".next", "dev", "lock");
const cacheDir = path.join(workspaceDir, ".next", "dev", "cache");

const execPromise = (command) => new Promise((resolve) => {
  exec(command, (err, stdout, stderr) => {
    resolve({ err, stdout, stderr });
  });
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getPidsOnPort(port) {
  const pids = new Set();
  try {
    if (process.platform === "win32") {
      const { stdout } = await execPromise(`netstat -ano`);
      const lines = stdout.split("\n");
      for (const line of lines) {
        if (line.includes(`:${port}`) && line.includes("LISTENING")) {
          const parts = line.trim().split(/\s+/);
          const pidStr = parts[parts.length - 1];
          const pid = parseInt(pidStr, 10);
          if (!isNaN(pid) && pid > 0) {
            pids.add(pid);
          }
        }
      }
    } else {
      const { stdout } = await execPromise(`lsof -t -i :${port}`);
      if (stdout) {
        stdout.split("\n").forEach((line) => {
          const pid = parseInt(line.trim(), 10);
          if (!isNaN(pid) && pid > 0) {
            pids.add(pid);
          }
        });
      }
    }
  } catch {
    // Ignore execution failures if port is unoccupied
  }
  return Array.from(pids);
}

async function getWorkspaceDevServerPids(currentPid, parentPid, workspaceDir, workspaceName) {
  const devServerPids = new Set();
  try {
    if (process.platform === "win32") {
      const cmd = `powershell -NoProfile -Command "Get-CimInstance Win32_Process | Select-Object ProcessId, CommandLine | ConvertTo-Json -Compress"`;
      const { stdout } = await execPromise(cmd);
      if (stdout) {
        try {
          let processes = JSON.parse(stdout.trim());
          if (!Array.isArray(processes)) {
            processes = [processes];
          }
          for (const proc of processes) {
            if (!proc || !proc.CommandLine) continue;
            const pid = proc.ProcessId;
            const command = proc.CommandLine;
            if (pid === currentPid || pid === parentPid) continue;
            const isNextProcess = command.includes("next-server") || command.includes("next dev") || command.includes(".bin\\next") || command.includes("next-dev");
            const isThisWorkspace = command.includes(workspaceName) || command.includes(workspaceDir);
            if (isNextProcess && isThisWorkspace) {
              devServerPids.add(pid);
            }
          }
        } catch {
          const { stdout: wmicOut } = await execPromise("wmic process get processid,commandline");
          const lines = wmicOut.split("\n");
          for (const line of lines) {
            if (line.includes("next dev") || line.includes("next-server")) {
              const parts = line.trim().split(/\s+/);
              const pid = parseInt(parts[parts.length - 1], 10);
              if (!isNaN(pid) && pid !== currentPid && pid !== parentPid) {
                devServerPids.add(pid);
              }
            }
          }
        }
      }
    } else {
      const { stdout } = await execPromise("ps -ax -o pid,command");
      if (stdout) {
        const lines = stdout.split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          const match = trimmed.match(/^(\d+)\s+(.+)$/);
          if (!match) continue;
          const pid = parseInt(match[1], 10);
          const command = match[2];
          if (pid === currentPid || pid === parentPid) continue;
          const isNextProcess = command.includes("next-server") || command.includes("next dev") || command.includes(".bin/next");
          const isThisWorkspace = command.includes(workspaceName) || command.includes(workspaceDir);
          if (isNextProcess && isThisWorkspace) {
            devServerPids.add(pid);
          }
        }
      }
    }
  } catch (err) {
    console.log(`• Error auditing running processes: ${err.message}`);
  }
  return Array.from(devServerPids);
}

async function gracefulKill(pid) {
  try {
    try {
      process.kill(pid, 0);
    } catch {
      return true; // Already exited
    }

    console.log(`• Terminating process PID ${pid} gracefully (SIGTERM)...`);
    if (process.platform === "win32") {
      await execPromise(`taskkill /PID ${pid}`);
    } else {
      process.kill(pid, "SIGTERM");
    }

    for (let i = 0; i < 10; i++) {
      await sleep(150);
      try {
        process.kill(pid, 0);
      } catch {
        console.log(`✓ Process PID ${pid} exited.`);
        return true;
      }
    }

    console.log(`⚠ PID ${pid} failed to exit. Force killing (SIGKILL)...`);
    if (process.platform === "win32") {
      await execPromise(`taskkill /F /PID ${pid}`);
    } else {
      process.kill(pid, "SIGKILL");
    }
    return true;
  } catch (err) {
    console.log(`• Failed to cleanly terminate PID ${pid}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("=== Asynchronous Pre-dev Check ===");
  const currentPid = process.pid;
  const parentPid = process.ppid;
  const workspaceName = path.basename(workspaceDir);

  let isUncleanShutdown = false;
  let lockExists = false;

  try {
    await fs.access(lockFile);
    lockExists = true;
  } catch {
    // Lock file not present
  }

  // 1. Audit and terminate concurrent Next.js dev server processes
  const devServerPids = await getWorkspaceDevServerPids(currentPid, parentPid, workspaceDir, workspaceName);
  let killedCount = 0;

  if (devServerPids.length > 0) {
    console.log(`• Detected ${devServerPids.length} active dev server process(es). Cleaning up...`);
    isUncleanShutdown = true;
    for (const pid of devServerPids) {
      const ok = await gracefulKill(pid);
      if (ok) killedCount++;
    }
  }

  // 2. Audit processes occupying port 3000
  const portPids = await getPidsOnPort(3000);
  if (portPids.length > 0) {
    console.log(`• Port 3000 occupied by PID(s): ${portPids.join(", ")}. Terminating...`);
    isUncleanShutdown = true;
    for (const pid of portPids) {
      if (pid === currentPid || pid === parentPid) continue;
      await gracefulKill(pid);
    }
  } else {
    console.log("✓ Port 3000 is clear");
  }

  // 3. Handle Lock File and automatic recovery
  if (lockExists) {
    try {
      await fs.unlink(lockFile);
      console.log("✓ Removed stale .next/dev/lock file");
      isUncleanShutdown = true;
    } catch {
      // Lock might have been cleaned up by terminated processes
    }
  }

  // 4. Recover Turbopack cache if unclean shutdown detected
  if (isUncleanShutdown) {
    console.log("⚠ Unclean shutdown detected. Rebuilding Turbopack cache directory...");
    try {
      await fs.rm(cacheDir, { recursive: true, force: true });
      console.log("✓ Turbopack cache cleared at .next/dev/cache");
    } catch (err) {
      console.log(`• Cache recovery skipped: ${err.message}`);
    }
  } else {
    console.log("✓ Environment is clean. Safe to start Next.js dev server.");
  }
}

main().catch((err) => {
  console.error("• Fatal predev error:", err);
  process.exit(1);
});
