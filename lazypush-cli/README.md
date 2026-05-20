LazyPush CLI

Schedule Git commits for future push without local daemons.

Install:

npm install -g lazypush

Quickstart:

lazypush login
lazypush schedule --at 5pm
lazypush schedule --at 5pm --tz IST
lazypush schedule --at "tomorrow 9am" --tz EST
lazypush jobs
lazypush cancel <id>
lazypush logout

Commands:

login
  Authenticate with GitHub OAuth. Opens browser for login.

schedule --at <time> [--tz <timezone>] [-m <message>]
  Schedule a push. Auto-detects repo and branch.
  Time examples: 5pm, tomorrow 9am, in 2 hours, friday 8pm
  Timezone examples: IST, EST, UTC, America/New_York, Asia/Kolkata
  If no timezone specified, uses local system timezone.

jobs
  List all scheduled push jobs.

cancel <id>
  Cancel a scheduled job by ID.

logout
  Clear local session.

Features:

- Auto-detects git repo and branch
- Creates portable git bundle
- Compresses and uploads immediately
- Parses human-readable time format
- Zero config, no setup needed
- Works in any git repo

Development:

npm install
npm run dev

Build:

npm run build
npm start

Publishing to npm:

npm publish --access public

Architecture:

- cli.ts: Main entry point and command routing
- config.ts: Session and local storage
- logger.ts: Colored terminal output
- utils/git.ts: Git operations (bundle, compress, base64)
- utils/scheduler.ts: Time parsing
- api/client.ts: Backend communication
- commands/: Command implementations
