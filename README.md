# LazyPush ;)

<div align="center">

[![npm version](https://img.shields.io/npm/v/lazypush?color=3fb950&label=lazypush&logo=npm&style=flat-square)](https://www.npmjs.com/package/lazypush)
[![npm downloads](https://img.shields.io/npm/dm/lazypush?color=58a6ff&style=flat-square)](https://www.npmjs.com/package/lazypush)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org)
[![GitHub Stars](https://img.shields.io/github/stars/vaibhavgupta5/LazyPush?style=flat-square&color=ffd700)](https://github.com/vaibhavgupta5/LazyPush)

**Look busy. Ship smart.**

*Done at 3pm but the sprint ends at 6? Schedule your push for 5:55. Your commit history will never rat you out. LazyPush is the alibi your productivity needed.*

[Website](https://lazypush.dev) · [Docs](https://lazypush.dev/docs) · [Support](https://lazypush.dev/support)

</div>

---

## What is LazyPush?

LazyPush is a zero-config CLI tool that schedules Git commits for a future push — without running a background daemon on your machine. You finish your work, tell it *when* to push, shut your laptop, and go outside.

The push happens on the cloud. Your commit timestamp reflects exactly when you said it would. Nobody needs to know you wrapped up at noon.

```
lazypush schedule
? Date (dd/mm/yyyy)   20/05/2026
? Time                5:55pm
? Timezone            IST
? Commit message      fix: edge case in auth middleware

ℹ ═══════════════════════════════
ℹ  Repository: github.com/you/repo
ℹ  Branch:     main
ℹ ═══════════════════════════════

✓ Job scheduled! ID: 6a0dd278c2dcaedb805baf3c
ℹ Push will occur at: 5/20/2026, 5:55:00 PM
```

---

## How It Works

```
┌──────────────┐       ┌────────────────────┐       ┌──────────────┐
│   Your CLI   │──────▶│  LazyPush Backend  │──────▶│    GitHub    │
│              │       │                    │       │              │
│ lazypush     │  1.   │  Stores encrypted  │  4.   │  Push lands  │
│ schedule     │  Job  │  git bundle +      │  At   │  at exactly  │
│              │  ────▶│  metadata in DB    │  T    │  your time   │
│ Shut laptop. │       │                    │  ────▶│              │
│ Go outside.  │  2.   │  Cron worker polls │       │              │
└──────────────┘  Done │  every 60 seconds  │       └──────────────┘
                  ◀────│  Executes at T     │
                       └────────────────────┘
```

**Step by step:**

| Step | What happens |
|------|-------------|
| 1    | CLI detects your git repo and current branch automatically |
| 2    | Creates a portable `git bundle`, compresses + base64 encodes it |
| 3    | Uploads the bundle + schedule metadata to the backend via JWT-authenticated API |
| 4    | Backend stores the job in MongoDB with status `scheduled` |
| 5    | Cloud worker polls MongoDB every 60 seconds |
| 6    | At scheduled time: decrypts your OAuth token, restores the bundle, rewrites commit timestamps, pushes via GitHub API, marks job `done`, cleans up |

---

## Monorepo Structure

```
LazyPush/
├── lazypush-cli/      # npm package — the tool you install globally
├── backend/           # Hono + MongoDB — the cloud worker that does the actual push
├── frontend/          # Next.js — lazypush.dev landing page, docs, support
└── README.md          # you are here
```

---

## Quick Install

```bash
npm install -g lazypush
```

```bash
lazypush login       # One-time GitHub OAuth
lazypush schedule    # Interactive prompt — pick date, time, timezone, message
lazypush jobs        # See what's queued
lazypush list        # Full history — scheduled + done
lazypush cancel <id> # Changed your mind?
lazypush logout      # Clear session
```

---

## Architecture

### Backend Stack

| Layer | Technology |
|-------|-----------|
| HTTP Server | Hono (lightweight, fast) |
| Database | MongoDB via Mongoose |
| Auth | JWT (30-day expiry) |
| Token Storage | AES-256-GCM encrypted |
| Job Worker | Single-process cron polling (60s) |
| Deployment | Docker / Fly.io |

### CLI Stack

| Layer | Technology |
|-------|-----------|
| Command parsing | Commander.js |
| Git operations | `child_process` (git bundle + gzip) |
| Time parsing | Human-readable (5pm, tomorrow 9am, in 2 hours) |
| Session | `~/.lazypush/session.json` |
| Output | Colored terminal via custom logger |

### Data Flow: Git Bundle

```
Your repo
   │
   ▼
git bundle create repo.bundle HEAD
   │
   ▼
gzip → base64 encode
   │
   ▼
POST /jobs (authenticated)
   │
   ▼
MongoDB { bundleBase64, scheduledAt, repoUrl, branch, ... }
   │
   ▼
Worker at T:
  base64 decode → gunzip → git clone --bare → rewrite timestamps → git push
```

---

## Security

| Concern | Approach |
|---------|---------|
| GitHub OAuth tokens | AES-256-GCM encrypted at rest, decrypted only during push |
| CLI session | Stored in `~/.lazypush/` (OS file permission protected) |
| API auth | JWT required on all non-auth routes |
| Git bundles | Stored in MongoDB, deleted immediately after successful push |
| Secrets | Environment variables only, never hardcoded |

---

## Roadmap

- [ ] Shell completion (bash, zsh, fish)
- [ ] Email / webhook notifications on job completion
- [ ] BullMQ support for horizontal worker scaling
- [ ] Rate limiting per user
- [ ] Job retry with exponential backoff
- [ ] CLI config file (default timezone, API URL)

---

## Contributing

```bash
git clone https://github.com/vaibhavgupta5/LazyPush
cd LazyPush

# Backend
cd backend && npm install && npm run dev

# CLI (local link)
cd lazypush-cli && npm install && npm link
lazypush login

# Frontend
cd frontend && npm install && npm run dev
```

---

## License

MIT © [Vaibhav Gupta](https://github.com/vaibhavgupta5)
