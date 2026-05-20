import { handleLogin } from '../commands/login';
import { getAuthToken } from '../config';
import { warn, info } from '../logger';

export async function requireAuth(): Promise<boolean> {
  const token = getAuthToken();
  if (token) {
    return true;
  }

  warn('Not authenticated. Starting login...');
  info('');
  await handleLogin();
  return getAuthToken() ? true : false;
}
