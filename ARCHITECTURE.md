LazyPush Architecture & Deployment

Overall Flow:

1. User runs: lazypush schedule "5pm"
2. CLI detects git repo, creates bundle, compresses to base64
3. CLI uploads bundle + metadata to backend via authenticated API
4. Backend stores job in MongoDB with status "scheduled"
5. Cron worker polls MongoDB every 60 seconds
6. At scheduled time, worker:
   - Decrypts user GitHub token
   - Restores bundle in temp dir
   - Rewrites commit timestamp
   - Pushes using OAuth token
   - Marks job "done" or "failed"
   - Cleans up temp files

Backend Architecture:

Server:
- Hono HTTP framework
- MongoDB via mongoose ORM
- JWT token auth for CLI
- AES-256-GCM encrypted OAuth token storage

Worker:
- Single-threaded polling every 60 seconds
- Runs in same process as HTTP server
- Atomic job locking via MongoDB updates
- Retry logic with exponential backoff (optional future)

Data Models:

User:
  - githubId (unique)
  - username
  - tokenEncrypted (AES-256-GCM)
  - createdAt

Job:
  - userId (ref)
  - repoUrl
  - branch
  - scheduledAt
  - status: scheduled | processing | failed | done
  - bundleBase64
  - attempts
  - lastError
  - createdAt

CLI Architecture:

Commands via Commander.js:
- login: Opens browser, receives JWT token, stores in ~/.lazypush/session.json
- schedule: Bundles repo, uploads to backend
- jobs: Lists all scheduled jobs
- cancel: Marks job for deletion
- logout: Clears local session

Session Storage:
- ~/.lazypush/session.json (token + userId + username)
- JSON (unencrypted, relies on OS file permissions)

Git Operations:

1. git bundle create repo.bundle HEAD
2. gzip repo.bundle
3. base64 encode
4. Upload to backend

Backend restores:
1. base64 decode to get bundle
2. gunzip
3. git clone --bare from bundle
4. Set GIT_AUTHOR_DATE and GIT_COMMITTER_DATE
5. git push via OAuth token

Deployment Strategy:

Development:
- Backend: npm run dev (local MongoDB Atlas)
- CLI: npm run dev or npm install -g . (local linking)
- Test: lazypush schedule "in 1 minute"

Production:

Backend:
- Build Docker image: docker build -t lazypush-backend .
- Run container with env vars
- GitHub Actions, Vercel, Fly.io, Heroku, or any Docker host
- Single-server deployable (worker + HTTP in one process)

CLI:
- npm publish --access public
- Users install: npm install -g lazypush
- Set LAZYPUSH_API env var to point to backend

Example Fly.io Deployment:

fly launch
# Set MONGODB_URI, JWT_SECRET, ENCRYPTION_KEY, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET
# Set SERVER_URL to https://app.fly.dev
fly deploy

Example GitHub Actions for CI/CD:

name: Deploy Backend
on: push
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: myrepo/lazypush:latest
          secrets: |
            REGISTRY_USERNAME=${{ secrets.DOCKER_USER }}
            REGISTRY_PASSWORD=${{ secrets.DOCKER_PASS }}

Security Considerations:

1. OAuth Token Storage:
   - Encrypted at rest using AES-256-GCM
   - Never logged or printed
   - Decrypted only when pushing (in secure temp dir)
   - Temp files cleaned up after push

2. JWT Tokens:
   - 30-day expiry (configurable)
   - Signed with JWT_SECRET
   - CLI stores in ~/.lazypush/ (protected by OS permissions)

3. Git Bundle Security:
   - Base64 bundle stored in MongoDB (not uploaded to S3)
   - Deleted after successful push
   - No intermediate S3 access keys needed

4. API Security:
   - All routes require JWT auth (except /auth endpoints)
   - HTTPS recommended in production
   - Rate limiting should be added per user/endpoint
   - Input validation on all endpoints

5. Secrets Management:
   - Production: Use environment secrets (GitHub Actions, Vercel, Fly, etc.)
   - Never hardcode secrets
   - Rotate JWT_SECRET and ENCRYPTION_KEY periodically
   - Use dedicated secrets managers for key rotation

Scaling Path (Future Upgrades):

1. Rate Limiting:
   - Add redis-based token bucket per user
   - Limit job creation and bundle size

2. Retry & Backoff:
   - Store nextRetryAt instead of immediate processing
   - Exponential backoff for failed jobs
   - Max retry count before permanent failure

3. Multiple Workers:
   - Migrate to BullMQ (requires Redis)
   - Horizontal scaling of job processors
   - Load balancing across workers

4. Webhook Notifications:
   - User webhooks on job success/failure
   - Email notifications via SendGrid or AWS SES
   - Slack/Discord integration

5. Job History & Cleanup:
   - Archive completed jobs after 30 days
   - Separate archive collection or S3
   - Keep recent jobs in hot MongoDB

6. CLI Enhancements:
   - Config file for default time zone and API URL
   - Prompt for scheduling if no time given
   - Shell completion (bash, zsh, fish)
   - Update checker (npm outdated equivalent)

7. Backend Observability:
   - Structured logging (Winston, Pino)
   - Metrics collection (Prometheus)
   - Error tracking (Sentry)
   - APM (DataDog, New Relic)

8. Database Sharding:
   - Partition jobs by userId
   - Separate read replicas for listing jobs
   - Connection pooling via MongoDB Atlas

Architecture Decisions:

Why Single Process?
- Minimal infrastructure for "free-first" goal
- No additional memory/cost for separate workers
- Easier development and deployment

Why MongoDB (not PostgreSQL)?
- Flexible schema for bundle storage
- Built-in TTL for automatic cleanup
- Atlas free tier sufficient for MVP
- No Prisma setup overhead

Why Cron Polling (not event-driven)?
- No Redis or background job queue needed
- Reliable for "laptop shutdown" constraint
- Simpler failure recovery
- 60-second polling is acceptable for "later" use case

Why Local Session (not cloud)?
- CLI has zero backend state dependency
- Works offline after login
- No additional database queries
- OS file permissions sufficient

Future: Event-Driven Architecture

When scaling, consider:
- Scheduled jobs trigger webhooks
- Event stream (Kafka) for job state changes
- Multi-region deployment with event replication
- Fan-out to notification workers

Production Checklist:

- [ ] Set MONGODB_URI to production cluster
- [ ] Generate random JWT_SECRET (min 32 chars)
- [ ] Generate random ENCRYPTION_KEY (32-byte base64)
- [ ] Create GitHub OAuth app with correct callback URL
- [ ] Set SERVER_URL to production domain
- [ ] Enable HTTPS/TLS on backend
- [ ] Add health check endpoint for load balancer
- [ ] Configure backup for MongoDB
- [ ] Set up error logging (Sentry, etc.)
- [ ] Enable rate limiting
- [ ] Document rollback procedure
- [ ] Test disaster recovery scenario

