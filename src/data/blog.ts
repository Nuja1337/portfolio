/** Blog sections. Every post picks one in its front matter (`category: design`); the blog index groups by them. */

export const categories = [
  {
    id: 'devlog',
    title: 'Devlogs',
    icon: 'd-sword',
    blurb: 'Runefall, milestone by milestone: what shipped, what got cut, and why.',
  },
  {
    id: 'design',
    title: 'Game design',
    icon: 'i-scroll',
    blurb: 'Theorycrafting, arena balance, raid encounters, and the games that shaped how I think.',
  },
  {
    id: 'engineering',
    title: 'Engineering',
    icon: 'd-wrench',
    blurb: 'Netcode, simulation, tooling, and the web apps: Guild Golem, Drafts, and Tally.',
  },
  {
    id: 'opinions',
    title: 'Opinions',
    icon: 'i-speech',
    blurb: 'Takes on games, design, and the industry. Some of them are even right.',
  },
  {
    id: 'stories',
    title: 'Stories',
    icon: 'i-crown',
    blurb: 'Raid nights, ranked climbs, amateur leagues, and lessons from the mat.',
  },
] as const;

export type CategoryId = (typeof categories)[number]['id'];
export const categoryIds = categories.map((c) => c.id) as [CategoryId, ...CategoryId[]];
export const categoryTitle = (id: CategoryId) => categories.find((c) => c.id === id)?.title ?? id;
