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

export async function getGitHubIdentity(token: string): Promise<{ name: string; email: string }> {
  const res = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const user = await res.json() as { id: number; login: string; name?: string | null; email?: string | null };

  const email = user.email ?? `${user.id}+${user.login}@users.noreply.github.com`;
  const name = user.name ?? user.login;

  return { name, email };
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
