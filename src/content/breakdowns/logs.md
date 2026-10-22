---
title: 'Logs'
description: 'Combat-log analytics for World of Warcraft: Forever, parsed in your browser so the raw log never left it.'
image: '../../assets/board/logs.webp'
imageAlt: 'Logs fight page for an Onyxia kill: a timeline of boss health, adds, deaths, cooldowns, and hazards, with who took, healed, and dealt the most'
role: 'Solo: design and code'
timeline: 'First version 2024; rebuilt Sep 2026; retired Oct 2026'
stack: ['TypeScript', 'React', 'Hono', 'Cloudflare Workers', 'D1']
status: 'Retired; rebuilt inside Guild Golem'
---

**Retired.** In October 2026 I retired Logs for [Guild Golem](/breakdowns/wow-companion), a guild management app for
World of Warcraft: Forever that rebuilt its log analysis inside the guild app. This page covers the standalone version.

## The problem

After a raid, the guild master or an officer wants to know why pulls went wrong and how the team is trending week over
week. The answer is in the combat log, but a raid night's log is hundreds of megabytes of text. Logs turns it into
report, fight, and player pages, plain-language fight stories, and a raid-team health view for guild managers.

## Constraints

- Cloudflare's free tier: 10 ms of CPU per request (the app budgets itself 5 ms) and 100,000 rows written a day, on an
  account shared with two other apps.
- Logs are big. The test corpus is nine logs, about 1.25 million lines and 320 MB, and a single Naxxramas night is 178
  MiB.
- Raw logs include chat, pet names, positions, and bystanders that a guild never agreed to share.

## Architecture

<div class="flow" role="img" aria-label="A log dropped into the browser is streamed through a parse worker into pulls. The browser builds the pages, scores, and stories and keeps them in IndexedDB. Sharing is optional: a Hono Worker validates the upload and writes it to D1 in one guarded batch.">
<div class="flow-row">
<div class="node"><b>Drop a log</b><span>A file or a whole folder</span></div>
<div class="arrow">stream →</div>
<div class="node key"><b>Parse worker</b><span>Gunzip · lines · tokens · pulls</span></div>
<div class="arrow">pulls →</div>
<div class="node"><b>Your browser</b><span>Pages, scores, and stories in IndexedDB</span></div>
</div>
<div class="flow-side">
<div class="node"><b>Share, if you choose</b><span>Hono Worker: auth, limits, validation</span></div>
<div class="node"><b>D1</b><span>One guarded batch · a main database and two stream shards</span></div>
</div>
</div>

## Key decisions

### Parse in the browser, never on the server

With 10 ms of CPU per request, the server can't parse a log, and it shouldn't see one anyway. Parsing happens in a Web
Worker, and analyzing a log locally makes zero requests.

**Tradeoff:** shared data could be forged, so trust is scoped to each guild, with plausibility checks, deduplication, and
boards marked unverified.

### Stream, don't hold

The parser streams the file (decompress, decode, split into lines) and keeps only the current pull's state. Interning
unit IDs and flattening the strings it keeps cut the live heap from 63.6 MB to 8.6 MB: V8's sliced strings had been
pinning 64 KiB chunks of the file.

**Tradeoff:** a pull's working state is gone once the pull closes.

### Share the events, not the results

Sharing uploads a name-free event stream for each pull instead of finished numbers, so old reports can be recomputed when
the scoring improves. The stream is 4.7 times smaller than the raw text, and the Worker stores it without parsing it,
which keeps uploads inside the CPU budget.

### D1 only, with guarded batches

KV allows 1,000 writes a day, so everything lives in D1: a main database plus two shards for event streams. Each upload
is a single batch with a guard statement that rolls the whole batch back if any check fails. Packing a night's player
rows cut an upload from 850 to 1,710 writes down to 162 to 212.

**Tradeoff:** storage becomes the limit. At nine reports a day there's about 15 months of runway before it needs more
databases or a paid plan.

### No accounts

Guilds get secret keys (owner, admin, uploader, and viewer), stored as HMAC hashes, and sharing is an explicit second
step after local analysis. Slow password hashing was ruled out: PBKDF2 at 100,000 iterations measured about 15 ms, over
the CPU limit.

**Tradeoff:** a lost key means using a recovery code. Discord sign-in comes after v1.

## Results

- The parser streams 64.1 MiB/s in the Node benchmark (target 55) with a live heap of 5.2 MB (budget 16). A 178 MiB
  Naxxramas log parses in 3.9 seconds.
- The parse worker ships at 67 KB gzipped, inside a 75 KB budget.
- At the last full test gate: 2,040 app tests, 991 Worker tests against a local D1, 29 golden logs, and end-to-end flows
  with zero serious accessibility violations.
- Guild sharing opened in closed launch on September 28, 2026.

## What happened next

Logs was retired in October 2026. [Guild Golem](/breakdowns/wow-companion) rebuilt its log analysis inside a guild
app with Discord sign-in. There, a report belongs to a raid night, proves attendance, shows consumables at the pull,
and puts each player's performance beside their sim range.
