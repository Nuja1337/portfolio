/**
 * Every project card. The four in `featured` lead the home page; the rest fill the Projects board in deck order,
 * live and in-progress work first.
 */
import type { ImageMetadata } from 'astro';
import { mailto } from './site';

import qoth from '../assets/board/qoth.webp';
import wordleCube from '../assets/board/wordle-cube.webp';
import retrosu from '../assets/board/retrosu.webp';
import keepieUppies from '../assets/board/keepie-uppies.webp';
import puffedUp from '../assets/board/puffed-up.webp';
import barf from '../assets/board/barf.webp';
import beastWithin from '../assets/board/beast-within.webp';
import logsShot from '../assets/board/logs.webp';
import simsShot from '../assets/board/sims.webp';
import draftsShot from '../assets/board/drafts.webp';
import tallyShot from '../assets/board/tally.webp';
import portfolioShot from '../assets/board/portfolio.webp';
import runefallShot from '../assets/runefall/gameplay.webp';
import guildGolemShot from '../assets/board/guild-golem.webp';

/** Filter tags, in the order the filter bar shows them. */
export const filters = [
  { id: 'all', label: 'All' },
  { id: 'game', label: 'Games' },
  { id: 'web', label: 'Web apps' },
  { id: 'tool', label: 'Tools' },
  { id: 'design', label: 'Design' },
  { id: 'live', label: 'Live' },
  { id: 'solo', label: 'Solo' },
  { id: 'team', label: 'Team' },
] as const;

export type FilterId = (typeof filters)[number]['id'];
export type Tag = Exclude<FilterId, 'all'>;

export const decks = [
  {
    id: 'web',
    title: 'Web apps',
    meta: 'Built on Cloudflare Workers. Retired apps keep their breakdowns.',
  },
  {
    id: 'games',
    title: 'Games',
    meta: 'Shipped, from game jams to the Play Store. The old builds are offline.',
  },
  { id: 'tools', title: 'Tools and design', meta: 'This site, studio infrastructure, small tools, and design work.' },
] as const;

export type DeckId = (typeof decks)[number]['id'];

/** Item quality sets the title color: legend is in progress, epic is shipped or live, rare is a prototype or archived. */
export type Quality = 'legend' | 'epic' | 'rare';
export type StateKind = 'progress' | 'live' | 'shipped' | 'archived';

export interface Project {
  /** Unique card reference, shown in the card header. */
  ref: string;
  title: string;
  deck: DeckId;
  quality: Quality;
  state: { kind: StateKind; label: string };
  role: string;
  summary: string;
  /** One line for the featured cards, where the full summary would be too long. */
  pitch?: string;
  /** Slug of a breakdown in src/content/breakdowns. The card links it once the breakdown is published. */
  breakdown?: string;
  /** Its public repository, linked from the card where there's no breakdown. */
  source?: string;
  stack: string[];
  tags: Tag[];
  image?: { src: ImageMetadata; alt: string; position?: string };
  /** An https or mailto link, or an in-page anchor. */
  link?: { label: string; href: string };
  /** Part of a featured project (the worldbuilding is part of Runefall), so it stays off the board. */
  partOf?: string;
  /** Old builds that are no longer hosted: the card says so instead of linking to a dead page. */
  offline?: boolean;
}

export const projects: readonly Project[] = [
  // ---- Runefall ----
  {
    ref: '$run',
    title: 'Runefall',
    deck: 'games',
    quality: 'legend',
    state: { kind: 'progress', label: 'In development' },
    role: 'Solo, Feb 2026 to present',
    summary:
      'A competitive arena-and-dungeon RPG with no classes. Players build their own kits, and matches run online through Steam’s relay network on a server-authoritative 60 Hz simulation, with fog of war enforced by the server.',
    pitch: 'A classless arena-and-dungeon RPG where every player builds their own kit from ten abilities.',
    breakdown: 'runefall',
    stack: ['Godot 4', 'C#', '.NET 10', 'Steamworks'],
    tags: ['game', 'solo'],
    image: {
      src: runefallShot,
      alt: 'Runefall in engine: a top-down 3v3 arena round in greybox, with team frames and an eight-slot ability bar',
      position: 'center 40%',
    },
  },

  // ---- Web apps ----
  {
    ref: '$wow',
    title: 'Guild Golem',
    deck: 'web',
    quality: 'legend',
    state: { kind: 'live', label: 'Live beta' },
    role: 'Solo, Oct 2026 to present',
    summary:
      'Guild management for World of Warcraft: Forever. It has a raid calendar with Discord sign-ups, a raid planner and splits, the roster and attendance, loot by council, EPGP or DKP, the guild bank and a Discord bot. Combat logs and sims are built in, rebuilt from my earlier Logs and Sims apps.',
    pitch:
      'Guild management for World of Warcraft: Forever, with raids, roster, loot and a Discord bot, plus built-in combat logs and sims.',
    breakdown: 'wow-companion',
    stack: ['TypeScript', 'React Router', 'Hono', 'Cloudflare Workers', 'D1', 'R2'],
    tags: ['web', 'tool', 'solo', 'live'],
    image: {
      src: guildGolemShot,
      alt: 'Guild Golem’s home page: “Everything for WoW Forever, except playing it,” beside an example Molten Core night with 38 of 40 signed up and each role counted against its target',
      position: 'left top',
    },
    link: { label: 'Open', href: 'https://guildgolem.com' },
  },
  {
    ref: '$logs',
    title: 'Logs',
    deck: 'web',
    quality: 'rare',
    state: { kind: 'archived', label: 'Retired' },
    role: 'Solo, 2026',
    summary:
      'Combat-log analytics for World of Warcraft: Forever, rebuilt from my earlier Remix visualizer. Logs were parsed in the browser, in a Web Worker, into report, fight, and player pages, fight stories, and raid-team health for guild managers. Retired in October 2026 for Guild Golem, which rebuilt its log analysis inside the guild app.',
    pitch: 'Parsed 1M+ event combat logs in a browser Web Worker into fight, player, and raid-team reports.',
    breakdown: 'logs',
    stack: ['TypeScript', 'React', 'Hono', 'Cloudflare Workers', 'D1'],
    tags: ['web', 'tool', 'solo'],
    image: {
      src: logsShot,
      alt: 'Logs fight page for an Onyxia kill: a timeline of boss health, adds, deaths, cooldowns, and hazards, with who took, healed, and dealt the most',
      position: 'left top',
    },
    offline: true,
  },
  {
    ref: '$sims',
    title: 'Sims',
    deck: 'web',
    quality: 'rare',
    state: { kind: 'archived', label: 'Retired' },
    role: 'Solo, 2026',
    summary:
      'A combat simulator for World of Warcraft: Forever, with every known Forever change layered on the Classic Anniversary numbers. A deterministic, event-driven engine simmed DPS, tanking, healing, and scripted raid encounters on every CPU core through Web Workers, with stat weights and best-in-slot gear. Retired in October 2026 for Guild Golem, which rebuilt its sim on the game client’s own data.',
    pitch: 'Deterministic, event-driven combat simulator that ran raid encounters on every CPU core, in the browser.',
    breakdown: 'sims',
    stack: ['TypeScript', 'React', 'Zustand', 'Web Workers', 'Cloudflare Workers'],
    tags: ['web', 'tool', 'solo'],
    image: {
      src: simsShot,
      alt: 'Sims results for a Fury Warrior: DPS summary, a DPS distribution histogram, damage over time, and damage by ability',
      position: 'left top',
    },
    offline: true,
  },
  {
    ref: '$drafts',
    title: 'Drafts',
    deck: 'web',
    quality: 'epic',
    state: { kind: 'live', label: 'Live' },
    role: 'Solo, 2026 to present',
    summary:
      "Team-aware pick/ban drafting for League of Legends and Dota 2. Real-time draft rooms suggest picks and bans from matchups, synergies, comp needs, and each player's champion pool, with an AI draft coach and live Dota data.",
    pitch: 'Real-time League of Legends and Dota 2 draft rooms that suggest picks and bans, with an AI draft coach.',
    source: 'https://github.com/Nuja1337/drafts',
    stack: ['TypeScript', 'React', 'Hono', 'Durable Objects', 'D1', 'KV', 'Workers AI'],
    tags: ['web', 'tool', 'solo', 'live'],
    image: {
      src: draftsShot,
      alt: 'A Drafts room mid-draft: both teams’ bans and picks, the champion grid, and the analysis panel ranking what the enemy team most likely picks next',
      position: 'center top',
    },
    link: { label: 'Open', href: 'https://drafts.ajshaham.workers.dev' },
  },
  {
    ref: '$tally',
    title: 'Tally',
    deck: 'web',
    quality: 'epic',
    state: { kind: 'live', label: 'Live' },
    role: 'Solo, 2026 to present',
    summary:
      'A local-first training and nutrition log that works fully offline, with optional multi-device sync that merges conflicting edits, a 400-exercise library with muscle maps, and eight languages. It uses no framework and has no build step.',
    pitch: 'A local-first training and nutrition log that works offline and syncs across devices without an account.',
    source: 'https://github.com/Nuja1337/tally',
    stack: ['JavaScript', 'IndexedDB', 'PWA', 'Cloudflare Workers', 'D1'],
    tags: ['web', 'tool', 'solo', 'live'],
    image: {
      src: tallyShot,
      alt: "Tally's Today page: calorie and protein rings, the day's plan, and logged meals",
      position: 'left top',
    },
    link: { label: 'Open', href: 'https://tally.ajshaham.workers.dev' },
  },
  {
    ref: '$site',
    title: 'This portfolio',
    deck: 'tools',
    quality: 'epic',
    state: { kind: 'live', label: 'You are here' },
    role: 'Solo, 2022 to present',
    summary:
      'Version five, built with Astro and TypeScript. It has two skins with hero art generated in code at build time, a dev console and a blog. It runs on Cloudflare Workers and is tested with Vitest, Playwright and axe.',
    stack: ['Astro', 'TypeScript', 'Canvas', 'Cloudflare Workers'],
    tags: ['web', 'solo', 'live'],
    image: {
      src: portfolioShot,
      alt: 'This portfolio: the moonlit hero and the headline',
      position: 'left top',
    },
  },

  // ---- Games ----
  {
    ref: '$qoth',
    title: 'Queen of the Hill',
    deck: 'games',
    quality: 'epic',
    state: { kind: 'shipped', label: 'Shipped' },
    role: 'Programmer and producer, team of 6',
    summary: 'An idle-clicker where you grow an ant colony one tap at a time.',
    stack: ['JavaScript'],
    tags: ['game', 'team'],
    image: { src: qoth, alt: 'Queen of the Hill title screen with pixel-art ants', position: 'center 30%' },
    offline: true,
  },
  {
    ref: '$cube',
    title: 'Wordle Cube',
    deck: 'games',
    quality: 'epic',
    state: { kind: 'shipped', label: 'Shipped' },
    role: 'Solo',
    summary: "Wordle, except the letters live on the faces of a Rubik's cube you have to solve.",
    stack: ['Unity', 'C#'],
    tags: ['game', 'solo'],
    image: { src: wordleCube, alt: 'Wordle Cube: a 3D cube of lettered tiles beside a word grid' },
    offline: true,
  },
  {
    ref: '$osu',
    title: 'RetrOsu',
    deck: 'games',
    quality: 'epic',
    state: { kind: 'shipped', label: 'Shipped' },
    role: 'Programmer, team of 2',
    summary: 'A precision clicking game inspired by osu!, built as a duo.',
    stack: ['JavaScript', 'crisp-game-lib'],
    tags: ['game', 'team'],
    image: { src: retrosu, alt: 'RetrOsu: a retro-styled precision clicking game' },
    offline: true,
  },
  {
    ref: '$keep',
    title: 'Keepie Uppies',
    deck: 'games',
    quality: 'epic',
    state: { kind: 'shipped', label: 'Shipped' },
    role: 'Programmer, team of 5',
    summary: 'An infinite runner for Android about staying in the air, with multiple unlockable themes.',
    stack: ['Unity', 'C#', 'Android'],
    tags: ['game', 'team'],
    image: { src: keepieUppies, alt: 'Keepie Uppies title on a hanging wooden sign' },
    offline: true,
  },
  {
    ref: '$puff',
    title: 'Puffed Up',
    deck: 'games',
    quality: 'epic',
    state: { kind: 'shipped', label: 'Shipped' },
    role: 'Programmer and producer, team of 3',
    summary: 'A pufferfish knight fights through a dangerous dungeon.',
    stack: ['Phaser 3', 'JavaScript'],
    tags: ['game', 'team'],
    image: { src: puffedUp, alt: 'Puffed Up title screen over a blue cave background' },
    offline: true,
  },
  {
    ref: '$barf',
    title: 'BarF',
    deck: 'games',
    quality: 'epic',
    state: { kind: 'shipped', label: 'Shipped' },
    role: 'Programmer and producer, team of 3',
    summary: "A salaryman's night of shenanigans after clocking out from work.",
    stack: ['Phaser 3', 'JavaScript'],
    tags: ['game', 'team'],
    image: { src: barf, alt: 'BarF title screen on a pixel-art city street at night' },
    offline: true,
  },
  {
    ref: '$beast',
    title: 'Beast Within',
    deck: 'games',
    quality: 'epic',
    state: { kind: 'shipped', label: 'Jam' },
    role: 'Programmer and producer, team of 2',
    summary: 'A story-driven jam game made for Ludum Dare 49, on the theme Unstable.',
    stack: ['Phaser 3', 'JavaScript', '48h jam'],
    tags: ['game', 'team'],
    image: { src: beastWithin, alt: 'Beast Within: hand-drawn comic panels of a man in a bar' },
    offline: true,
  },

  // ---- Tools and design ----
  {
    ref: '$lore',
    title: 'Runefall worldbuilding',
    deck: 'tools',
    quality: 'legend',
    state: { kind: 'progress', label: 'In progress' },
    role: 'Solo, world design and writing',
    summary:
      'The dark-fantasy world bible for Runefall, kept separate from the mechanics. It covers a coastal city-state built in layers, eight peoples, seven imprisoned powers and ten thousand years of history since the collapse. The tone is grimdark with a hopeful core, and every name is still a working name.',
    stack: ['Narrative', 'World-building'],
    tags: ['design', 'solo'],
    link: { label: 'Excerpt on request', href: mailto('Runefall worldbuilding excerpt') },
    partOf: '$run',
  },
  {
    ref: '$pipe',
    title: 'Chuken Studios pipeline',
    deck: 'tools',
    quality: 'epic',
    state: { kind: 'live', label: 'Running' },
    role: 'Solo, studio infrastructure',
    summary:
      'A Discord dev server with role and channel architecture, audit logging, and GitHub webhooks for commits, pull requests, builds, and issues, provisioned by a Node.js setup script. A GitHub Actions bot posts a game design reading every morning.',
    stack: ['Node.js', 'discord.js', 'GitHub Actions'],
    tags: ['tool', 'solo', 'live'],
  },
  {
    ref: '$cloato',
    title: 'Cloato',
    deck: 'tools',
    quality: 'rare',
    state: { kind: 'archived', label: 'Prototype' },
    role: 'UI/UX designer, team of 4',
    summary: 'A high-fidelity mobile prototype for organizing your closet and planning outfits.',
    stack: ['Figma', 'UI/UX'],
    tags: ['design', 'team'],
    offline: true,
  },
  {
    ref: '$waiver',
    title: 'Easy Waiver',
    deck: 'tools',
    quality: 'rare',
    state: { kind: 'archived', label: 'For fun' },
    role: 'Solo',
    summary:
      "One-tap guest waivers for a gym's guest pass. Save a preset for each guest, and they submit the waiver with a button instead of refilling a long form that never autocompleted well.",
    stack: ['TypeScript', 'React'],
    tags: ['web', 'tool', 'solo'],
    offline: true,
  },
  {
    ref: '$guess',
    title: 'Wordle Guesser',
    deck: 'tools',
    quality: 'rare',
    state: { kind: 'archived', label: 'For fun' },
    role: 'Solo',
    summary:
      'Enter your Wordle guesses and which letters landed in the right or wrong spot, and it lists every five-letter word still possible, weighted by how common each word is so the likeliest answers come first.',
    stack: ['React', 'Material UI'],
    tags: ['web', 'tool', 'solo'],
    offline: true,
  },
];

/** The home page's lead row, in order. Everything else goes on the Projects board. */
export const featured = ['$run', '$wow', '$tally', '$drafts'] as const;
export const featuredProjects = featured.map((ref) => projects.find((p) => p.ref === ref)!);
export const boardProjects = projects.filter((p) => !(featured as readonly string[]).includes(p.ref) && !p.partOf);

export const liveApps = projects.filter((p) => p.deck === 'web' && p.state.kind === 'live' && p.ref !== '$site').length;
export const gamesShipped = projects.filter((p) => p.deck === 'games' && p.state.kind === 'shipped').length;
