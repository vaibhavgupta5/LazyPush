import inquirer from 'inquirer';
import dayjs from 'dayjs';
import { getApiClient } from '../api/client';
import { info, success, error,  warn } from '../logger';
import { requireAuth } from '../utils/auth';
import { getRepoUrl, getBranch, createBundle, compressBundle, bundleToBase64, cleanupBundle, hasUncommittedChanges, getUncommittedFiles, getBranchTrackingInfo } from '../utils/git';
import { parseScheduleTime } from '../utils/scheduler';

export async function handleScheduleInteractive() {
  if (!(await requireAuth())) {
    process.exit(1);
  }

  try {
    // Pre-flight checks
    info('═══ PRE-FLIGHT CHECKS ═══');
    info('Detecting repository...');
    const repoUrl = getRepoUrl();
    const branch = getBranch();
    info(`Repository: ${repoUrl}`);
    info(`Branch: ${branch}`);
    info('');

    // Check for uncommitted changes
    if (hasUncommittedChanges()) {
      const files = getUncommittedFiles();
      warn(`Found ${files.length} uncommitted file(s):`);
      files.forEach(f => info(`  - ${f}`));
      info('');

      try {
        require('child_process').execSync('git add .', { stdio: 'inherit' });
        success('Files staged for commit');
        const staged = require('child_process')
          .execSync('git diff --name-only --cached', { encoding: 'utf8' })
          .trim();
        if (staged) {
          info('Staged files:');
          staged.split('\n').forEach((f: string) => info(`  - ${f}`));
        } else {
          warn('No staged files found');
        }
        info('');
      } catch (e) {
        error('Failed to stage files');
        process.exit(1);
      }
    } else {
      success('Working directory clean');
      info('');
    }

    // Check branch tracking
    const tracking = getBranchTrackingInfo();
    if (tracking) {
      info(`Remote: ${tracking.remote}/${tracking.upstream}`);
    } else {
      warn(`No upstream tracking set for branch "${branch}"`);
      info('Note: Will push to origin');
      info('');
    }
    info('═══════════════════════');
    info('');

    // Step 1: Date, time, timezone
    const timeAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'date',
        message: 'Date (dd/mm/yyyy format, or press Enter for today)',
        default: () => dayjs().format('DD/MM/YYYY'),
        validate: (input: string) => {
          const parts = input.split('/');
          if (parts.length !== 3) return 'Invalid format. Use dd/mm/yyyy';
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10);
          const y = parseInt(parts[2], 10);
          if (d < 1 || d > 31 || m < 1 || m > 12) return 'Invalid date';
          return true;
        }
      },
      {
        type: 'input',
        name: 'time',
        message: 'Time (e.g., 5:30pm, 17:30, 9:15am)',
        validate: (input: string) => {
          const match = input.match(/^(\d{1,2})(?::(\d{2}))?\s?(am|pm)?$/i);
          if (!match) return 'Invalid time format. Use: 5pm, 5:30pm, or 17:30';
          return true;
        }
      },
      {
        type: 'input',
        name: 'timezone',
        message: 'Timezone (or press Enter for local)',
        default: 'local'
      }
    ]);

    // Show timezone info
    const tz = timeAnswers.timezone === 'local' ? undefined : timeAnswers.timezone;
    const tzDisplay = tz || dayjs.tz.guess() || 'UTC';
    info(`Local timezone: ${tzDisplay}`);
    info('');

    // Step 2: Commit message
    const messageAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: 'Commit message (optional)',
        default: ''
      }
    ]);

    // Step 3: Show repo/branch and ask for confirmation
    info('');
    info('═══ PUSH DETAILS ═══');
    info(`Repository: ${repoUrl}`);
    info(`Branch: ${branch}`);
    info(`Commit Message: ${messageAnswers.message || '(none)'}`);
    info('═══════════════════');
    info('');

    const confirmAnswers = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Confirm scheduling?',
        default: true
      }
    ]);

    if (!confirmAnswers.confirm) {
      info('Scheduling cancelled');
      return;
    }

    info('Parsing scheduled time...');
    const dateStr = timeAnswers.date;
    const timeStr = timeAnswers.time;

    const [day, month, year] = dateStr.split('/');
    let scheduledAt: Date;

    try {
      let target = dayjs(`${year}-${month}-${day}`);
      if (tz) target = target.tz(tz);
      
      const timeMatch = timeStr.match(/^(\d{1,2})(?::(\d{2}))?\s?(am|pm)?$/i);
      if (timeMatch) {
        let [, hour, minutes, ampm] = timeMatch;
        let h = parseInt(hour, 10);
        let m = minutes ? parseInt(minutes, 10) : 0;
        if (ampm?.toLowerCase() === 'pm' && h !== 12) h += 12;
        if (ampm?.toLowerCase() === 'am' && h === 12) h = 0;
        target = target.hour(h).minute(m).second(0);
      }

      scheduledAt = (tz ? target.utc() : target).toDate();
    } catch (e) {
      throw new Error('Invalid date/time');
    }

    info(`Scheduled for: ${scheduledAt.toLocaleString()} UTC`);

    // Commit staged files before bundling.
    // Use a throwaway identity — the backend replaces both author and
    // committer (name, email, date) during the scheduled amend.
    const commitMsg = messageAnswers.message || 'chore: scheduled commit';
    try {
      const result = require('child_process').execSync(
        `git -c user.name="LazyPush" -c user.email="lazypush@noreply" commit -m "${commitMsg.replace(/"/g, '\\"')}"`,
        { encoding: 'utf8', stdio: 'pipe' }
      );
      info(`git commit: ${result.trim()}`);
    } catch (e: any) {
      const stderr: string = e.stderr?.toString() || '';
      const stdout: string = e.stdout?.toString() || '';
      info(`git commit stdout: ${stdout.trim()}`);
      info(`git commit stderr: ${stderr.trim()}`);
      if (!stderr.includes('nothing to commit')) {
        throw new Error(`git commit failed: ${stderr}`);
      }
      info('git commit: nothing to commit, bundling existing HEAD');
    }

    const head = require('child_process').execSync('git log -1 --format="%H %s"', { encoding: 'utf8' }).trim();
    info(`git HEAD before bundle: ${head}`);

    info('Creating git bundle...');
    const bundlePath = createBundle(branch);

    info('Compressing bundle...');
    const gzPath = compressBundle(bundlePath);

    info('Encoding to base64...');
    const bundleBase64 = bundleToBase64(gzPath);

    info('Uploading to backend...');
    const api = getApiClient();
    const job = await api.scheduleJob({
      repoUrl,
      branch,
      scheduledAt,
      bundleBase64,
      commitMessage: messageAnswers.message || undefined
    });

    cleanupBundle(bundlePath, gzPath);

    success(`Job scheduled! ID: ${job.id}`);
    info(`Push will occur at: ${scheduledAt.toLocaleString()}`);
  } catch (e: any) {
    error(`Failed: ${e.message}`);
    process.exit(1);
  }
}

export async function handleSchedule(timeInput: string, timezone?: string, message?: string) {
  if (!(await requireAuth())) {
    process.exit(1);
  }

  try {
    info('Detecting repository...');
    const repoUrl = getRepoUrl();
    const branch = getBranch();
    info(`Repository: ${repoUrl}`);
    info(`Branch: ${branch}`);

    info('Parsing scheduled time...');
    const tz = timezone || 'UTC';
    info(`Using timezone: ${tz}`);
    const scheduledAt = parseScheduleTime(timeInput, tz);
    info(`Scheduled for: ${scheduledAt.toLocaleString()} UTC`);

    info('Creating git bundle...');
    const bundlePath = createBundle(branch);

    info('Compressing bundle...');
    const gzPath = compressBundle(bundlePath);

    info('Encoding to base64...');
    const bundleBase64 = bundleToBase64(gzPath);

    info('Uploading to backend...');
    const api = getApiClient();
    const job = await api.scheduleJob({
      repoUrl,
      branch,
      scheduledAt,
      bundleBase64,
      commitMessage: message
    });

    cleanupBundle(bundlePath, gzPath);

    success(`Job scheduled! ID: ${job.id}`);
    info(`Push will occur at: ${scheduledAt.toLocaleString()}`);
  } catch (e: any) {
    error(`Failed: ${e.message}`);
    process.exit(1);
  }
}
