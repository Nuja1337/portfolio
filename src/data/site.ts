/** Site-wide identity, links, and the section map that drives the nav, action bar, keybinds, and console. */

export const site = {
  name: 'Alexander Shaham',
  studio: 'Chuken Studios',
  title: 'Alexander Shaham: gameplay and full-stack engineer',
  description:
    'Alexander Shaham is a gameplay and full-stack engineer who builds real-time multiplayer games and the web tools around them. Building Runefall, a competitive arena RPG; formerly a frontend engineer at HCL BigFix.',
  url: 'https://portfolio.ajshaham.workers.dev',
  location: 'Los Angeles',
  email: 'ajshaham@gmail.com',
  resumes: [
    { id: 'game', label: 'Game dev résumé', href: '/AlexanderShahamResume-GameDev.pdf' },
    { id: 'software', label: 'Software résumé', href: '/AlexanderShahamResume-Software.pdf' },
  ],
  version: '5.0',
  links: {
    github: 'https://github.com/Nuja1337',
    linkedin: 'https://www.linkedin.com/in/alexander-shaham/',
    leetcode: 'https://leetcode.com/ajshaham1337/',
    discord: 'https://discordapp.com/users/249029416590639107',
  },
} as const;

export type IconId =
  'g-mark' | 'd-home' | 'i-crown' | 'd-sword' | 'd-pad' | 'd-badge' | 'd-wrench' | 'd-star' | 'd-quill' | 'd-mail';

export interface Section {
  /** Element id on the home page. */
  id: string;
  label: string;
  icon: IconId;
  /** Shown in the top nav (the action bar always shows every section). */
  nav: boolean;
  /** A page of its own instead of an anchor on the home page (the blog). */
  href?: string;
}

/** Order matters: slot N of the action bar answers key N. */
export const sections: readonly Section[] = [
  { id: 'top', label: 'Top', icon: 'd-home', nav: false },
  { id: 'featured', label: 'Featured', icon: 'i-crown', nav: true },
  { id: 'experience', label: 'Experience', icon: 'd-badge', nav: true },
  { id: 'projects', label: 'Projects', icon: 'd-pad', nav: true },
  { id: 'skills', label: 'Skills', icon: 'd-wrench', nav: false },
  { id: 'about', label: 'About', icon: 'd-star', nav: true },
  { id: 'contact', label: 'Contact', icon: 'd-mail', nav: true },
  { id: 'blog', label: 'Blog', icon: 'd-quill', nav: true, href: '/blog' },
];

export const mailto = (subject?: string) =>
  `mailto:${site.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

/**
 * Links that leave the page open in a new tab: other sites and files (the résumé PDF, the RSS feed).
 * Moving around this site, and mail links, stay in place. Spread onto an anchor: <a href={x} {...newTab(x)}>.
 */
export function opensNewTab(href: string): boolean {
  return /^https?:\/\//.test(href) || /\.(pdf|xml)(?:[?#]|$)/i.test(href);
}

export const newTab = (href: string) =>
  opensNewTab(href) ? ({ target: '_blank', rel: 'noopener' } as const) : ({} as Record<string, never>);
