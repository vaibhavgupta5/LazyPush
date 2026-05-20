import { execSync } from 'child_process';
import fs from 'fs';
import zlib from 'zlib';
import path from 'path';
import os from 'os';

export function getRepoUrl(): string {
  try {
    const url = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
    if (!url) throw new Error('No origin found');
    return url;
  } catch {
    throw new Error('Not in a git repository or no origin set');
  }
}

export function getBranch(): string {
  try {
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
    if (!branch || branch === 'HEAD') throw new Error('Cannot determine branch');
    return branch;
  } catch {
    throw new Error('Could not detect current branch');
  }
}

export function hasUncommittedChanges(): boolean {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    return status.length > 0;
  } catch {
    return false;
  }
}

export function getUncommittedFiles(): string[] {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    if (!status) return [];
    return status.split('\n').map(line => line.slice(3).trim()).filter(f => f);
  } catch {
    return [];
  }
}

export function getBranchTrackingInfo(): { remote: string; upstream: string } | null {
  try {
    const remote = execSync('git config --get branch.$(git rev-parse --abbrev-ref HEAD).remote', { encoding: 'utf8' }).trim();
    const upstream = execSync('git config --get branch.$(git rev-parse --abbrev-ref HEAD).merge', { encoding: 'utf8' }).trim();
    if (!remote || !upstream) return null;
    return { remote, upstream: upstream.replace('refs/heads/', '') };
  } catch {
    return null;
  }
}

export function createBundle(branch: string = 'HEAD'): string {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lazypush-'));
  const bundlePath = path.join(tmpDir, 'repo.bundle');
  try {
    // Create bundle with the branch name to preserve refs/heads/<branch>
    execSync(`git bundle create "${bundlePath}" ${branch}`, { stdio: 'pipe' });
    if (!fs.existsSync(bundlePath)) throw new Error('Bundle not created');
    return bundlePath;
  } catch (e) {
    fs.rmSync(tmpDir, { recursive: true, force: true });
    throw new Error(`Failed to create bundle: ${e}`);
  }
}

export function compressBundle(bundlePath: string): string {
  const gzPath = bundlePath + '.gz';
  try {
    const bundle = fs.readFileSync(bundlePath);
    const compressed = zlib.gzipSync(bundle);
    fs.writeFileSync(gzPath, compressed);
    return gzPath;
  } catch (e) {
    throw new Error(`Compression failed: ${e}`);
  }
}

export function bundleToBase64(gzPath: string): string {
  const data = fs.readFileSync(gzPath);
  return data.toString('base64');
}

export function cleanupBundle(bundlePath: string, gzPath: string) {
  try {
    const tmpDir = path.dirname(bundlePath);
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {}
}
