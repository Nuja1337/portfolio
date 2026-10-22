/**
 * Runefall: milestone status, the hero card, and its core tenets.
 * Source of truth for the game itself is the GDD; this file only holds what the portfolio shows.
 * The Rune Forge stays sealed here on purpose: no pillars, runes, or pricing rules.
 */

export type MilestoneStatus = 'done' | 'now' | 'todo';

export interface Milestone {
  name: string;
  status: MilestoneStatus;
}

export const milestones: readonly Milestone[] = [
  { name: 'Pre-production', status: 'done' },
  { name: 'Prototype', status: 'done' },
  { name: 'Core loop', status: 'done' },
  { name: 'First playable', status: 'done' },
  { name: 'Online', status: 'now' },
  { name: 'Raid', status: 'todo' },
  { name: 'Assets', status: 'todo' },
  { name: 'Balance', status: 'todo' },
  { name: 'Alpha', status: 'todo' },
  { name: 'Beta', status: 'todo' },
];

export const closedMilestones = milestones.filter((m) => m.status === 'done').length;

export const game = {
  name: 'Runefall',
  role: 'Independent game developer',
  since: 'Feb 2026',
  stack: ['Godot 4', 'C#', '.NET 10', 'Steamworks'],
  status: 'playable online, with the Online milestone in progress',
} as const;

export interface SpecRow {
  label: string;
  text: string;
}

export const spec: readonly SpecRow[] = [
  {
    label: 'Modes',
    text: '1v1, 2v2 and 3v3 arenas, best of three. A five-player dungeon shaped like Mythic+, with one boss so far in an arena of its own. Custom matches with bots and observers, and a practice tool. Casual queues at beta, ranked after that.',
  },
  {
    label: 'Kit',
    text: 'Ten abilities you build yourself, plus one resource, one armor, and one weapon. Builds are shared by code.',
  },
  {
    label: 'Arena',
    text: 'One PvP arena at launch, built around pillars and cover that break line of sight. Each dungeon boss fights in an arena of its own.',
  },
  {
    label: 'Combat',
    text: 'Top-down camera, click-to-move, and instant turn to cursor, with fake-casting, orb-walking, and skillshots.',
  },
  {
    label: 'Damage',
    text: 'Physical and magic across seven schools, all through one server-side pipeline.',
  },
  {
    label: 'Control',
    text: 'Crowd control with diminishing returns and a hostage guard, so nobody gets chain-held. Breakouts come from your own kit, not trinkets.',
  },
  {
    label: 'Rounds',
    text: 'There are no draws. A round that downs everyone goes to the side with more players standing, then more health. There are no remakes either, but if a teammate leaves, the rest can forfeit without losing rating.',
  },
  {
    label: 'Matchmaking',
    text: 'Casual queues with a ready check and a hidden rating. Parties are Steam lobbies, and bots fill the seats when a queue runs short.',
  },
  {
    label: 'Netcode',
    text: 'A server-authoritative simulation over Steam Datagram Relay, with snapshots culled by team vision so fog of war holds on the wire, predicted ability feedback, lag compensation, reconnect, and deterministic replays.',
  },
  { label: 'Business', text: 'Free-to-play on Steam, cosmetics only. No pay-to-win.' },
  {
    label: 'Docs',
    text: 'A game design document, a ten-milestone roadmap, a decision log of 400+ entries, and a YouTrack board.',
  },
];

export interface Tenet {
  ref: string;
  title: string;
  text: string;
}

/** Core tenets: what the game is for and what makes it exciting to play. Drawn from GDD v5.1 §1.4–1.6 and §10. */
export const tenets: readonly Tenet[] = [
  {
    ref: '$run-01',
    title: 'Build your class',
    text: 'There are no classes, talents or heroes. Your combat identity is ten abilities you put together yourself, and every option is open from your first match. "Warrior" is just what the community ends up calling your build.',
  },
  {
    ref: '$run-02',
    title: 'Learn a kit by surviving it',
    text: 'Nobody has seen your kit before the gates open. Opponents discover your abilities as you use them, and each one appears on their frames. Best of three, so by round three both teams know exactly what they are up against.',
  },
  {
    ref: '$run-03',
    title: 'Readability is a mechanic',
    text: "In a top-down fight, players can only answer what they can read. Team colors are colorblind-safe, silhouettes come before detail, and every windup is drawn on the floor for its full cast. Bosses speak the same telegraph language as players, so the arena teaches the dungeon.",
  },
  {
    ref: '$run-04',
    title: 'One kit, arena and dungeon',
    text: 'The abilities you forge for the arena carry straight into a five-player dungeon. There are no warning addons, so you learn the boss by watching it, and threat is shown relative to whoever holds it.',
  },
  {
    ref: '$run-05',
    title: 'Hands over homework',
    text: "You queue, you fight and you're done. There's nothing to farm, no lockouts, no gear and no time-gated power. Theorycrafting still matters, and it can be borrowed, since builds are shared, so a great pilot with an imported kit beats a brilliant theorycrafter who can't execute.",
  },
  {
    ref: '$run-06',
    title: "Fog hides; it doesn't protect",
    text: 'The server runs the fight and the client only draws it. Vision decides what the server sends, so hidden players never reach your machine and a map hack has nothing to show. A skillshot still hits whoever stands in it, seen or not.',
  },
];
