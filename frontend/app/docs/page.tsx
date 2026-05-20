import { HeatmapBackground } from "../../components/HeatmapBackground";
import { Header, Footer } from "../../components/SiteShell";
export default function Docs() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <HeatmapBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header activeHref="/docs" />

        <main className="flex-1 mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-14">
          <div>
            <h1 className="text-4xl font-semibold text-heading">
              Documentation
            </h1>
            <p className="mt-4 text-lg text-muted">
              Learn how to install, configure, and use LazyPush to schedule your
              Git commits.
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-heading">Install</h2>
              <pre className="mt-4 rounded-md border border-border bg-surface p-4 text-foreground">
                <code>npm install -g lazypush-cli</code>
              </pre>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-heading">
                Quickstart
              </h2>
              <pre className="mt-4 rounded-md border border-border bg-surface p-4 text-foreground whitespace-pre-wrap font-mono text-sm">
                <code>
                  <span className="text-muted">
                    # Authenticate with GitHub OAuth
                  </span>
                  <br />
                  lazypush login
                  <br />
                  <br />
                  <span className="text-muted">
                    # Schedule a push (starts interactive prompt)
                  </span>
                  <br />
                  lazypush schedule
                  <br />
                  <br />
                  <span className="text-muted">
                    # List all active scheduled jobs
                  </span>
                  <br />
                  lazypush jobs
                  <br />
                  <br />
                  <span className="text-muted">
                    # List all jobs (scheduled and finished)
                  </span>
                  <br />
                  lazypush list
                  <br />
                  <br />
                  <span className="text-muted">
                    # Cancel a scheduled job by ID
                  </span>
                  <br />
                  lazypush cancel &lt;id&gt;
                  <br />
                  <br />
                  <span className="text-muted"># Clear local session</span>
                  <br />
                  lazypush logout
                </code>
              </pre>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-heading">Commands</h2>
              <ul className="mt-4 space-y-4">
                <li className="rounded-md border border-border bg-surface p-4">
                  <code className="text-heading font-semibold">login</code>
                  <p className="mt-1 text-sm text-muted">
                    Authenticate with GitHub OAuth. Opens browser for login.
                  </p>
                </li>
                <li className="rounded-md border border-border bg-surface p-4">
                  <code className="text-heading font-semibold">schedule</code>
                  <p className="mt-1 text-sm text-muted">
                    Schedule a push. Auto-detects repo and branch.
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Starts an interactive scheduling prompt.
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Time examples: 5pm, tomorrow 9am, in 2 hours, friday 8pm
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Timezone examples: IST, EST, UTC, America/New_York,
                    Asia/Kolkata
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    If no timezone specified, uses local system timezone.
                  </p>
                </li>
                <li className="rounded-md border border-border bg-surface p-4">
                  <code className="text-heading font-semibold">jobs</code>
                  <p className="mt-1 text-sm text-muted">
                    List all scheduled push jobs.
                  </p>
                </li>
                <li className="rounded-md border border-border bg-surface p-4">
                  <code className="text-heading font-semibold">list</code>
                  <p className="mt-1 text-sm text-muted">
                    List all scheduled and finished jobs (latest first).
                  </p>
                </li>
                <li className="rounded-md border border-border bg-surface p-4">
                  <code className="text-heading font-semibold">
                    cancel &lt;id&gt;
                  </code>
                  <p className="mt-1 text-sm text-muted">
                    Cancel a scheduled job by ID.
                  </p>
                </li>
                <li className="rounded-md border border-border bg-surface p-4">
                  <code className="text-heading font-semibold">logout</code>
                  <p className="mt-1 text-sm text-muted">
                    Clear local session.
                  </p>
                </li>
                <li className="rounded-md border border-border bg-surface p-4">
                  <code className="text-heading font-semibold">help</code>
                  <p className="mt-1 text-sm text-muted">Show command help.</p>
                </li>
              </ul>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
