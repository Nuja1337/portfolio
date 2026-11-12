/** Loadout: skills, grouped the way the work splits. Matches the résumé's technical skills. */

export interface LoadoutColumn {
  title: string;
  quality: 'legend' | 'epic' | 'rare';
  items: string[];
}

export const loadout: readonly LoadoutColumn[] = [
  {
    title: 'Design',
    quality: 'legend',
    items: [
      'Combat and ability systems',
      'Classless build systems',
      'PvP balance: diminishing returns and crowd-control rules',
      'Encounter design and telegraph readability',
      'HUD and UX readability',
      'GDDs, roadmaps, and decision logs',
      'UI/UX prototyping in Figma',
      'World-building',
    ],
  },
  {
    title: 'Engineering',
    quality: 'rare',
    items: [
      'C#, C++, TypeScript, JavaScript, Python, SQL, GDScript, Java',
      'Godot 4 (.NET), Unreal Engine 5 (C++, Blueprints, GAS), Unity, Phaser',
      'Server-authoritative netcode and deterministic simulation, Steamworks and Steam Datagram Relay',
      'React, React Router, Next.js, Remix, Zustand, Material UI, Tailwind, PWAs',
      'Node.js, Hono, Express, ASP.NET Core, REST, WebSockets, PostgreSQL, SQLite',
      'Cloudflare Workers, D1, R2, Durable Objects, KV, Workers AI, Docker, Linux',
    ],
  },
  {
    title: 'Production',
    quality: 'epic',
    items: [
      'Milestone planning, scope decisions, cut lists',
      'YouTrack and Jira',
      'Git, Diversion, GitHub Actions, Jenkins',
      'Vite, Vitest, xUnit, Jest, Playwright',
      'Mentoring and cross-team design systems',
      'AI-assisted development with Claude Code and MCP',
    ],
  },
];
