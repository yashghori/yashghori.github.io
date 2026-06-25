# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Yash Ghori's personal portfolio + blog, served as a static site on GitHub Pages with a custom
domain (`ghori.in`, set in `CNAME`). Vanilla HTML/CSS/JS — no framework and no client-side runtime.
Minimal, Linear/Vercel-inspired design: dark by default with a light theme toggle, indigo accent
(`#6366F1`), Inter for UI and system monospace for code/tech labels. The only build step generates
blog pages from Markdown.

## Commands

```bash
npm install      # install build deps (marked, marked-highlight, gray-matter, highlight.js)
npm run build    # generate blog/*.html from blog/posts/*.md
npm run serve    # serve the repo root (use http://, not file://, for root-relative paths)
npm run dev      # build then serve
```

There is no test or lint suite. Verify visually in the browser.

## Architecture

### Portfolio (`index.html`)
A single page with semantic sections in order: nav, hero, `#experience`, `#skills`, `#projects`,
`#education`, `#contact`, footer. Icons are inline SVG (no icon font). The Google Analytics `gtag`
snippet lives in the head. All asset references are **root-relative** (`/styles/...`, `/assets/...`)
so they resolve identically from `/` and from `/blog/...`.

### Theme (no flash)
An inline script in each page's `<head>` reads `localStorage.theme` (falling back to
`prefers-color-scheme`) and sets `data-theme` on `<html>` *before first paint*. `scripts/main.js`
handles the toggle button (persisting the choice), the mobile nav, the footer year, and the Asite
tenure counter. Theme tokens are CSS custom properties under `:root` and `[data-theme="light"]` in
`styles/main.css`.

### Blog build pipeline
- **Source of truth**: `blog/posts/*.md`, each with YAML frontmatter (`title`, `date`,
  `description`, `tags`, optional `cover`; slug derives from the filename unless `slug` is set).
- `build/build-blog.js` parses frontmatter with `gray-matter`, renders Markdown with `marked` +
  `marked-highlight` (highlight.js applied **at build time** — blog pages ship no content JS), then
  fills `build/templates/post.html` and `build/templates/list.html` (placeholders are `{{TOKEN}}`).
- **Output** (generated, do not hand-edit): `blog/index.html` (listing, newest first) and
  `blog/<slug>.html` per post.
- Authoring/publish flow: write a `.md` → `npm run build` → commit → push. Push access *is* the
  auth — only the repo owner can publish. To add a post, never edit generated HTML; add Markdown and
  rebuild.

### Styling
- `styles/main.css` — tokens, layout, and all portfolio section styles.
- `styles/blog.css` — blog listing, post `.prose` typography, and a token-driven highlight.js theme
  that adapts to dark/light. Loaded after `main.css` on blog pages only.

## Gotchas

- Regenerate the blog (`npm run build`) after editing anything in `blog/posts/` or
  `build/templates/`; the committed `blog/*.html` are artifacts.
- Keep new paths root-relative, not `../`-relative, to stay consistent across `/` and `/blog/`.
- `node_modules/` is gitignored; `blog/*.html` are committed (GitHub Pages serves them directly).
- `docs/` is a vestigial leftover and unused by the live site.
