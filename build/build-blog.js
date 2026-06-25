#!/usr/bin/env node
/* =============================================================
   Blog build: blog/posts/*.md  ->  blog/index.html + blog/<slug>.html
   Markdown is rendered to static HTML at build time. Code is syntax-
   highlighted here, so blog pages ship zero client-side JS for content.

   Publish flow:
     1. write blog/posts/my-post.md  (with frontmatter)
     2. npm run build
     3. git commit && git push
   ============================================================= */

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { Marked } = require("marked");
const { markedHighlight } = require("marked-highlight");
const hljs = require("highlight.js");

const ROOT = path.join(__dirname, "..");
const POSTS_DIR = path.join(ROOT, "blog", "posts");
const OUT_DIR = path.join(ROOT, "blog");
const TPL_DIR = path.join(__dirname, "templates");

const postTpl = fs.readFileSync(path.join(TPL_DIR, "post.html"), "utf8");
const listTpl = fs.readFileSync(path.join(TPL_DIR, "list.html"), "utf8");

/* ---------- Markdown renderer with build-time highlighting ---------- */
const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight(code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
  })
);

/* ---------- Helpers ---------- */
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(name) {
  return name
    .replace(/\.md$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatDate(value) {
  const d = new Date(value);
  if (isNaN(d)) return { iso: "", display: String(value || "") };
  const iso = d.toISOString().slice(0, 10);
  const display = d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return { iso, display };
}

function readingTime(text) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200)) + " min read";
}

function tagSpans(tags, cls) {
  if (!Array.isArray(tags)) return "";
  return tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("");
}

function fill(tpl, map) {
  return tpl.replace(/\{\{(\w+)\}\}/g, (m, key) => (key in map ? map[key] : m));
}

/* ---------- Load posts ---------- */
if (!fs.existsSync(POSTS_DIR)) {
  console.error("No blog/posts directory found at " + POSTS_DIR);
  process.exit(1);
}

const files = fs.readdirSync(POSTS_DIR).filter((f) => f.toLowerCase().endsWith(".md"));

const posts = files.map((file) => {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { data, content } = matter(raw);
  const slug = data.slug ? slugify(String(data.slug)) : slugify(file);
  const { iso, display } = formatDate(data.date);
  return {
    slug,
    title: data.title || slug,
    description: data.description || "",
    tags: data.tags || [],
    cover: data.cover || "",
    dateIso: iso,
    dateDisplay: display,
    dateSort: new Date(data.date || 0).getTime(),
    readingTime: readingTime(content),
    html: marked.parse(content),
  };
});

// Newest first
posts.sort((a, b) => b.dateSort - a.dateSort);

/* ---------- Write per-post pages ---------- */
posts.forEach((p) => {
  const coverHtml = p.cover
    ? `<img class="post-cover" src="${escapeHtml(p.cover)}" alt="${escapeHtml(p.title)}">`
    : "";

  const out = fill(postTpl, {
    TITLE: escapeHtml(p.title),
    DESCRIPTION: escapeHtml(p.description),
    SLUG: p.slug,
    DATE_ISO: p.dateIso,
    DATE_DISPLAY: escapeHtml(p.dateDisplay),
    READING_TIME: p.readingTime,
    TAGS: tagSpans(p.tags),
    COVER: coverHtml,
    CONTENT: p.html,
  });

  fs.writeFileSync(path.join(OUT_DIR, p.slug + ".html"), out);
  console.log("  ✓ blog/" + p.slug + ".html");
});

/* ---------- Write listing ---------- */
let items;
if (posts.length === 0) {
  items = '<p class="post-empty">No posts yet — check back soon.</p>';
} else {
  items = posts
    .map((p) => {
      const desc = p.description ? `<p class="post-card-desc">${escapeHtml(p.description)}</p>` : "";
      const tags = p.tags.length ? `<div class="post-card-tags">${tagSpans(p.tags)}</div>` : "";
      return `      <a class="post-card" href="/blog/${p.slug}.html">
        <div class="post-card-meta"><time datetime="${p.dateIso}">${escapeHtml(p.dateDisplay)}</time><span>${p.readingTime}</span></div>
        <h2 class="post-card-title">${escapeHtml(p.title)}</h2>
        ${desc}
        ${tags}
      </a>`;
    })
    .join("\n");
}

fs.writeFileSync(path.join(OUT_DIR, "index.html"), fill(listTpl, { ITEMS: items }));
console.log("  ✓ blog/index.html");
console.log("Built " + posts.length + " post(s).");
