import fetch from 'node-fetch';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SERVER_URL } from '../config';

export async function exchangeCodeForToken(code: string): Promise<string> {
  const url = 'https://github.com/login/oauth/access_token';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code })
  });
  const body = await res.json();
  if (body.error) throw new Error(body.error_description || 'GitHub token exchange failed');
  return body.access_token as string;
}

export function getAuthorizeUrl(state: string) {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: 'repo',
    redirect_uri: `${SERVER_URL}/auth/callback`,
    state
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
}
