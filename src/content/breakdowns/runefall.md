---
title: 'Runefall'
description: 'A classless competitive RPG of arenas and a five-player dungeon, where every player builds their own kit and opponents learn it only by surviving it.'
image: '../../assets/runefall/gameplay.webp'
imageAlt: 'Runefall in engine: round one of a 3v3 as the void closes in, with team frames, enemy frames, and the ability bar, in greybox'
caption: 'In engine, from a September core-loop build: round one of a 3v3 as the void closes in. Enemy frames list the abilities you have discovered by facing them. Greybox art; the bar has since grown to all ten abilities.'
role: 'Solo: design, code, and production'
timeline: 'Feb 2026 to present'
stack: ['Godot 4.7 (.NET)', 'C#', '.NET 10', 'Steamworks', 'ASP.NET Core', 'SQLite', 'xUnit']
status: 'Playable online; Online milestone in progress'
---

## How a match plays

- Arenas are best of three, and every round is an elimination. A short intermission between rounds lets both teams
  regroup and counter what they've seen.
- The encroaching void is the round's timer. Partway through, darkness starts closing in from the arena's edges until
  it covers everything, so rounds stay short and decisive. Nothing protects from it.
- You learn an opponent's kit only by watching it cast. Each discovery appears under their frame for the rest of the
  match, so by round three both teams are playing with more information than they started with.
- Information is kept fair. What your team can't see stays hidden, and nothing in the interface lets you probe
  the fog for it.
- No round is a draw. If one tick downs everyone, the side with more players standing wins it, then the side with more
  health.
- No match is remade. If a teammate leaves, the rest can forfeit without losing rating, and the leaver sits out the
  queue for five minutes.

## Combat

- **Fake-casting.** Moving before an ability's cast point cancels it for free, so a feint costs nothing but time.
- **Line of sight as defense.** Targeted casts check line of sight again at the moment they land, so stepping behind a
  pillar at the right time makes a cast fizzle.
- **Skillshots.** Abilities aimed at a place hit whoever stands in them, seen or not. Fog hides you, but it doesn't protect you.
- **Swings.** Weapons swing on a timer you can orb-walk around.
- **Crowd control.** Diminishing returns plus a hostage guard, so nobody gets chain-held. Breakouts come from your
  own kit instead of a trinket, and taunt works on players.
- **Bodies.** Everyone blocks everyone, allies included, and nobody gets pushed, so blocking a path is a skill.
- **One pipeline.** Every point of damage and healing runs through one server-side pipeline, and the meters and combat
  log read from it.

## The dungeon

- Five players against one boss, shaped like Mythic+: no trash, no timer, no lockouts, and no loot. One boss for now,
  in an arena of its own.
- The boss speaks the same telegraph language players do, so the arena teaches the dungeon. What the boss is about to
  do lives on the map, not in a warning addon, and threat is shown relative to whoever holds it.
- The boss is built from data. Its abilities go through the same server code as a player's, and its phases are a table that the
  bots' brain plays. Bots fill empty seats in whatever role the party lacks, judged from what each kit can do. A kit
  with a taunt counts as a tank.
- Pulls, wipes, respawns, threat, the boss's phases, and a dungeon queue are built, around a stand-in boss. The bar for
  the first real one is an outside group clearing it without help.

## Readability and accessibility

The readability rules are hard requirements.

- Team colors are colorblind-safe, lightness comes before hue, and shape carries meaning as well as color.
- One telegraph grammar covers every effect, and the boss uses it unchanged.
- HUD scaling and full remapping are in, with keys bound by physical position so they sit in the same place on any
  keyboard layout. Colorblind palettes and flash reduction are launch requirements.
- Audio matters for readability too. When it lands, the cues that matter in a fight have to be recognizable with the screen
  covered.

## Practice, custom matches, and observers

The practice tool is a solo sandbox with configurable dummies, meters, and a dev console, and it runs the real server
code in-process. Custom matches take any mix of players and bots: join a dedicated server by its Steam ID, or host one
from the client. A player-hosted match is unranked, and its host can see through fog, which is fine among friends and
never allowed in ranked. Up to four observers can watch a custom match on a delay, so tournaments and playtests don't
wait on matchmaking.

Every match is recorded. After a round is decided, a recount lifts the fog and shows who did what, ability by ability,
and match history keeps the results.

## The world

A dark-fantasy world bible, kept separate from the mechanics. The last great civilization is a vertically
layered coastal city-state, a melting pot of every surviving culture, which is also the in-fiction reason anyone can
build any kit. It has eight peoples, seven imprisoned powers and ten thousand years of history since the collapse. The
great evils were sealed away rather than defeated, and the seals are failing. The tone is grimdark with a hopeful core.
Every name is still a working name, and the story is still being written.

Art is in greybox for now, aiming at TBC and Wrath-era warmth with Warhammer Fantasy weight.

## Engineering

The client is thin. It draws the fight and sends the player's input. The fight itself is a plain C# simulation with no engine
reference, and a dedicated server hosts it. Online, every packet travels over Steam Datagram Relay.

<div class="flow" role="img" aria-label="The Godot client sends commands over Steam Datagram Relay to the dedicated server. The engine-free simulation runs at 60 Hz and computes each team's vision. A vision filter sends each team delta snapshots without hidden entities. A matchmaker places players in matches, bots are command sources like players, and every match is recorded as a signed replay.">
<div class="flow-row">
<div class="node"><b>Godot client</b><span>Renders, predicts feedback, sends intent</span></div>
<div class="arrow">commands · SDR →</div>
<div class="node key"><b>Simulation</b><span>Engine-free C# · 60 Hz</span></div>
<div class="arrow">state →</div>
<div class="node"><b>Vision filter</b><span>Each team gets only what it can see, as deltas</span></div>
</div>
<div class="flow-side">
<div class="node"><b>Matchmaker</b><span>ASP.NET Core and SQLite · queues, rating, backfill</span></div>
<div class="node"><b>Bots</b><span>Command sources, just like players</span></div>
<div class="node"><b>Replays</b><span>Every match recorded, signed, and replayable headless</span></div>
</div>
</div>

The same server code runs in-process for the practice tool, the tests, and a headless harness, and as a dedicated
server for online play. Two machines played full matches over Steam's relay at First Playable, and the Online milestone
added the rest: a matchmaker, reconnect, prediction, and lag compensation.

### One direction

The code splits into twelve projects: the simulation, shared rules, networking, a Steam adapter, the match server and
its host, the matchmaker, bots, engine-free view-models and network link for the client, the Godot client, and a
harness. Dependencies only point toward the simulation, and architecture tests check that, so the game's rules never
reference the engine, and only the Steam adapter touches Steamworks.

### A simulation that can't drift

The simulation uses integer math and bans anything that could behave differently between runs, enforced by analyzers.
The same seed and commands always produce the same state hash, which is what makes exact replays and a headless test
harness possible.

### Fog of war on the server

Vision is computed on the server every tick, and each team is sent only what it can see, so a map hack has nothing to
show. A wire tap over a whole match proves hidden information never reaches a client, and the gate plays a full best
of three between six headless clients to keep it that way.

### Replays, bots, and the client

Every match is recorded as its commands, seed, version stamps, and the content it ran on, and the dedicated server
signs the replays it records. The harness can play any of them back headless and confirm the result, so a balance change never breaks an
old replay. Bots are command sources on the same path as a player's connection, limited to what their team can
see. On the client, the HUD and screen logic are engine-free view-models tested like the rest of the code.

### Testing and tooling

- 5,000+ xUnit tests, including CsCheck property tests, golden replays, and checks that hot paths allocate nothing.
- Network fault tests play matches over links that drop, duplicate, reorder, and break, on a manual clock so a failing
  seed repeats. The gate fails if any client's worst second goes over the bandwidth ceiling.
- Every commit passes a gate (a ticket, a secret scan, a clean build, and passing tests), and CI also boots 30 Godot
  scenes headless.
- Diversion for version control, YouTrack for 450+ tickets, and a game design document, roadmap, and decision log as
  the source of truth. Development is AI-assisted, behind the same gates.

## Key decisions

### Godot .NET over Unreal Engine 5

The game was prototyped in Unreal Engine 5 with C++ and GAS, then moved to Godot and C# for faster development and
debugging. Keeping the simulation engine-free hedges that choice, since the fight doesn't know which engine draws it.

### Replicate state, don't roll back

Rollback netcode has every client simulate the whole fight, including enemies it shouldn't see, which would break
server-side fog. Runefall replicates state instead.

**Tradeoff:** movement waits on the server. Ability feedback is predicted and hits are lag-compensated (a 400 ms
rewind window), and movement prediction stays a backlog option.

### Determinism, with limits

Determinism is guaranteed on the same build and platform, which covers replays and tests today.

**Tradeoff:** cross-platform determinism stays unverified until a Linux test runner exists.

### Exact line of sight

Vision is exact line of sight between units rather than a lit grid. It's symmetric, the same check serves casts, and
it's cheap.

### The server as a library

The match server is a library with a thin executable, so the practice tool, the harness, and the tests all run the
real server code.

### Steam's relay as the only transport

First Playable was meant to be played online, so Steam Datagram Relay became the only network transport and the
planned LiteNetLib layer was dropped. A relay needs no public IP, open port, or DDoS shield, so any machine can host,
and an in-memory loopback with a seeded fault model covers practice, tests, and CI.

**Tradeoff:** every peer needs a logged-in Steam client, so the relay itself stays out of the automated gate.

### Let Steam carry what it does for free

Steam provides accounts, friends, invites, parties as lobbies, and cloud saves for kits. Matchmaking and rating stay
in-house. Until beta the game servers run on my own PC, and with the relay in front, the hosting provider can be
chosen later, region by region.

## By the numbers

- 5,000+ tests and three golden replays: practice, an arena match, and a dungeon pull.
- One server core holds 41 simultaneous 3v3 matches with 30 Hz snapshots, or 31 at 60 Hz. One match ticks in 0.08 ms
  at the median and 0.43 ms at p99.
- Each client's worst second of a 3v3 is 80 kbps, down from 198, after delta snapshots and packet coalescing.
- Fog of war under 20 µs per tick with 25 units a side.
- Pathfinding in under half a millisecond across the arena.
- The dedicated server's worst first-minute tick went from 44 ms to 8 ms by shipping precompiled code.
- 450+ tickets and a decision log of 400+ entries.

## What's next

- **Core loop (done):** the Rune Forge in game, and the full match flow and HUD.
- **First playable (done):** two people and bots finish a best of three online, across two machines.
- **Online (now):** matchmaking with a hidden rating and bot backfill, reconnect, prediction and lag compensation,
  parties, hosted custom matches, and observers are built. The milestone review is next.
- **Raid:** the milestone that delivers the dungeon. Its systems are in, and the first real boss, a tuning pass and an
  outside group's clear are left.
- **Assets:** art and audio, made once against finished systems. Until then everything stays greybox.
- **Balance, alpha, and beta:** a closed beta through Steam Playtest, then Early Access.
- **After beta:** a ranked ladder with seasonal cosmetics and a replay viewer.
- **Still open:** progression beyond cosmetics, and whether keys, affixes, or loot come to the dungeon.

---

Source is a private repository. [Ask for access](mailto:ajshaham@gmail.com?subject=Runefall%20access) and I'll share
the GDD and a build walkthrough.
