---
title: 'Hello, world'
description: 'A draft that shows how posts look. Drafts only appear in `npm run dev`.'
pubDate: 2026-09-26
category: devlog
tags: ['meta']
draft: true
---

This is a **draft**, so it only shows up while running `npm run dev`. Set `draft: false` (or remove the line) to publish.

## Writing a post

Add a Markdown file to `src/content/blog/`. The file name becomes the URL: `my-first-devlog.md` is served at
`/blog/my-first-devlog`. Front matter:

```yaml
title: 'My first devlog'
description: 'One sentence for the blog index, RSS, and link previews.'
category: devlog # devlog, design, engineering, opinions, or stories
pubDate: 2026-10-01
tags: ['runefall', 'devlog']
```

> Quotes render in the quest-log serif.

- Lists, `inline code`, links, and images all work.
- Put images next to the post and reference them with a relative path.
