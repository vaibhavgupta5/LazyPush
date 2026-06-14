import { Hono } from 'hono';
import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';
import { getAuthorizeUrl, exchangeCodeForToken } from '../services/github';
import { encrypt } from '../utils/crypto';
import { JWT_SECRET } from '../config';

const auth = new Hono();

auth.get('/github', (c) => {
  const cliRedirectUri = c.req.query('redirect_uri') || '';
  // Encode CLI redirect URI in state so we can access it in callback
  const state = btoa(JSON.stringify({ cliRedirectUri }));
  const url = getAuthorizeUrl(state);
  return c.redirect(url);
});

auth.get('/callback', async (c) => {
  const code = c.req.query('code') || '';
  const state = c.req.query('state') || '';
  
  if (!code) return c.text('Missing code', 400);
  
  let cliRedirectUri = '';
  try {
    if (state) {
      const decoded = JSON.parse(atob(state));
      cliRedirectUri = decoded.cliRedirectUri || '';
    }
  } catch (e) {
    // State decode error, continue without CLI redirect
  }
  
  try {
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
    
    const jwtToken = jwt.sign({ userId: String(user._id), username: user.username, exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 }, JWT_SECRET);
    
    // If a redirect_uri was provided (from CLI or web frontend), redirect there with token
    if (cliRedirectUri) {
      return c.redirect(`${cliRedirectUri}?token=${encodeURIComponent(jwtToken)}`);
    }
    
    // Otherwise return JSON (for web clients)
    return c.json({ token: jwtToken, user: { id: user._id, username: user.username } });
  } catch (e: any) {
    return c.text(`Authentication failed: ${e.message}`, 500);
  }
});

export default auth;
