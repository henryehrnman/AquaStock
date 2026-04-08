/**
 * Watches aquastock/src and creates a commit on the AquaStock repo when files change.
 * Uses your configured git user (e.g. repo or global user.name / user.email).
 */
import chokidar from "chokidar";
import { execSync, spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const aquastockRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(aquastockRoot, "..");
const watchDir = path.join(aquastockRoot, "src");

let timer = null;
const DEBOUNCE_MS = 2000;

function hasStagedChanges() {
  const r = spawnSync("git", ["diff", "--cached", "--quiet"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  return r.status !== 0;
}

function commit() {
  try {
    execSync("git add aquastock", { cwd: repoRoot, stdio: "pipe" });
    if (!hasStagedChanges()) return;
    const msg = `chore: auto-commit ${new Date().toISOString().replace(/\.\d{3}Z$/, "Z")}`;
    execSync(`git commit -m ${JSON.stringify(msg)}`, {
      cwd: repoRoot,
      stdio: "inherit",
    });
    console.log(`[watch-autocommit] committed as ${execSync("git config user.name", { cwd: repoRoot }).toString().trim()} <${execSync("git config user.email", { cwd: repoRoot }).toString().trim()}>`);
  } catch (e) {
    console.warn("[watch-autocommit] commit skipped or failed:", e?.message || e);
  }
}

function scheduleCommit() {
  clearTimeout(timer);
  timer = setTimeout(commit, DEBOUNCE_MS);
}

const usePolling = process.env.AUTOCOMMIT_POLL === "1";

const watcher = chokidar.watch(watchDir, {
  ignoreInitial: true,
  usePolling,
  interval: usePolling ? 1500 : undefined,
  awaitWriteFinish: { stabilityThreshold: 400, pollInterval: 100 },
});

watcher.on("all", (event, filePath) => {
  if (event === "add" || event === "change" || event === "unlink") {
    console.log(`[watch-autocommit] ${event}: ${path.relative(repoRoot, filePath)}`);
    scheduleCommit();
  }
});

console.log(`[watch-autocommit] watching ${watchDir}`);
console.log(`[watch-autocommit] repo root: ${repoRoot} (commits use local/global git user)`);
