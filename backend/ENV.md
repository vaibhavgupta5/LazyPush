
LazyPush backend env reference

Who provides what

- Deployer (app operator): `MONGODB_URI`, `JWT_SECRET`, `ENCRYPTION_KEY`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `SERVER_URL`, `PORT`.
- End users: nothing in `.env`. End users authenticate via GitHub OAuth in the running app; their access tokens are obtained at runtime and stored encrypted by the backend.

Variables

- `MONGODB_URI`
	- MongoDB Atlas connection string. Provided by the deployer.

- `JWT_SECRET`
	- Secret for signing server JWTs (session tokens). Provided by the deployer. Use a long random value.

- `ENCRYPTION_KEY`
	- AES-256-GCM key used to encrypt user OAuth tokens at rest.
	- Must be a 32-byte key encoded in base64 and prefixed with `base64:`. Example: `ENCRYPTION_KEY=base64:Wm...`.
	- Provided by the deployer. Do not share with end users.

- `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`
	- OAuth app credentials for the deployer's GitHub OAuth App. Provided by the deployer.
	- End users will sign in through GitHub; they do not supply these values.

- `SERVER_URL`
	- Public base URL used for OAuth redirect (e.g. `https://app.example.com` or `http://localhost:3000`). Provided by the deployer.

- `PORT`
	- HTTP port to bind the server (default `3000`). Provided by the deployer.

Key generation examples

- OpenSSL / WSL / macOS:
	```bash
	openssl rand -base64 32
	# prefix with `base64:` when setting ENCRYPTION_KEY
	```

- Node (cross-platform):
	```bash
	node -e "console.log('base64:'+require('crypto').randomBytes(32).toString('base64'))"
	```

Security notes

- Never commit `.env` to git. Use a secrets manager for production (Vault, cloud secrets, GitHub Actions secrets, etc.).
- Rotate `ENCRYPTION_KEY` and `JWT_SECRET` periodically; plan for key rotation in production.

