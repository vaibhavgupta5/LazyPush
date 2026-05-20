# lazypush — Frontend

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/license-MIT-green?style=flat-square)](../LICENSE)

*The landing page, documentation, and support portal for [lazypush.dev](https://lazypush.dev)*

</div>

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — hero, interactive CLI demo, feature cards, command reference |
| `/docs` | Full documentation — install, quickstart, commands |
| `/support` | Contact and social links |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| State | Zustand (theme toggle) |
| Fonts | Geist Sans + Geist Mono |
| Icons | Lucide React |
| Scroll | Locomotive Scroll |
| Language | TypeScript |

---

## Running Locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## Project Structure

```
app/
├── page.tsx           # Landing page
├── docs/
│   └── page.tsx       # Documentation
├── support/
│   └── page.tsx       # Support / contact
├── layout.tsx         # Root layout — fonts, metadata, theme init script
├── globals.css        # CSS variables (light + dark), heatmap cell rules
└── icon.svg           # Favicon

components/
├── SiteShell.tsx      # Shared Header (mobile sidebar) + Footer
├── HeatmapBackground  # GitHub-style commit heatmap — responsive, theme-aware
├── ThemeToggle.tsx    # Dark/light switch (Zustand-powered)
└── SmoothScroll.tsx   # Locomotive scroll wrapper

store/
└── useThemeStore.ts   # Zustand store: isDark, toggleTheme, initTheme
```

---

## Theme System

The site supports dark and light mode via CSS custom properties. The theme is initialized from `localStorage` via a blocking inline `<script>` in `<head>` — this prevents any flash of wrong theme on load.

```css
:root        { --bg: #f3f4f6; --fg: #1e293b; --green: #16a34a; ... }
:root.dark   { --bg: #0d1117; --fg: #c9d1d9; --green: #3fb950; ... }
```

Tailwind theme tokens (`bg-background`, `text-muted`, `border-border`, etc.) map to these CSS variables, so all components automatically respond to the theme toggle without hardcoded hex values.

---

## HeatmapBackground

A GitHub-style commit activity grid rendered as the page backdrop. It is:

- **Responsive**: 20 columns on mobile, 36 on tablet, 52 on desktop
- **Theme-aware**: green tones in dark mode, lighter greens on light background
- **CSS-driven**: cell colors controlled via `data-level` attributes and pure CSS
- **Performance**: purely declarative, no canvas, no animation

---

## Mobile Navigation

The header uses a slide-in right sidebar on mobile:

```
Desktop:  [Logo]  [Docs] [Support] [Commands] [GitHub] [toggle]
Mobile:   [Logo]                              [toggle] [☰]
                                                          │
                                         ┌────────────────▼──┐
                                         │  LazyPush ;)    ✕ │
                                         │                   │
                                         │  Docs             │
                                         │  Support          │
                                         │  Commands         │
                                         │  ──────────────   │
                                         │  GitHub ↗         │
                                         └───────────────────┘
```

Backdrop click closes the sidebar. Body scroll is locked while open.

---

## Build & Deploy

```bash
npm run build    # Next.js production build
npm run start    # Start production server
```

Deploy to Vercel:

```bash
vercel deploy
```

---

## License

MIT © [Vaibhav Gupta](https://github.com/vaibhavgupta5)
