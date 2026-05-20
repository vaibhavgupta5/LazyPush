"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ExternalLink, Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  activeHref?: string;
  showCommands?: boolean;
}

export function Header({ activeHref, showCommands }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = [
    { label: "Docs", href: "/docs" },
    { label: "Support", href: "/support" },
    ...(showCommands ? [{ label: "Commands", href: "#commands" }] : []),
  ];

  const linkClass = (href: string) =>
    `text-base font-medium transition-colors hover:text-heading ${
      activeHref === href ? "text-heading" : "text-muted"
    }`;

  return (
    <>
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="font-mono text-[15px] font-semibold text-heading hover:text-green transition-colors tracking-tight"
          >
            LazyPush ;)
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted">
            {navLinks.map((l) =>
              l.href.startsWith("#") ? (
                <a key={l.href} href={l.href} className={`hover:text-heading transition-colors ${activeHref === l.href ? "text-heading font-medium" : ""}`}>
                  {l.label}
                </a>
              ) : (
                <Link key={l.href} href={l.href} className={`hover:text-heading transition-colors ${activeHref === l.href ? "text-heading font-medium" : ""}`}>
                  {l.label}
                </Link>
              )
            )}
            <a
              className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-foreground hover:border-muted hover:text-heading transition-colors text-xs"
              href="https://github.com/vaibhavgupta5"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              GitHub
            </a>
            <ThemeToggle />
          </nav>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex sm:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="text-muted hover:text-heading transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar overlay */}
      <div
        className={`fixed inset-0 z-50 sm:hidden transition-opacity duration-300 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        {/* Sidebar panel */}
        <div
          className={`absolute right-0 top-0 h-full w-72 bg-background border-l border-border flex flex-col transition-transform duration-300 ease-in-out ${
            menuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-border">
            <span className="font-mono text-[15px] font-semibold text-heading">
              LazyPush ;)
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="text-muted hover:text-heading transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav links */}
          <nav className="flex flex-col gap-1 px-4 py-6">
            {navLinks.map((l) =>
              l.href.startsWith("#") ? (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`${linkClass(l.href)} px-3 py-2.5 rounded-md hover:bg-surface`}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`${linkClass(l.href)} px-3 py-2.5 rounded-md hover:bg-surface`}
                >
                  {l.label}
                </Link>
              )
            )}

            <div className="my-3 border-t border-border" />

            <a
              href="https://github.com/vaibhavgupta5"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-md text-base font-medium text-muted hover:text-heading hover:bg-surface transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              GitHub
            </a>
          </nav>

          {/* Footer inside sidebar */}
          <div className="mt-auto px-6 py-5 border-t border-border text-xs text-muted">
            LazyPush — schedule Git pushes for later
          </div>
        </div>
      </div>
    </>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-3 px-6 py-5">
        <span className="font-mono text-sm text-muted">LazyPush</span>
        <div className="flex items-center gap-5 text-sm text-muted">
          <a href="https://x.com/vaixbhav_" target="_blank" rel="noopener noreferrer" className="hover:text-heading transition-colors">X</a>
          <a href="https://github.com/vaibhavgupta5" target="_blank" rel="noopener noreferrer" className="hover:text-heading transition-colors">GitHub</a>
          <a href="https://www.linkedin.com/in/vaibhav9705/" target="_blank" rel="noopener noreferrer" className="hover:text-heading transition-colors">LinkedIn</a>
        </div>
      </div>
    </footer>
  );
}
