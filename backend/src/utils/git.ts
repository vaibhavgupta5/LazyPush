import { exec } from 'child_process';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';

function run(cmd: string, cwd?: string) {
  return new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
    exec(cmd, { cwd }, (err, stdout, stderr) => {
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
    const bundlePath = path.join(tmp, 'repo.bundle');
    const bundleBuf = Buffer.from(opts.bundleBase64, 'base64');
    await fs.writeFile(bundlePath, bundleBuf);
    // try to clone a bare repo and fetch bundle
    const workDir = path.join(tmp, 'work');
    await run(`git clone --bare . ${workDir}`, tmp).catch(() => {});
    // fetch bundle into a bare repo
    await run(`git init --bare ${workDir}`, tmp).catch(() => {});
    await run(`git --git-dir=${workDir} fetch ${bundlePath} +refs/*:refs/*`);
    // create a temp non-bare repo to rewrite commit dates
    const repoDir = path.join(tmp, 'repo');
    await run(`git clone ${workDir} ${repoDir}`);
    // checkout branch
    await run(`git -C ${repoDir} checkout -f ${opts.branch}`).catch(() => {});
    // set env dates and amend last commit if needed
    const iso = opts.scheduledAt.toISOString();
    await run(`GIT_AUTHOR_DATE="${iso}" GIT_COMMITTER_DATE="${iso}" git -C ${repoDir} commit --amend --no-edit`).catch(() => {});
    // push with token
    const remote = opts.repoUrl.replace('https://', `https://oauth2:${opts.token}@`);
    await run(`git -C ${repoDir} push ${remote} HEAD:${opts.branch}`);
  } finally {
    // cleanup
    await fs.rm(tmp, { recursive: true, force: true }).catch(() => {});
  }
}
