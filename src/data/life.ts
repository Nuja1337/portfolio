/** About: a raid record, life outside work, Doktor, and the mat. Each card says something the rest of the site does not. */
import type { ImageMetadata } from 'astro';
import akita from '../assets/life/akita.webp';

export type LifeIcon =
  | 'i-mat'
  | 'i-ball'
  | 'i-crown'
  | 'd-pad'
  | 'i-scroll'
  | 'i-book'
  | 'i-compass'
  | 'i-pot'
  | 'i-knight'
  | 'i-paw'
  | 'i-sword';

/** Warcraft Logs parse brackets, by percentile: 100, 99, 95 to 98, 75 to 94, 50 to 74, 25 to 49, below 25. */
export type Parse = 'artifact' | 'astounding' | 'legendary' | 'epic' | 'rare' | 'uncommon' | 'common';

export interface Stat {
  value: string;
  label: string;
  /** Where and when, in smaller type under the label. */
  note?: string;
  /** Colors the value the way Warcraft Logs colors a parse. A world or server rank uses its percentile: #1 is 100. */
  parse?: Parse;
}

export interface Achievement {
  title: string;
  icon: LifeIcon;
  text: string;
  /** Columns the card spans on desktop (the grid has three). Cards with a photo span two rows. */
  span?: 2 | 3;
  stats?: readonly Stat[];
  photo?: { src: ImageMetadata; alt: string };
  /** A plain card, without the "achievement earned" stamp. */
  plain?: boolean;
}

/** Grid order matters: three columns, and the photo card takes two rows beside the short version and the mat. */
export const achievements: readonly Achievement[] = [
  {
    title: 'Competitive gaming',
    icon: 'i-crown',
    span: 3,
    text: "I've played Warcraft III and World of Warcraft since I was a little kid, and I play to compete: main tank, healer, and damage in high-end speed runs, plus the guild leading and raid-team management that keeps them running. I read Warcraft Logs for fun. Outside of Azeroth, I played League of Legends competitively, for my university and on an amateur team; two of my teammates went on to play professionally.",
    stats: [
      {
        value: '#2',
        parse: 'astounding',
        label: 'World, overall damage',
        note: 'Blackwing Lair, Fury Warrior, Classic Anniversary',
      },
      { value: '#1', parse: 'artifact', label: 'Server, overall damage', note: 'Fury Warrior, Classic Anniversary' },
      {
        value: '99.6',
        parse: 'astounding',
        label: 'Best perf. average, Karazhan',
        note: 'Fury Warrior, TBC Classic (2021), with #1 world parses in phase and the world-first Nightbane kill',
      },
      {
        value: '96.0',
        parse: 'legendary',
        label: 'Best perf. average healing, Naxxramas',
        note: 'Restoration Shaman, Classic (2019)',
      },
    ],
  },
  {
    title: 'Off the clock',
    icon: 'i-compass',
    span: 2,
    plain: true,
    text: "I'm a big foodie. I host hot pot nights and work through LA one restaurant at a time, and then the board games come out (Kingdom Death: Monster, Captain Sonar, Mafia, and Catan). I speak English and Spanish, and I've been to ten countries so far.",
  },
  {
    title: 'Doktor',
    icon: 'i-paw',
    text: 'My elderly American Akita, my son, and my pride and joy. He is by my side for every meal and every work session.',
    photo: {
      src: akita,
      alt: 'Doktor, my American Akita, brindle and white, standing on a brick path and looking into the camera',
    },
  },
  {
    title: 'Beyond the screen',
    icon: 'i-ball',
    span: 2,
    text: "Brazilian jiu-jitsu every day, and black belts in Taekwondo and Hapkido. I played basketball and volleyball through high school and college, and I'm always up for a game of chess or Go.",
  },
];
