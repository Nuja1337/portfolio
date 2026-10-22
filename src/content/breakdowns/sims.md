---
title: 'Sims'
description: 'A combat simulator for World of Warcraft: Forever that ran on every CPU core, in the browser.'
image: '../../assets/board/sims.webp'
imageAlt: 'Sims results for a Fury Warrior: DPS summary, a DPS distribution histogram, damage over time, and damage by ability'
role: 'Solo: design and code'
timeline: 'Sep to Oct 2026'
stack: ['TypeScript', 'React', 'Zustand', 'Web Workers', 'Cloudflare Workers']
status: 'Retired; rebuilt inside Guild Golem'
---

**Retired.** In October 2026 I retired Sims for [Guild Golem](/breakdowns/wow-companion), a guild management app for
World of Warcraft: Forever that rebuilt its sim inside the guild app. This page covers the standalone version.

## The problem

World of Warcraft: Forever is a new take on Classic, and players want to know what a character will do before the
numbers settle, like which spec, which gear and which raid setup. Sims starts from the Classic Anniversary rules and
layers every known Forever change on top, each tagged as official, datamined or reported.

## Constraints

- Everything runs in the browser. The site is static files on Cloudflare's free tier, and sims never run on the main
  thread.
- Every game number has to be editable data, because Forever is still changing.
- Forever's boss data isn't published yet and item stats stay hidden until an item drops, so the sim has to be clear
  about what is a placeholder.

## Architecture

<div class="flow" role="img" aria-label="Your setup in React and Zustand becomes a request. A pool of up to eight Web Workers splits the iterations into ranges. Each worker runs the event-driven engine with a seeded random number generator and scripted bosses, and returns a mergeable summary. The main thread merges them into the results, stat weights, and best-in-slot gear.">
<div class="flow-row">
<div class="node"><b>Your setup</b><span>React and Zustand · a serializable request</span></div>
<div class="arrow">request →</div>
<div class="node"><b>Worker pool</b><span>Up to 8 Web Workers · iterations split into ranges</span></div>
<div class="arrow">ranges →</div>
<div class="node key"><b>Engine</b><span>Event queue · seeded RNG · scripted bosses</span></div>
<div class="arrow">summaries →</div>
<div class="node"><b>Results</b><span>Mean, spread, percentiles, histogram</span></div>
</div>
<div class="flow-side">
<div class="node"><b>Stat weights and best in slot</b><span>Every variant runs the same seeds</span></div>
</div>
</div>

## Key decisions

### Events, not ticks

The engine runs on a binary-heap event queue. Rotations re-evaluate when something happens (a global cooldown ends, a
cast finishes, a weapon swings, an aura changes), with a 100 ms idle check. Ties break by insertion order, so the same
inputs always produce the same timeline.

### Seeded, reproducible runs

Every iteration gets its own seed derived from the run's base seed, so a run can be reproduced exactly and the result
doesn't depend on how the iterations were split across workers.

**Tradeoff:** each sim has one random stream, so two runs that make one different decision drift apart from that point.

### Split across cores, merge at the end

The pool runs up to 8 workers, one fewer than your cores, and gives each a contiguous range of iterations. Each worker
returns a summary that can be merged, and the main thread combines them into the mean, standard deviation, 5th, 50th,
and 95th percentiles, and a histogram.

### Stat weights you can trust

Stat weights compare runs with and without extra stats on the same seeds, so the difference comes from the stat, not
luck. A weight within two standard errors of zero is flagged as noisy, and three extra runs measure hit below and above
the cap. Because of the hit cap, slot scores can't simply be added, so best in slot uses greedy selection plus a
single-slot search, and items with special effects are settled by simulation.

**Tradeoff:** settling special-effect items is slow, about 4,800 iterations or roughly 25 seconds on one core.

### One ruleset, layered

Each area keeps a file of Forever changes that is merged onto the Anniversary numbers. Anything not yet known stays at
its Anniversary value, and a pending list tracks what's missing.

**Tradeoff:** unpublished values such as the attack table, spell batching, and boss level stay at Anniversary values
until Forever confirms them.

## Results

- 34 specs across 9 classes (23 damage, 6 tank, 5 healer), 62 Classic raid bosses scripted, and 21 Forever bosses held
  as placeholders.
- In the calibration run, one iteration takes 1.1 ms (Arcane Mage) to 5.4 ms (Protection Paladin) on a single thread.
- The engine is checked against documented numbers: the level-63 attack table, armor reduction, and two-handed white
  damage within 3% of the analytic value.
- About 944 tests across 52 test files.
- 141 Forever changes applied (28 official, 99 datamined, 14 reported), with 77 more tracked as pending.

## What happened next

Sims was retired in October 2026. [Guild Golem](/breakdowns/wow-companion) rebuilt the sim on Forever's own client
data. Every spell number, talent and proc comes from the game's tables, results come as a range, and a gear page ranks
upgrades by the sim's stat weights.
