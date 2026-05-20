# lazypush-cli

<div align="center">

[![npm version](https://img.shields.io/npm/v/lazypush?color=3fb950&label=lazypush&logo=npm&style=flat-square)](https://www.npmjs.com/package/lazypush)
[![npm downloads](https://img.shields.io/npm/dm/lazypush?color=58a6ff&style=flat-square)](https://www.npmjs.com/package/lazypush)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../LICENSE)

*Schedule Git commits for a future push — no local daemons, no open terminals, no guilt.*

</div>

---

## The Problem

You finished the feature at 2pm. The standup is at 10am tomorrow. Pushing now means everyone knows you had the afternoon free, and guess who gets the next ticket assigned in 4 minutes?

LazyPush lets you schedule the push for later. Your git history stays clean. Your commit timestamp is exactly what you want it to be. You get your afternoon back.

---

## Install

```bash
npm install -g lazypush
```

---

## Quickstart

```bash
# Step 1: one-time login
lazypush login

# Step 2: schedule a push from inside your git repo
lazypush schedule
```

You'll see an interactive prompt:

```
? Date (dd/mm/yyyy format, or press Enter for today)  20/05/2026
? Time (e.g., 5:30pm, 17:30, 9:15am)                 9:00pm
? Timezone (or press Enter for local)                 IST
ℹ Local timezone: Asia/Calcutta

? Commit message (optional)                           fix: handle null user

ℹ ═══ PUSH DETAILS ═══
ℹ Repository: https://github.com/you/your-repo
ℹ Branch:     main
ℹ Commit Message: fix: handle null user
ℹ ═══════════════════

? Confirm scheduling?  Yes

ℹ Parsing scheduled time...
ℹ Scheduled for: 5/20/2026, 9:00:00 PM UTC
ℹ Creating git bundle...
ℹ Compressing bundle...
ℹ Encoding to base64...
ℹ Uploading to backend...
✓ Job scheduled! ID: 6a0dd278c2dcaedb805baf3c
ℹ Push will occur at: 5/20/2026, 9:00:00 PM
```

Shut your laptop. The push will happen in the cloud at exactly that time.

---

## Commands

| Command | Description |
|---------|-------------|
| `lazypush login` | Authenticate via GitHub OAuth. Opens browser, stores JWT locally. |
| `lazypush schedule` | Interactive prompt to schedule a push. Auto-detects repo and branch. |
| `lazypush jobs` | List all currently scheduled (pending) jobs. |
| `lazypush list` | List all jobs — scheduled and finished — latest first. |
| `lazypush cancel <id>` | Cancel a scheduled job by its ID. |
| `lazypush logout` | Clear local session. |
| `lazypush help` | Show all commands and options. |

---

## Time Format

The time prompt accepts natural human input:

| Input | Meaning |
|-------|---------|
| `5pm` | Today at 5:00 PM |
| `17:30` | Today at 5:30 PM (24h) |
| `tomorrow 9am` | Next day at 9:00 AM |
| `in 2 hours` | 2 hours from now |
| `friday 8pm` | Coming Friday at 8:00 PM |

Timezone examples: `IST`, `EST`, `UTC`, `America/New_York`, `Asia/Kolkata`

If no timezone is provided, your system's local timezone is used.

---

## How It Works

```
Inside your repo:
┌──────────────────────────────────────────────────────────────┐
│  lazypush schedule                                           │
│                                                              │
│  1. git bundle create repo.bundle HEAD                       │
│  2. gzip repo.bundle                                         │
│  3. base64 encode                                            │
│  4. POST /jobs  { bundle, scheduledAt, repoUrl, branch }     │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
              LazyPush Backend (cloud)
              Stores job → polls every 60s
              At T: restores bundle, rewrites timestamps, pushes
```

No background process runs on your machine after `schedule` completes. The CLI's job ends the moment the upload finishes.

---

## Session Storage

After `lazypush login`, credentials are stored at:

```
~/.lazypush/session.json
```

```json
{
  "token": "<jwt>",
  "userId": "...",
  "username": "vaibhavgupta5"
}
```

Protected by OS file permissions. Run `lazypush logout` to clear it.

---

## Source Structure

```
src/
├── cli.ts              # Entry point — command registration via Commander.js
├── config.ts           # Session read/write (~/.lazypush/session.json)
├── logger.ts           # Colored terminal output (✓ green, ✗ red, ℹ blue)
├── api/
│   └── client.ts       # Authenticated HTTP client to backend
├── commands/
│   ├── login.ts        # OAuth flow + token storage
│   ├── schedule.ts     # Interactive prompt + bundle upload
│   ├── jobs.ts         # Fetch and display active jobs
│   ├── list.ts         # Fetch and display all jobs
│   ├── cancel.ts       # Cancel job by ID
│   └── logout.ts       # Clear session
└── utils/
    ├── git.ts          # git bundle, gzip, base64
    └── scheduler.ts    # Human-readable time parsing
```

---

## Development

```bash
npm install
npm run dev        # ts-node-dev with auto-reload

# link locally to test as a global command
npm link
lazypush login
```

## Build & Publish

```bash
npm run build      # tsc → dist/
npm publish --access public
```

---

## License

MIT © [Vaibhav Gupta](https://github.com/vaibhavgupta5)
