import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.lazypush');
const SESSION_FILE = path.join(CONFIG_DIR, 'session.json');

export interface Session {
  token: string;
  userId: string;
  username: string;
  createdAt: string;
}

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function saveSession(session: Session) {
  ensureConfigDir();
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2), 'utf8');
}

export function getSession(): Session | null {
  if (!fs.existsSync(SESSION_FILE)) return null;
  try {
    const data = fs.readFileSync(SESSION_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearSession() {
  if (fs.existsSync(SESSION_FILE)) {
    fs.unlinkSync(SESSION_FILE);
  }
}

export function getAuthToken(): string | null {
  const session = getSession();
  return session?.token || null;
}
