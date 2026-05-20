import { Mail } from "lucide-react";
import { HeatmapBackground } from "../../components/HeatmapBackground";
import { Header, Footer } from "../../components/SiteShell";
export default function Support() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
      <HeatmapBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header activeHref="/support" />

        <main className="flex-1 mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-14">
          <div>
            <h1 className="text-4xl font-semibold text-heading">Support</h1>
            <p className="mt-4 text-lg text-muted">
              {"Need help with LazyPush? We're here for you."}
            </p>
          </div>

          <div className="space-y-8">
            <section className="rounded-lg border border-border bg-surface p-8 text-center">
              <h2 className="text-2xl font-semibold text-heading">
                Contact Us
              </h2>
              <p className="mt-4 text-muted">
                For any questions, issues, or feature requests, please reach out
                via email.
              </p>
              <div className="mt-6 flex justify-center">
                <a
                  href="mailto:vaibhavgupta.v890@gmail.com"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-primary-hover bg-primary px-6 py-3 text-sm font-medium text-heading hover:bg-primary-hover transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  vaibhavgupta.v890@gmail.com
                </a>
              </div>
            </section>

            <section className="rounded-lg border border-border bg-surface p-8 text-center">
              <h2 className="text-2xl font-semibold text-heading">
                Connect on Social Media
              </h2>
              <p className="mt-4 text-muted">
                Follow updates, report bugs, or just say hi on our social
                platforms:
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <a
                  href="https://x.com/vaixbhav_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-background p-6 text-foreground hover:border-blue hover:text-heading transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface group-hover:bg-[#58a6ff]/10 group-hover:text-blue transition-colors">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="currentColor"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </div>
                  <span className="font-medium">X (Twitter)</span>
                </a>
                <a
                  href="https://github.com/vaibhavgupta5"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-background p-6 text-foreground hover:border-green hover:text-heading transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface group-hover:bg-green/10 group-hover:text-green transition-colors">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                      <path d="M9 18c-4.51 2-5-2-7-2" />
                    </svg>
                  </div>
                  <span className="font-medium">GitHub</span>
                </a>
                <a
                  href="https://www.linkedin.com/in/vaibhav9705/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-background p-6 text-foreground hover:border-blue hover:text-heading transition-colors"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface group-hover:bg-blue/10 group-hover:text-blue transition-colors">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="currentColor"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </div>
                  <span className="font-medium">LinkedIn</span>
                </a>
              </div>
            </section>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
