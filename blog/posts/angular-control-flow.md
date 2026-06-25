---
title: "Angular's Built-in Control Flow: @if, @for and @switch"
date: 2026-06-14
description: "Why the new block control flow syntax replaces *ngIf and *ngFor — and what it buys you in readability and performance."
tags: [angular, typescript, performance]
---

Angular's structural directives (`*ngIf`, `*ngFor`, `*ngSwitch`) have served us well, but the
built-in **block control flow** introduced in v17 is cleaner, faster, and easier to read. Here's a
quick tour of how I use it day to day.

## The new syntax

Instead of an `*ngIf` directive on an element, you write a block directly in the template:

```html
@if (user(); as u) {
  <p>Welcome back, {{ u.name }}</p>
} @else {
  <p>Please sign in.</p>
}
```

Loops read the same way, and `track` is now **required** — which nudges everyone toward the
performance win that `trackBy` used to make optional:

```html
@for (item of items(); track item.id) {
  <li>{{ item.label }}</li>
} @empty {
  <li>Nothing here yet.</li>
}
```

## Why it matters

- **No imports.** Control flow is part of the compiler, so there's no `CommonModule` or
  `NgIf`/`NgFor` to pull into standalone components.
- **Built-in `@empty`.** The empty-list case is first-class instead of a second `@if`.
- **Faster rendering.** The new `@for` ships a more efficient diffing algorithm, and mandatory
  `track` avoids needless DOM churn.

## Migrating

The Angular CLI ships a schematic that rewrites the old directives for you:

```bash
ng generate @angular/core:control-flow
```

Run it, review the diff, and commit. On a large app I migrated incrementally, one feature module at
a time, with zero runtime regressions.

> Rule of thumb: reach for block control flow in every new template. It's less code, and the
> required `track` keeps lists fast by default.

That's the whole pitch — smaller templates, fewer imports, and performance you get for free.
