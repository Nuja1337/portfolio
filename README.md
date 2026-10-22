# Portfolio

Alexander Shaham's portfolio site, with featured projects, Runefall, other projects, experience, skills, an about
section and a blog. It's live at **https://portfolio.ajshaham.workers.dev**.

Version four rebuilt the single-file v3 as a typed, tested static site. Version five reorganized it for recruiters, with
plain section titles, four featured projects at the top, and separate game dev and software résumés. Dark and light
modes follow the visitor's system setting, with a moon and sun toggle. There's also an action bar with number-key
shortcuts and a dev console (the action bar's <kbd>~</kbd> slot, or press <kbd>~</kbd>). Each mode has its own copy,
heroic in dark mode and grimdark in light.

Dark mode is a Berserk-style night in black and white with blood-red accents, an inked moon with a red corona, a
speckled starfield and an eclipse at the end. Light mode is sumi ink on paper, with bamboo painted at the edges of the
hero and in a grove at the end, brush-drawn frames and buttons, and bamboo green as the accent. In both modes the accent
marks what to read first (section markers, card titles, labels, stats and icons), and images keep their color.

All the art is drawn in code at build time (`src/scripts/lib/art.ts`, served from `/art/*.svg`) and applied by
`src/styles/ink.css`. Everything is static, and the only animation is one star fade that runs on the compositor.

## Stack

- [Astro](https://astro.build) 7 and TypeScript, fully static output
- Self-hosted fonts (Fontsource), images optimized at build time
- Vanilla TypeScript for the interactive parts, with no UI framework shipped to the browser
- Cloudflare Workers static assets for hosting (`wrangler.jsonc`)
- Vitest for unit tests, Playwright and axe for end-to-end and accessibility tests

## Commands

| Command            | What it does                                                    |
| ------------------ | --------------------------------------------------------------- |
| `npm run dev`      | Dev server at http://localhost:4321 (drafts included)           |
| `npm run build`    | Static build into `dist/`                                       |
| `npm run check`    | Type-check Astro and TypeScript                                 |
| `npm test`         | Unit tests                                                      |
| `npm run test:e2e` | End-to-end and accessibility tests against the production build |
| `npm run verify`   | All of the above, in order                                      |
| `npm run deploy`   | Build and publish to Cloudflare Workers                         |
| `npm run resume`   | Regenerate the game dev, software, and grad school résumés      |

## Deploy

One time: `npx wrangler login`. Then `npm run deploy` publishes `dist/` to `portfolio.ajshaham.workers.dev`.

GitHub Actions is turned off for this repository, so run `npm run verify` before deploying. The workflow is still in
`.github/workflows/ci.yml`. Turned on, it would check, test, build and run the browser tests on every pull request, and
deploy every push to `master`, given two repository secrets: `CLOUDFLARE_API_TOKEN` (a token from the "Edit Cloudflare
Workers" template) and `CLOUDFLARE_ACCOUNT_ID`.

## Editing content

Everything the site says lives in `src/data/`, one file per section:

| File          | Section                                                                      |
| ------------- | ---------------------------------------------------------------------------- |
| `site.ts`     | Name, links, résumé path, and the section list behind the nav and action bar |
| `runefall.ts` | Milestone status, the hero card's spec table, and design notes               |
| `projects.ts` | Every card: the four featured ones, then the Projects board by deck          |
| `career.ts`   | Experience                                                                   |
| `loadout.ts`  | Skills                                                                       |
| `life.ts`     | About                                                                        |

- **Runefall progress:** change a milestone's `status` in `runefall.ts` (`done`, `now`, or `todo`). The milestone
  track and the stat line follow.
- **A new project:** add an entry to `projects.ts`, and drop its screenshot in `src/assets/board/` (16:10 works best).
- **The Rune Forge** stays sealed on purpose. A unit test fails if forge internals show up in the content.
- **The résumés:** edit `resume/build.cjs` and run `npm run resume` to rebuild all three `.docx` files
  (`node resume/build.cjs software --phone` builds one with the phone number). Export the PDFs from Word and copy the
  ones the site links into `public/`.

## Writing a breakdown

A breakdown explains how a project was built. Add `src/content/breakdowns/<slug>.md`, where `<slug>` matches the
project's `breakdown` field in `projects.ts` (or a job's in `career.ts`). Front matter: `title`, `description`,
`role`, `timeline`, `stack`, `status`, and `draft`. While `draft: true`, the page and every link to it exist only in
`npm run dev`; delete the line to publish, and the featured card, the Runefall section, or the Experience entry links it.
Runefall, Guild Golem (`wow-companion`), Drafts, and Tally each have one, and so do the retired Logs and Sims.
Runefall's page also shows its spec table and core tenets from `runefall.ts`.

## Writing a blog post

Add a Markdown file to `src/content/blog/`; its file name becomes the URL (`my-devlog.md` is `/blog/my-devlog`).

```yaml
---
title: 'My first devlog'
description: 'One sentence for the blog index, RSS, and link previews.'
category: devlog # devlog, design, engineering, opinions, or stories (src/data/blog.ts)
pubDate: 2026-10-01
tags: ['runefall', 'devlog']
draft: true # visible only in `npm run dev`; delete this line to publish
---
```

The blog index groups posts by category. `src/content/blog/hello-world.md` is a draft that shows the formatting. The
RSS feed is at `/rss.xml`.

## Layout

```
src/
  components/       Shared chrome: nav, action bar, console, icons
    home/           One component per home-page section
  content/blog/     Blog posts (Markdown)
  data/             All site content
  layouts/          Base page layout
  pages/            Home, blog, RSS, 404, and the build-time hero art (art/)
  scripts/          Browser code; lib/ holds the pure, unit-tested parts (commands, filters, art)
  styles/           Design tokens, component styles, Yang (light.css), and both modes' ink (ink.css)
tests/
  unit/             Vitest
  e2e/              Playwright
resume/             Résumé generator and outputs
```
