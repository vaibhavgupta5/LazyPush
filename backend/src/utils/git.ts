import { exec } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import zlib from 'zlib';

function run(cmd: string, cwd?: string, env?: NodeJS.ProcessEnv) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    exec(cmd, { cwd, env: env ? { ...process.env, ...env } : process.env, timeout: 30000 }, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve({ stdout, stderr });
    });
  });
}

export async function restoreAndPushBundle(opts: {
  bundleBase64: string;
  repoUrl: string;
  branch: string;
  token: string;
  scheduledAt: Date;
}) {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'lazypush-'));
  try {
    // Decode base64 (this is gzipped data)
    const compressedBuf = Buffer.from(opts.bundleBase64, 'base64');
    
    // Decompress gzip
    const bundleBuf = zlib.gunzipSync(compressedBuf);
    
    const bundlePath = path.join(tmp, 'repo.bundle');
    await fs.writeFile(bundlePath, bundleBuf);
    
    // Initialize bare repo and fetch bundle
    const workDir = path.join(tmp, 'work');
    await run(`git init --bare ${workDir}`, tmp);
    await run(`git --git-dir=${workDir} fetch ${bundlePath} +refs/*:refs/*`);
    
    // Set HEAD to the correct branch in bare repo
    await run(`git --git-dir=${workDir} symbolic-ref HEAD refs/heads/${opts.branch}`).catch(() => {});
    
    // Create a temp non-bare repo to rewrite commit dates
    const repoDir = path.join(tmp, 'repo');
    await run(`git clone ${workDir} ${repoDir}`);
    
    // Verify branch exists and checkout
    await run(`git -C ${repoDir} checkout -f ${opts.branch}`).catch(() => {
      throw new Error(`Failed to checkout branch ${opts.branch}`);
    });
    
    // Set env dates and amend last commit if needed
    const iso = opts.scheduledAt.toISOString();
    await run(`GIT_AUTHOR_DATE="${iso}" GIT_COMMITTER_DATE="${iso}" git -C ${repoDir} commit --amend --no-edit`).catch(() => {});
    
    // Push with token (disable credential helpers and make non-interactive)
    const remote = opts.repoUrl.replace('https://', `https://oauth2:${opts.token}@`);
    const gitEnv = {
      GIT_TERMINAL_PROMPT: '0', // Disable all interactive prompts
      GIT_CONFIG_NOSYSTEM: '1' // Don't load system git config
    };
    // Disable credential helpers, use token from URL
    await run(`git -C ${repoDir} -c credential.helper= -c core.askPass= push --no-verify ${remote} HEAD:${opts.branch}`, undefined, gitEnv);
  } finally {
    // Cleanup
    await fs.rm(tmp, { recursive: true, force: true }).catch(() => {});
  }
}
