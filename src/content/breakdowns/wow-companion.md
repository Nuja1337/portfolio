---
title: 'Guild Golem'
description: 'Guild management for World of Warcraft: Forever: raids, roster, loot, and a Discord bot, with combat logs and sims built in.'
image: '../../assets/board/guild-golem.webp'
imageAlt: 'Guild Golem’s home page: “Everything for WoW Forever, except playing it,” beside an example Molten Core night with 38 of 40 signed up and each role counted against its target'
caption: 'The home page, live: an example raid night, with sign-ups counted against each role’s target and what the night still needs.'
role: 'Solo: design and code'
timeline: 'Oct 2026 to present'
stack: ['TypeScript', 'React', 'React Router', 'Hono', 'Cloudflare Workers', 'D1', 'R2', 'Web Workers']
status: 'Live beta'
---

## The idea

A raiding guild runs on a dozen tools: a calendar bot for sign-ups, a spreadsheet for the roster, another for loot, a
log site for performance, a sim for gear, and a Discord server full of pings. Guild Golem puts all of it in one app for
World of Warcraft: Forever, for the officers who keep a raid team together and the players in it. Everyone signs in with
Discord.

[Open Guild Golem](https://guildgolem.com) · [The addon's code](https://github.com/Nuja1337/gg-addon) · [The Discord bot](https://github.com/Nuja1337/gg-discord)

## For officers

- **Calendar:** raid nights in month, week, day, and list views, each in the viewer's own time zone. Sign-up templates
  set role targets, class limits, a lock time, and a bench, and optional nights earn extra credit. Absences and a
  standing weekly availability sit beside it.
- **Raid planner:** place the roster by drag and drop or fill from sign-ups, watch buff coverage update live, then sim
  the raid or send everyone their group by DM. Splits run one raid two to four times in a lockout, each player on a
  different character each run, with officers' pins standing and loot funneled across the runs.
- **Roster and attendance:** every character in one sortable table with ranks, filters, and role counts. Attendance
  comes from sign-ups, proven by the guild's own logs, and exports as CSV.
- **Loot:** one system per guild, a loot council, EPGP, or DKP with decay and take-backs, plus priorities from each
  raid's loot list, imports from RCLootCouncil and Gargul, a ledger of how each item went, and a guild bank with
  minimums and members' requests.
- **Running the guild:** ranks with officer permissions granted one by one, strats with who sees what, recruiting
  listings and applications, an audit log, a bell for what needs attention, and a preview of the guild as a lower rank
  sees it.

## In Discord

The bot lives in the guild's server. Thirteen slash commands cover raids, the roster, reminders, absences, logs,
recruiting, and lookups for talents, spells, and builds. Sign-up posts update in place, raid nights post themselves,
and a post follows each raid that's being logged live.

## For players

- A Today page with the next raid and the two weeks after it, with one-tap answers.
- Each character's talents, Legacy plan, gear and sim on its own page, with share codes.
- A sim for 23 specs across nine classes, damage and tanking. It shows a range instead of one number, plus stat weights
  and, for tanks, threat.
- A gear page with a paper doll, totals and caps, and upgrades ranked by the sim's stat weights.

## Logs and Sims, rebuilt

Guild Golem began as the companion to two standalone apps of mine, Logs and Sims. Instead of wiring them together, I
retired both and rebuilt them inside it, reusing code only where it fit and keeping no compatibility with the old
sites.

Logs are uploaded to the guild in pieces, or streamed from a browser tab while the raid is going, and every report belongs
to a guild and a raid night. The overview counts each
raid's kills, a fight's tabs cover damage, healing, deaths, interrupts, consumables at the pull, and buff uptimes, and
each player's performance sits beside their sim range. Reports follow Warcraft Logs' layout, with Compare for two
players or two raids, estimated threat per second, and report cards that mark five subjects against the same bars for
everyone. Officers choose what each boss is checked for, and every pull gets a Checks tab. The sim reads Forever's own client data instead of layering
changes on Classic's numbers.

[Read the Logs breakdown](/breakdowns/logs) · [Read the Sims breakdown](/breakdowns/sims)

## Architecture

<div class="flow" role="img" aria-label="The browser loads pages server-rendered by React Router on Cloudflare Workers. A Hono API on the same Worker reads and writes D1, with shared reports in R2. The log parser and the sim engine run in Web Workers. Game data comes from immutable packs built from Forever's client tables. The Discord bot answers HTTP interactions, and a cron drains an outbox every minute.">
<div class="flow-row">
<div class="node"><b>Browser</b><span>React Router, server-rendered on Workers</span></div>
<div class="arrow">requests →</div>
<div class="node key"><b>Hono API</b><span>Discord sign-in · permissions · rate limits</span></div>
<div class="arrow">rows →</div>
<div class="node"><b>D1 and R2</b><span>Guild data, plus shared reports</span></div>
</div>
<div class="flow-side">
<div class="node"><b>Web Workers</b><span>Log parser and sim engine, off the main thread</span></div>
<div class="node"><b>Game data packs</b><span>Built from Forever's client tables · content-addressed</span></div>
<div class="node"><b>Discord bot</b><span>HTTP interactions · an outbox drained every minute</span></div>
</div>
</div>

## Key decisions

### Game data as immutable packs

Every spell, talent, and item number comes from Forever's own client tables, built into versioned packs. Each raw
input is archived by its SHA-256 hash, a rebuild is byte-identical, and packs are content-addressed and cached for a
year. A pack's serial is burned once it's served and never reused.

**Tradeoff:** a fix is always a new pack, never an edit to one that's already out.

### A bot without a gateway

The Discord bot runs on HTTP interactions inside the same Worker, which checks each request's Ed25519 signature with
WebCrypto. Outgoing posts go into a leased outbox in D1 that a cron drains every minute, which replaced a queue.

**Tradeoff:** with no gateway connection, the bot can't react to messages. Everything starts from a slash command, a
button, or the site.

### Heavy work off the main thread, on a budget

The log parser and the sim engine run in Web Workers. A check before every merge and deploy fails if the shell goes
over 145 KiB gzipped, any page's first load goes over 184 KiB, or a module scan finds the engine or the parser in a
main-thread chunk. Lab runs
on a phone over 4G show no layout shift and the largest paint in about a second.

### Every guild page in about two round trips

The database sits in the west, and a read from the east costs about 85 ms, so guild pages that read six to ten things
one after another waited 0.5 to 0.9 seconds before they could draw. Now each page opens with one round trip that finds
the guild, the viewer's rank, and what the page needs first, then reads the rest together. Most pages went to two round
trips, the overview from nine to three, and a test fails if any page's chain grows.

### Locked down by default

A nonce-based Content Security Policy and Trusted Types with no third-party origins, per-address rate limits, and a
500 ms CPU cap on every request.

## By the numbers

- Live a day after the first commit.
- 1,000+ automated tests across 200+ files, 90+ of them running inside workerd against a migrated D1.
- A Playwright smoke test of the built Worker covers about 100 pages, in both themes, signed in and out, and on a phone,
  with zero CSP or Trusted Types violations and no serious axe findings (WCAG 2.2 AA).
- A 186 MB raid log parsed and opened in 1.8 seconds in Chrome.
- 19,000+ Forever items in the game data, and 110+ database migrations so far.

## What's next

- Healer sims, boss and encounter data, and loot-council voting.
- The in-game addon, which is in testing, and the public launch.
