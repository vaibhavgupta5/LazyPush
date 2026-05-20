# lazypush-backend

<div align="center">

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org)
[![Hono](https://img.shields.io/badge/hono-v4-orange?style=flat-square)](https://hono.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/atlas)
[![Docker](https://img.shields.io/badge/docker-ready-2496ED?style=flat-square&logo=docker)](https://www.docker.com)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../LICENSE)

*The cloud brain behind LazyPush — receives your git bundles, holds them securely, and pushes them to GitHub at exactly the time you specified.*

</div>

---

## Overview

The backend is a single deployable service that combines:
- An **HTTP API** for the CLI to authenticate and submit jobs
- A **cron worker** that polls MongoDB every 60 seconds and executes due jobs

Both run in the same process — no separate worker infrastructure needed.

```
┌─────────────────────────────────────────────────────────────┐
│                   lazypush-backend                          │
│                                                             │
│   ┌──────────────┐          ┌──────────────────────────┐   │
│   │  Hono HTTP   │          │    Cron Worker (60s)     │   │
│   │  API Server  │          │                          │   │
│   │              │          │  Poll: status=scheduled  │   │
│   │  POST /jobs  │          │  AND scheduledAt ≤ now   │   │
│   │  GET  /jobs  │  MongoDB │                          │   │
│   │  DELETE /job │ ◀──────▶ │  For each due job:       │   │
│   │  GET  /auth  │          │   - Decrypt OAuth token  │   │
│   │              │          │   - Restore git bundle   │   │
│   └──────────────┘          │   - Rewrite timestamps   │   │
│                             │   - git push → GitHub    │   │
│                             │   - Mark done / failed   │   │
│                             │   - Clean up temp files  │   │
│                             └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Stack

| Component | Technology | Reason |
|-----------|-----------|--------|
| HTTP server | [Hono](https://hono.dev) + `@hono/node-server` | Minimal overhead, fast routing, TypeScript-native |
| Database | MongoDB via Mongoose | Flexible schema, built-in TTL, Atlas free tier |
| Auth | JWT (30-day expiry) | Stateless, simple CLI integration |
| Token security | AES-256-GCM | GitHub OAuth tokens encrypted at rest |
| Job execution | `child_process` (git CLI) | Reliable, no git library abstractions |
| Deployment | Docker / Fly.io | Single container, no orchestration needed |

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/auth/github` | — | Initiates GitHub OAuth flow |
| `GET` | `/auth/github/callback` | — | OAuth callback — issues JWT |
| `POST` | `/jobs` | JWT | Create a scheduled push job |
| `GET` | `/jobs` | JWT | List pending (scheduled) jobs |
| `GET` | `/jobs/all` | JWT | List all jobs (history) |
| `DELETE` | `/jobs/:id` | JWT | Cancel a job |
| `GET` | `/health` | — | Health check |

---

## Data Models

### User

```
User {
  githubId        String   (unique, indexed)
  username        String
  tokenEncrypted  String   (AES-256-GCM, includes IV + auth tag)
  createdAt       Date
}
```

### Job

```
Job {
  userId          ObjectId  (ref: User)
  repoUrl         String
  branch          String
  scheduledAt     Date      (indexed for worker polling)
  status          Enum      scheduled | processing | done | failed
  bundleBase64    String    (gzipped git bundle, base64 encoded)
  commitMessage   String?
  attempts        Number    (default: 0)
  lastError       String?
  createdAt       Date
}
```

---

## Worker Logic

```
Every 60 seconds:

  db.jobs.findOneAndUpdate(
    { status: "scheduled", scheduledAt: { $lte: now } },
    { $set: { status: "processing" } }
  )
  // Atomic lock — prevents double-execution

  if (job found):
    1. Decrypt user's GitHub OAuth token (AES-256-GCM)
    2. Decode base64 bundle → gunzip → write to /tmp/<jobId>/
    3. git clone --bare from bundle
    4. Set GIT_AUTHOR_DATE and GIT_COMMITTER_DATE to scheduledAt
    5. git push https://<token>@github.com/<repo> <branch>
    6. Mark job status: "done"
    7. Delete temp directory
    8. Clear bundleBase64 from DB (cleanup)

  on error:
    increment attempts
    mark status: "failed"
    store lastError
```

---

## Security

| Concern | Implementation |
|---------|---------------|
| GitHub OAuth tokens | AES-256-GCM encrypted before storage, decrypted only in-memory during push |
| JWT expiry | 30-day tokens, signed with `JWT_SECRET` |
| Temp files | Isolated per-job `/tmp/<jobId>/` directories, deleted immediately after push |
| Bundle cleanup | `bundleBase64` field cleared from MongoDB after successful push |
| API protection | All job routes require `Authorization: Bearer <jwt>` header |
| Secret management | All secrets via environment variables — never hardcoded |

---

## Environment Variables

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<min 32 char random string>
ENCRYPTION_KEY=<32-byte base64 key>
GITHUB_CLIENT_ID=<from GitHub OAuth app>
GITHUB_CLIENT_SECRET=<from GitHub OAuth app>
SERVER_URL=https://your-backend-domain.com
PORT=3000
```

---

## Running Locally

```bash
npm install
cp .env.example .env   # fill in your values

npm run dev            # ts-node-dev with auto-reload
```

The server starts on `http://localhost:3000` and the cron worker starts in the same process.

---

## Docker

```bash
# Build
docker build -t lazypush-backend .

# Run
docker run -p 3000:3000 \
  -e MONGODB_URI=... \
  -e JWT_SECRET=... \
  -e ENCRYPTION_KEY=... \
  -e GITHUB_CLIENT_ID=... \
  -e GITHUB_CLIENT_SECRET=... \
  -e SERVER_URL=https://... \
  lazypush-backend
```

---

## Deploy to Fly.io

```bash
fly launch
fly secrets set \
  MONGODB_URI="..." \
  JWT_SECRET="..." \
  ENCRYPTION_KEY="..." \
  GITHUB_CLIENT_ID="..." \
  GITHUB_CLIENT_SECRET="..." \
  SERVER_URL="https://your-app.fly.dev"
fly deploy
```

---

## Source Structure

```
src/
├── server.ts          # HTTP server + Hono app bootstrap
├── worker.ts          # Cron job runner (60s polling loop)
├── config.ts          # Env var loading and validation
├── logger.ts          # Structured console logging
├── models/
│   ├── User.ts        # Mongoose User schema
│   └── Job.ts         # Mongoose Job schema
├── routes/
│   ├── auth.ts        # GitHub OAuth + JWT issuance
│   └── jobs.ts        # Job CRUD endpoints
├── services/
│   └── pushService.ts # Bundle restore + git push logic
└── utils/
    ├── crypto.ts      # AES-256-GCM encrypt/decrypt
    └── git.ts         # Child process git operations
```

---

## Production Checklist

- [ ] `MONGODB_URI` points to production Atlas cluster with backups enabled
- [ ] `JWT_SECRET` is randomly generated (min 32 chars)
- [ ] `ENCRYPTION_KEY` is a 32-byte base64 random value
- [ ] GitHub OAuth app callback URL matches `SERVER_URL`
- [ ] HTTPS enabled on the backend domain
- [ ] Health check endpoint monitored (`GET /health`)
- [ ] Error logging configured (Sentry recommended)
- [ ] Rate limiting added per user/IP
- [ ] MongoDB indexed on `{ status, scheduledAt }` for worker polling

---

## License

MIT © [Vaibhav Gupta](https://github.com/vaibhavgupta5)
