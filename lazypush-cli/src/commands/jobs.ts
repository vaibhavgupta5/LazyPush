import { getApiClient } from '../api/client';
import { info, success, error, log } from '../logger';
import chalk from 'chalk';
import { requireAuth } from '../utils/auth';

export async function handleJobs() {
  if (!(await requireAuth())) {
    process.exit(1);
  }

  try {
    const api = getApiClient();
    const jobs = await api.listJobs();

    if (jobs.length === 0) {
      info('No scheduled jobs');
      return;
    }

    log('');
    log(chalk.bold('Scheduled Jobs:'));
    log('');

    jobs.forEach((job: any, i: number) => {
      const status = chalk.gray(job.status);
      const time = new Date(job.scheduledAt).toLocaleString();
      const branch = chalk.cyan(job.branch);
      log(`${i + 1}. ${chalk.yellow(job._id)} [${status}]`);
      log(`   Branch: ${branch} @ ${time}`);
    });

    log('');
  } catch (e: any) {
    error(`Failed to fetch jobs: ${e.message}`);
    process.exit(1);
  }
}

export async function handleCancel(id: string) {
  if (!(await requireAuth())) {
    process.exit(1);
  }

  try {
    const api = getApiClient();
    await api.cancelJob(id);
    success(`Job ${id} cancelled`);
  } catch (e: any) {
    error(`Failed to cancel job: ${e.message}`);
    process.exit(1);
  }
}

export async function handleList() {
  if (!(await requireAuth())) {
    process.exit(1);
  }

  try {
    const api = getApiClient();
    const jobs = await api.listAllJobs();

    if (jobs.length === 0) {
      info('No jobs found');
      return;
    }

    log('');
    log(chalk.bold('All Scheduled/Finished Jobs:'));
    log('');

    jobs.forEach((job: any, i: number) => {
      const status = chalk.gray(job.status);
      const time = new Date(job.scheduledAt).toLocaleString();
      const branch = chalk.cyan(job.branch);
      const user = chalk.green(job.username || 'unknown');
      log(`${i + 1}. ${chalk.yellow(job._id)} [${status}]`);
      log(`   User: ${user}`);
      log(`   Branch: ${branch} @ ${time}`);
    });

    log('');
  } catch (e: any) {
    error(`Failed to fetch jobs: ${e.message}`);
    process.exit(1);
  }
}
