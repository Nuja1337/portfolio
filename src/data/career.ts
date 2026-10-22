/** Experience. Mirrors the résumés (the software and grad school versions also carry the QA internship). */

export interface Job {
  ref: string;
  when: string;
  title: string;
  org: string;
  points?: string[];
  /** Slug of a breakdown in src/content/breakdowns. The entry links it once the breakdown is published. */
  breakdown?: string;
}

export const jobs: readonly Job[] = [
  {
    ref: '$chuken',
    when: 'FEB 2026 – PRESENT',
    title: 'Independent Game Developer',
    org: 'Chuken Studios',
    breakdown: 'runefall',
    points: [
      'Building Runefall, a classless arena-and-dungeon RPG for PC, on my own. I handle the design, the gameplay and server code, and production, planned through a GDD, a ten-milestone roadmap and 450+ YouTrack tickets.',
      'Designed the Rune Forge, the system that replaces classes, and built the combat it runs on: casts, channels, projectiles, interrupts, and six crowd-control categories with diminishing returns.',
      'Built an engine-free, server-authoritative 60 Hz simulation with deterministic replays, backed by 5,000+ xUnit tests.',
      'Took it online over Steam Datagram Relay with a dedicated server, vision-filtered delta snapshots, lag compensation and reconnect, plus a matchmaker with hidden ratings that fills empty seats with bots. One server core holds 41 matches.',
    ],
  },
  {
    ref: '$bigfix',
    when: 'AUG 2023 – FEB 2025',
    title: 'Frontend Software Engineer',
    org: 'HCL BigFix, SaaS',
    breakdown: 'bigfix-components',
    points: [
      'Built and maintained a React and Material UI component library adopted by 100+ engineers in 7+ apps, cutting duplicated UI code by about a third.',
      'Shipped 100+ versioned, documented components at 95%+ test coverage, plus an internal Storybook-style workbench where engineering, QA, and design reviewed components together.',
      'Moved global state to Zustand, simplifying shared state logic and reducing component re-renders by about 60%.',
      'Delivered major features through CI/CD (GitHub Actions, Jenkins) into alpha, beta, and stable releases with under 5% regression, on a plugin-based architecture that let teams ship independently.',
      'Mentored four engineers across teams on onboarding, design-system usage, and architectural standards.',
    ],
  },
  {
    ref: '$intern',
    when: 'MAY – AUG 2023',
    title: 'Full-stack Software Engineering Intern',
    org: 'HCL BigFix, WebUI',
    points: [
      'Integrated Tenable SC and IO into the ingestion pipeline (Node.js, SQL, REST), expanding security-platform coverage by 66%.',
      'Redesigned the Insights datasource setup flow with UX and backend teams, reducing configuration errors by about 13%.',
    ],
  },
  {
    ref: '$freelance',
    when: '2022 – 2023',
    title: 'Web Developer',
    org: 'Freelance',
    points: [
      'Built a responsive landing page for a healthcare clinic in React and JavaScript, with a language switcher for translated content.',
      'Made it accessible, with semantic HTML, screen-reader labels, full keyboard navigation and WCAG AA color contrast.',
    ],
  },
  {
    ref: '$qa',
    when: 'JUN – SEP 2018',
    title: 'QA Engineering Intern',
    org: 'King Nutronics Corporation',
    points: [
      'Tested calibration hardware used by the U.S. Navy for MIL-STD compliance, and found and corrected about 20 critical errors in documentation and logging.',
      'Cut QA testing time by about 80% by automating test beds through CAD and microcontroller integration.',
      'Wrote QA procedures that made testing repeatable.',
    ],
  },
  {
    ref: '$ucsc',
    when: 'SEP 2017 – JUN 2022',
    title: 'B.S. Computer Science: Computer Game Design',
    org: 'University of California, Santa Cruz',
  },
];
