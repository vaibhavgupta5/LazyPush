import {
  Clock,
  Package,
  Briefcase,
  Key,
  CalendarClock,
  ListChecks,
  XCircle,
  LogOut,
  Terminal,
  GitBranch,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "../components/ThemeToggle";
import { Header, Footer } from "../components/SiteShell";

import { HeatmapBackground } from "../components/HeatmapBackground";


const Prompt = () => <span className="select-none text-green mr-2">$</span>;

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <HeatmapBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header activeHref="#commands" showCommands />

        <main className="flex-1 mx-auto w-full max-w-6xl flex flex-col gap-20 px-6 py-20">
          {/* Hero */}
          <section className="grid gap-12 lg:grid-cols-[1fr_440px] items-center">
            <div className="space-y-7">
              <h1 className="text-[clamp(2rem,5vw,3.25rem)] font-semibold leading-[1.15] tracking-tight text-heading">
                Schedule Git commits
                <br />
                <span className="text-muted">for future push.</span>
                <br />
                No local daemons.
              </h1>

              <p className="text-[17px] leading-[1.75] text-muted max-w-[520px]">
                LazyPush creates a portable git bundle, compresses it, and
                uploads it immediately. Your code gets pushed at exactly the
                time you specify — even when your machine is off.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-md border border-primary-hover bg-primary px-5 py-2.5 text-sm font-semibold text-heading hover:bg-primary-hover transition-colors"
                >
                  Get Started
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href="#commands"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground hover:border-[#8b949e] hover:text-heading transition-colors"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  View Commands
                </a>
              </div>
            </div>

            {/* Quick Start card */}
            <div className="rounded-xl border border-border bg-surface/90 backdrop-blur-sm shadow-2xl overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-border bg-background/60 px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 text-xs text-muted font-mono">
                  terminal
                </span>
              </div>
              <div className="p-5 space-y-3 font-mono text-sm">
                <div className="text-muted text-xs uppercase tracking-widest mb-4">
                  Install &amp; Run
                </div>
                <div className="flex items-center">
                  <Prompt />
                  <span className="text-foreground">
                    npm install -g lazypush-cli
                  </span>
                </div>
                <div className="flex items-center">
                  <Prompt />
                  <span className="text-foreground">lazypush login</span>
                </div>
                <div className="flex items-center">
                  <Prompt />
                  <span className="text-foreground">lazypush schedule</span>
                </div>
                <div className="flex items-center">
                  <Prompt />
                  <span className="text-foreground">lazypush jobs</span>
                </div>
                <div className="flex items-center">
                  <Prompt />
                  <span className="text-foreground">lazypush list</span>
                </div>
                <div className="flex items-center">
                  <Prompt />
                  <span className="text-foreground">
                    lazypush cancel &lt;id&gt;
                  </span>
                </div>
                <div className="flex items-center">
                  <Prompt />
                  <span className="text-foreground">lazypush logout</span>
                </div>
              </div>
            </div>
          </section>

          {/* Feature cards */}
          <section>
            <p className="text-xs uppercase tracking-[0.25em] text-muted mb-6">
              Why LazyPush
            </p>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "Look busy. Ship smart.",
                  body: "Done at 3pm but the sprint ends at 6? Schedule your push for 5:55. Your commit history will never rat you out. LazyPush is the alibi your productivity needed.",
                  icon: <Briefcase className="h-6 w-6 text-green" />,
                  className:
                    "sm:col-span-3 border-green/50 bg-green/5 shadow-[0_0_30px_rgba(63,185,80,0.1)] p-8",
                },
                {
                  title: "Human-readable time",
                  body: 'Use "5pm", "tomorrow 9am", "in 2 hours", or "friday 8pm". Timezone support: IST, EST, UTC, or full IANA names.',
                  icon: <Clock className="h-5 w-5 text-green" />,
                },
                {
                  title: "Auto git detection",
                  body: "Scans your working directory for the git repo and current branch automatically. No configuration files needed.",
                  icon: <GitBranch className="h-5 w-5 text-green" />,
                },
                {
                  title: "Job management",
                  body: "View all scheduled jobs, cancel a specific one by ID, or clear your session. Full control from the terminal.",
                  icon: <ListChecks className="h-5 w-5 text-green" />,
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className={`rounded-lg border border-border bg-surface hover:border-blue transition-colors group ${card.className || "p-5"}`}
                >
                  <div
                    className={`mb-3 inline-flex items-center justify-center rounded-md border border-border bg-background group-hover:border-green transition-colors ${card.className ? "h-12 w-12" : "h-9 w-9"}`}
                  >
                    {card.icon}
                  </div>
                  <h3
                    className={`${card.className ? "text-lg" : "text-sm"} font-semibold text-heading mb-2`}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={`${card.className ? "text-sm max-w-2xl" : "text-xs"} leading-5 text-muted`}
                  >
                    {card.body}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Interactive Demo */}
          <section>
            <p className="text-xs uppercase tracking-[0.25em] text-muted mb-6">
              Interactive CLI
            </p>
            <div className="rounded-xl border border-border bg-surface/90 backdrop-blur-sm shadow-2xl overflow-hidden font-mono text-sm leading-relaxed">
              <div className="flex items-center gap-1.5 border-b border-border bg-background/60 px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <span className="ml-3 text-xs text-muted font-mono">
                  lazypush schedule
                </span>
              </div>
              <div className="p-5 space-y-1.5 overflow-x-auto">
                <div>
                  <span className="text-green">?</span> Date{" "}
                  <span className="text-muted">
                    (dd/mm/yyyy format, or press Enter for today)
                  </span>{" "}
                  <span className="text-blue">20/05/2026</span>
                </div>
                <div>
                  <span className="text-green">?</span> Time{" "}
                  <span className="text-muted">
                    (e.g., 5:30pm, 17:30, 9:15am)
                  </span>{" "}
                  <span className="text-blue">9:00pm</span>
                </div>
                <div>
                  <span className="text-green">?</span> Timezone{" "}
                  <span className="text-muted">(or press Enter for local)</span>{" "}
                  <span className="text-blue">local</span>
                </div>
                <div className="text-muted">
                  ℹ Local timezone: Asia/Calcutta
                </div>
                <div className="text-muted">ℹ </div>
                <div>
                  <span className="text-green">?</span> Commit message{" "}
                  <span className="text-muted">(optional)</span>{" "}
                  <span className="text-blue">testttt cli tmkb</span>
                </div>
                <div className="text-muted">ℹ </div>
                <div className="text-blue">ℹ ═══ PUSH DETAILS ═══</div>
                <div className="text-blue">
                  ℹ Repository: https://github.com/vaibhavgupta5/LazyPush
                </div>
                <div className="text-blue">ℹ Branch: main</div>
                <div className="text-blue">ℹ Commit Message: testttt cli</div>
                <div className="text-blue">ℹ ═══════════════════</div>
                <div className="text-muted">ℹ </div>
                <div>
                  <span className="text-green">?</span> Confirm scheduling?{" "}
                  <span className="text-blue">Yes</span>
                </div>
                <div className="text-muted">ℹ Parsing scheduled time...</div>
                <div className="text-muted">
                  ℹ Scheduled for: 5/20/2026, 9:00:00 PM UTC
                </div>
                <div className="text-muted">ℹ Creating git bundle...</div>
                <div className="text-muted">ℹ Compressing bundle...</div>
                <div className="text-muted">ℹ Encoding to base64...</div>
                <div className="text-muted">ℹ Uploading to backend...</div>
                <div className="text-green">
                  ✓ Job scheduled! ID: 6a0dd278c2dcaedb805baf3c
                </div>
                <div className="text-green">
                  ℹ Push will occur at: 5/20/2026, 9:00:00 PM
                </div>
              </div>
            </div>
          </section>

          {/* Commands */}
          <section id="commands">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted mb-1">
                  Reference
                </p>
                <h2 className="text-2xl font-semibold text-heading">
                  Commands
                </h2>
              </div>
              <Link
                className="text-sm text-green hover:text-green font-medium flex items-center gap-1 transition-colors"
                href="/docs"
              >
                Full docs <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="border-b border-border bg-background/40 px-5 py-3 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-muted" />
                <span className="text-xs text-muted font-mono">
                  lazypush &lt;command&gt;
                </span>
              </div>
              <div className="divide-y divide-border">
                {[
                  {
                    cmd: "login",
                    syntax: "lazypush login",
                    desc: "Authenticate with GitHub OAuth. Opens browser for login.",
                    icon: <Key className="h-4 w-4 text-muted" />,
                  },
                  {
                    cmd: "schedule",
                    syntax: "lazypush schedule",
                    desc: "Starts an interactive scheduling prompt. Auto-detects repo and branch.",
                    icon: <CalendarClock className="h-4 w-4 text-muted" />,
                  },
                  {
                    cmd: "jobs",
                    syntax: "lazypush jobs",
                    desc: "List all scheduled push jobs.",
                    icon: <ListChecks className="h-4 w-4 text-muted" />,
                  },
                  {
                    cmd: "list",
                    syntax: "lazypush list",
                    desc: "List all scheduled and finished jobs (latest first).",
                    icon: <ListChecks className="h-4 w-4 text-muted" />,
                  },
                  {
                    cmd: "cancel",
                    syntax: "lazypush cancel <id>",
                    desc: "Cancel a scheduled job by ID.",
                    icon: <XCircle className="h-4 w-4 text-muted" />,
                  },
                  {
                    cmd: "logout",
                    syntax: "lazypush logout",
                    desc: "Clear local session.",
                    icon: <LogOut className="h-4 w-4 text-muted" />,
                  },
                  {
                    cmd: "help",
                    syntax: "lazypush help",
                    desc: "Show command help.",
                    icon: <Terminal className="h-4 w-4 text-muted" />,
                  },
                ].map(({ cmd, syntax, desc, icon }) => (
                  <div
                    key={cmd}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-background/40 transition-colors"
                  >
                    <div className="mt-0.5 flex-shrink-0">{icon}</div>
                    <div className="min-w-0">
                      <div className="font-mono text-sm text-heading mb-1">
                        {syntax}
                      </div>
                      <div className="text-xs text-muted leading-5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
