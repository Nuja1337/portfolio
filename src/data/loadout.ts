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
      'Godot 4 (.NET), Unreal Engine 5 (C++, GAS), Unity, Phaser',
      'Server-authoritative netcode and deterministic simulation, Steamworks',
      'React, React Router, Next.js, Remix, Zustand, Material UI',
      'Node.js, Hono, Express, ASP.NET Core, PostgreSQL, SQLite',
      'Cloudflare Workers, D1, R2, Durable Objects, KV, Workers AI',
    ],
  },
  {
    title: 'Production',
    quality: 'epic',
    items: [
      'Milestone planning, scope decisions, cut lists',
      'YouTrack and Jira',
      'Git, Diversion, GitHub Actions, Jenkins',
      'Vitest, xUnit, Jest, Playwright',
      'Mentoring and cross-team design systems',
      'AI-assisted development with Claude Code and MCP',
    ],
  },
];
