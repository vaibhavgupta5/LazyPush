import mongoose from 'mongoose';
import { Job } from './models/job';
import { User } from './models/user';
import { MONGODB_URI } from './config';
import { decrypt } from './utils/crypto';
import { restoreAndPushBundle } from './utils/git';
import { info, error } from './logger';

const POLL_INTERVAL = 60 * 1000;

async function processJob(job: any) {
  info('processing job', job._id.toString());
  const user = await User.findById(job.userId);
  if (!user) {
    job.status = 'failed';
    job.lastError = 'user not found';
    await job.save();
    return;
  }
  const token = decrypt(user.tokenEncrypted);
  try {
    job.status = 'processing';
    job.attempts += 1;
    await job.save();
    await restoreAndPushBundle({
      bundleBase64: job.bundleBase64,
      repoUrl: job.repoUrl,
      branch: job.branch,
      token,
      scheduledAt: job.scheduledAt
    });
    job.status = 'done';
    await job.save();
  } catch (e: any) {
    error('job failed', e.message || e);
    job.status = 'failed';
    job.lastError = String(e?.message || e);
    await job.save();
  }
}

export async function startWorker() {
  await mongoose.connect(MONGODB_URI);
  info('worker connected to mongo');
  setInterval(async () => {
    try {
      const now = new Date();
      const jobs = await Job.find({ status: 'scheduled', scheduledAt: { $lte: now } }).limit(5);
      for (const job of jobs) {
        // process sequentially
        // eslint-disable-next-line no-await-in-loop
        await processJob(job);
      }
    } catch (e) {
      error('worker loop error', e);
    }
  }, POLL_INTERVAL);
}
