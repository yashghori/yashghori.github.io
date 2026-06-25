# ghori.in — Yash Ghori's portfolio

Personal portfolio and blog, served as a static site on GitHub Pages at
[ghori.in](https://ghori.in). Vanilla HTML, CSS and JavaScript — no framework, no client-side
runtime. The only build step generates blog pages from Markdown.

## Stack

- Plain HTML/CSS/JS, dark-default with a light theme toggle (persisted to `localStorage`).
- Inter (Google Fonts) for UI, system monospace for code/tech labels.
- A small Node script turns Markdown posts into static HTML at build time, with syntax
  highlighting baked in (zero client-side JS on blog pages).

## Structure

```
index.html          Single-page portfolio
styles/             main.css (site) + blog.css (writing)
scripts/main.js     Theme toggle, mobile nav, tenure counter
assets/             Avatar, company/school logos, resume PDF
blog/posts/*.md     Blog SOURCE (hand-written)
blog/*.html         Blog OUTPUT (generated — do not hand-edit)
build/              build-blog.js + HTML templates
CNAME               Custom domain (ghori.in)
```

## Develop

```bash
npm install      # one-time: install build dependencies
npm run build    # regenerate blog/ from blog/posts/*.md
npm run serve    # serve the site locally (http://localhost:3000)
npm run dev      # build, then serve
```

Open the site from the served URL (not `file://`) so root-relative paths resolve.

## Publish a blog post

Authentication is your GitHub push access — only you can publish.

1. Create `blog/posts/my-post.md` with frontmatter:

   ```markdown
   ---
   title: "My Post Title"
   date: 2026-06-14
   description: "One-line summary for the listing and social previews."
   tags: [angular, performance]
   cover: /assets/blog/cover.png   # optional
   ---

   Write the post in **Markdown**. Fenced code blocks get highlighted.
   ```

2. `npm run build`
3. `git commit -am "post: my post title" && git push`

The post appears at `/blog/<filename-slug>.html` and in the `/blog/` listing (newest first).

## License

MIT — see source.
