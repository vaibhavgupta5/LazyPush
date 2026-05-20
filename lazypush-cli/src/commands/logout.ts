import { clearSession } from '../config';
import { success, error } from '../logger';

export function handleLogout() {
  try {
    clearSession();
    success('Logged out');
  } catch (e: any) {
    error(`Logout failed: ${e.message}`);
    process.exit(1);
  }
}
