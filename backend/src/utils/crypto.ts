import crypto from 'crypto';
import { ENCRYPTION_KEY } from '../config';

const KEY_PREFIX = 'base64:';

function getKeyBuffer(): Buffer {
  if (ENCRYPTION_KEY.startsWith(KEY_PREFIX)) {
    return Buffer.from(ENCRYPTION_KEY.slice(KEY_PREFIX.length), 'base64');
  }
  return Buffer.from(ENCRYPTION_KEY);
}

export function encrypt(text: string): string {
  const key = getKeyBuffer();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decrypt(data: string): string {
  const key = getKeyBuffer();
  const b = Buffer.from(data, 'base64');
  const iv = b.slice(0, 12);
  const tag = b.slice(12, 28);
  const encrypted = b.slice(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const out = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return out.toString('utf8');
}
