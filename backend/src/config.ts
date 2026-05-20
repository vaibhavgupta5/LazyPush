import dotenv from 'dotenv';

dotenv.config();

const get = (k: string, fallback = ''): string => process.env[k] ?? fallback;

export const MONGODB_URI = get('MONGODB_URI');
export const JWT_SECRET = get('JWT_SECRET');
export const ENCRYPTION_KEY = get('ENCRYPTION_KEY');
export const GITHUB_CLIENT_ID = get('GITHUB_CLIENT_ID');
export const GITHUB_CLIENT_SECRET = get('GITHUB_CLIENT_SECRET');
export const SERVER_URL = get('SERVER_URL', 'http://localhost:3000');
export const PORT = Number(get('PORT', '3000'));

if (!MONGODB_URI) throw new Error('MONGODB_URI is required');
if (!JWT_SECRET) throw new Error('JWT_SECRET is required');
if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY is required');
if (!GITHUB_CLIENT_ID) throw new Error('GITHUB_CLIENT_ID is required');
if (!GITHUB_CLIENT_SECRET) throw new Error('GITHUB_CLIENT_SECRET is required');
