import chalk from 'chalk';

export function info(msg: string) {
  console.log(chalk.blue('ℹ'), msg);
}

export function success(msg: string) {
  console.log(chalk.green('✓'), msg);
}

export function error(msg: string) {
  console.log(chalk.red('✗'), msg);
}

export function warn(msg: string) {
  console.log(chalk.yellow('⚠'), msg);
}

export function log(msg: string) {
  console.log(msg);
}
