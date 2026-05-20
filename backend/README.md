LazyPush backend

Overview:
- Node.js + TypeScript backend using Hono and MongoDB
- GitHub OAuth for user tokens
- Cron-style worker polls MongoDB every minute to process scheduled bundle pushes

Run locally:

1. Copy `.env.example` to `.env` and fill values
2. Install dependencies: `npm install`
3. Run in dev: `npm run dev`

Docker:

Build:
`docker build -t lazypush-backend .`

Run (MongoDB Atlas):
`docker run --rm -p 3000:3000 --env-file .env lazypush-backend`
