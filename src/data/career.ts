/**
 * Experience, one line a role, in the résumé's order. The résumé PDF (site.resume) carries the detail, so keep titles,
 * dates and numbers in step with it. The 2018 QA internship stays here although the one-page résumé dropped it.
 */

export interface Job {
  ref: string;
  when: string;
  title: string;
  org: string;
  /** One sentence on the work. The résumé has the rest. */
  summary?: string;
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
    summary:
      'Building Runefall, a classless multiplayer RPG, on my own: a deterministic, server-authoritative 60 Hz simulation that runs 41 matches on one CPU core, online over Steam with lag compensation and reconnect, and 5,000+ xUnit tests.',
  },
  {
    ref: '$bigfix',
    when: 'MAY 2023 – FEB 2025',
    title: 'Software Engineer II',
    org: 'HCL BigFix, converted from intern',
    breakdown: 'bigfix-components',
    summary:
      'Built the React and Material UI component library that 100+ engineers in 7+ apps shipped with, moved global state to Zustand, and added Tenable SC and IO to the security ingestion pipeline.',
  },
  {
    ref: '$trader',
    when: 'FEB 2025 – FEB 2026',
    title: 'Independent Trader',
    org: 'Self-employed',
    summary:
      'Traded stocks full time with my own capital, using Python scripts for price data, backtests, broker exports and alerts.',
  },
  {
    ref: '$freelance',
    when: 'SEP 2022 – JAN 2023',
    title: 'Freelance Web Developer',
    org: 'Healthcare clinic',
    summary: 'An accessible, multilingual React landing page.',
  },
  {
    ref: '$qa',
    when: 'JUN – SEP 2018',
    title: 'QA Engineering Intern',
    org: 'King Nutronics Corporation',
    summary:
      'Tested U.S. Navy calibration hardware for MIL-STD compliance, and automated the test beds to cut testing time by about 80%.',
  },
  {
    ref: '$ucsc',
    when: 'SEP 2017 – JUN 2022',
    title: 'B.S. Computer Science: Computer Game Design',
    org: 'University of California, Santa Cruz',
  },
];
