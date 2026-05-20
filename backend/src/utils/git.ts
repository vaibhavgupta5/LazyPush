import { exec } from "child_process";
import fs from "fs/promises";
import os from "os";
import path from "path";
import zlib from "zlib";
import { info } from "../logger";

function run(cmd: string, cwd?: string, env?: NodeJS.ProcessEnv) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    exec(
      cmd,
      {
        cwd,
        env: env ? { ...process.env, ...env } : process.env,
        timeout: 120000,
      },
      (err, stdout, stderr) => {
        if (err) {
          const message = `Command failed: ${cmd}\n${stderr || err.message}`;
          return reject(new Error(message));
        }
        resolve({ stdout, stderr });
      },
    );
  });
}

export async function restoreAndPushBundle(opts: {
  bundleBase64: string;
  repoUrl: string;
  branch: string;
  token: string;
  scheduledAt: Date;
}) {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "lazypush-"));
  try {
    // Decode base64 (this is gzipped data)
    info("git: decoding bundle");
    const compressedBuf = Buffer.from(opts.bundleBase64, "base64");

    // Decompress gzip
    info("git: decompressing bundle");
    const bundleBuf = zlib.gunzipSync(compressedBuf);

    const bundlePath = path.join(tmp, "repo.bundle");
    info("git: writing bundle to disk");
    await fs.writeFile(bundlePath, bundleBuf);

    // Initialize bare repo and fetch bundle
    const workDir = path.join(tmp, "work");
    info("git: init bare repo");
    await run(`git init --bare ${workDir}`, tmp);

    info("git: fetch bundle into bare repo");
    await run(`git --git-dir=${workDir} fetch ${bundlePath} +refs/*:refs/*`);

    // Set HEAD to the correct branch in bare repo
    info("git: set HEAD to branch");
    try {
      await run(
        `git --git-dir=${workDir} symbolic-ref HEAD refs/heads/${opts.branch}`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      info(`git: set HEAD failed (non-fatal): ${msg}`);
    }

    // Clone bare repo into a working repo so we can amend
    const repoDir = path.join(tmp, "repo");
    info("git: clone bare repo");
    await run(`git clone ${workDir} ${repoDir}`);

    // Checkout the target branch — hard fail if it doesn't exist
    info("git: checkout branch");
    try {
      await run(`git -C ${repoDir} checkout -f ${opts.branch}`);
    } catch {
      throw new Error(`Failed to checkout branch ${opts.branch}`);
    }

    // Verify the branch actually checked out correctly
    const { stdout: currentBranch } = await run(
      `git -C ${repoDir} rev-parse --abbrev-ref HEAD`,
    );
    if (currentBranch.trim() !== opts.branch) {
      throw new Error(
        `Branch mismatch after checkout: expected "${opts.branch}", got "${currentBranch.trim()}"`,
      );
    }

    // Rewrite the last commit's author and committer timestamps.
    // Pass dates via env (not inline shell prefix) so they are reliably set
    // regardless of how exec() invokes the shell.
    const iso = opts.scheduledAt.toISOString();
    const amendEnv: NodeJS.ProcessEnv = {
      GIT_AUTHOR_DATE: iso,
      GIT_COMMITTER_DATE: iso,
      GIT_TERMINAL_PROMPT: "0",
      GIT_CONFIG_NOSYSTEM: "1",
    };

    info(`git: amend commit timestamps to ${iso}`);
    try {
      const result = await run(
        `git -C ${repoDir} commit --amend --no-edit`,
        undefined,
        amendEnv,
      );
      info(`git: amend stdout: ${result.stdout.trim()}`);
      if (result.stderr.trim()) {
        info(`git: amend stderr: ${result.stderr.trim()}`);
      }
    } catch (err) {
      // Amend can fail legitimately (e.g. empty repo, nothing to amend).
      // Log it but do not abort — we still want to push whatever is there.
      const msg = err instanceof Error ? err.message : String(err);
      info(`git: amend failed (non-fatal): ${msg}`);
    }

    // Confirm the HEAD commit's author date after amend
    try {
      const { stdout: logLine } = await run(
        `git -C ${repoDir} log -1 --format="%H %ai %ci"`,
      );
      info(`git: HEAD after amend: ${logLine.trim()}`);
    } catch {
      // best-effort diagnostic, ignore failures
    }

    // Push with token injected into URL.
    // credential.helper= and core.askPass= ensure no interactive prompts.
    const remote = opts.repoUrl.replace(
      "https://",
      `https://oauth2:${opts.token}@`,
    );
    const pushEnv: NodeJS.ProcessEnv = {
      GIT_TERMINAL_PROMPT: "0",
      GIT_CONFIG_NOSYSTEM: "1",
    };

    info("git: push to remote");
    const pushResult = await run(
      `git -C ${repoDir} \
  -c credential.helper= \
  -c core.askPass= \
  push --force --no-verify ${remote} HEAD:${opts.branch}`,
      undefined,
      pushEnv,
    );

    info(`git: push stdout: ${pushResult.stdout.trim()}`);
    if (pushResult.stderr.trim()) {
      // git push normally writes progress/result to stderr even on success
      info(`git: push stderr: ${pushResult.stderr.trim()}`);
    }
  } finally {
    await fs.rm(tmp, { recursive: true, force: true }).catch(() => {});
  }
}
