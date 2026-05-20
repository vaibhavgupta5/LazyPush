export function info(...args: any[]) { console.log('[info]', ...args); }
export function error(...args: any[]) { console.error('[error]', ...args); }
export function debug(...args: any[]) { if (process.env.DEBUG) console.debug('[debug]', ...args); }
