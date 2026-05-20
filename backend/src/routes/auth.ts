import { Hono } from 'hono';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { getAuthorizeUrl, exchangeCodeForToken } from '../services/github';
import { encrypt } from '../utils/crypto';
import { JWT_SECRET } from '../config';

const auth = new Hono();

auth.get('/github', (c) => {
  const state = Math.random().toString(36).slice(2);
  const url = getAuthorizeUrl(state);
  return c.redirect(url);
});

auth.get('/callback', async (c) => {
  const code = c.req.query('code') || '';
  if (!code) return c.text('Missing code', 400);
  const token = await exchangeCodeForToken(code);
  // fetch user info from GitHub
  const resp = await fetch('https://api.github.com/user', {
    headers: { Authorization: `token ${token}`, Accept: 'application/json' }
  });
  const profile = await resp.json();
  if (!profile || !profile.id) return c.text('GitHub user fetch failed', 500);
  const encrypted = encrypt(token);
  const user = await User.findOneAndUpdate(
    { githubId: String(profile.id) },
    { githubId: String(profile.id), username: profile.login, tokenEncrypted: encrypted },
    { upsert: true, new: true }
  );
  const jwtToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '30d' });
  return c.json({ token: jwtToken, user: { id: user._id, username: user.username } });
});

export default auth;
