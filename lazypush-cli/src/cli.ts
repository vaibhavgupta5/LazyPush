#!/usr/bin/env node

import { program } from 'commander';
import { handleLogin } from './commands/login';
import { handleSchedule, handleScheduleInteractive } from './commands/schedule';
import { handleJobs, handleCancel, handleList } from './commands/jobs';
import { handleLogout } from './commands/logout';

program
  .name('lazypush')
  .description('Schedule Git commits for future push')
  .version('0.1.0');

program
  .command('login')
  .description('Authenticate with GitHub')
  .action(handleLogin);

program
  .command('schedule')
  .option('-a, --at <time>', 'Time to push (required). Examples: "5pm", "tomorrow 9am", "in 2 hours", "friday 8pm"')
  .option('-t, --tz <timezone>', 'Timezone (default: local). Examples: IST, EST, UTC, America/New_York')
  .option('-m, --message <msg>', 'Commit message (optional)')
  .description('Schedule a push')
  .action(async (opts: any) => {
    if (!opts.at) {
      await handleScheduleInteractive();
    } else {
      await handleSchedule(opts.at, opts.tz, opts.message);
    }
  });

program
  .command('jobs')
  .description('List scheduled jobs')
  .action(async () => handleJobs());

program
  .command('list')
  .description('List all scheduled and finished jobs (latest first)')
  .action(async () => handleList());

program
  .command('cancel <id>')
  .description('Cancel a scheduled job')
  .action(async (id: string) => {
    await handleCancel(id);
  });

program
  .command('logout')
  .description('Logout and clear session')
  .action(handleLogout);

program
  .command('help')
  .description('Show command help')
  .action(() => {
    console.log('LazyPush CLI');
    console.log('');
    console.log('Commands:');
    console.log('  login                 Authenticate with GitHub');
    console.log('  schedule              Schedule a push (interactive or flags)');
    console.log('  jobs                  List your scheduled jobs');
    console.log('  list                  List all scheduled and finished jobs');
    console.log('  cancel <id>           Cancel a scheduled job');
    console.log('  logout                Logout and clear session');
    console.log('  help                  Show this help');
    console.log('');
    console.log('Examples:');
    console.log('  lazypush schedule');
    console.log('  lazypush schedule --at "tomorrow 9am"');
    console.log('  lazypush jobs');
    console.log('  lazypush list');
  });

program.parse(process.argv);

if (process.argv.length < 3) {
  program.help();
}
