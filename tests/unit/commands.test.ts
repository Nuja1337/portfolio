import { describe, expect, it, vi } from 'vitest';
import {
  createCommands,
  parseCommand,
  runCommand,
  type ConsoleContext,
  type ConsoleData,
} from '../../src/scripts/lib/commands';

const data: ConsoleData = {
  name: 'Alexander Shaham',
  email: 'ajshaham@gmail.com',
  resumes: [
    { label: 'Game dev résumé', href: '/AlexanderShahamResume-GameDev.pdf' },
    { label: 'Software résumé', href: '/AlexanderShahamResume-Software.pdf' },
  ],
  blog: '/blog',
  links: { github: 'https://github.com/Nuja1337', linkedin: 'https://www.linkedin.com/in/alexander-shaham/' },
  sections: [
    { id: 'top', label: 'Top' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' },
    { id: 'blog', label: 'Blog', href: '/blog' },
  ],
  filters: ['all', 'game', 'web'],
};

function fakeContext(overrides: Partial<ConsoleContext> = {}) {
  const lines: string[] = [];
  const ctx: ConsoleContext = {
    print: vi.fn((text: string) => void lines.push(text)),
    link: vi.fn((label: string, href: string) => void lines.push(`${label} -> ${href}`)),
    clear: vi.fn(),
    close: vi.fn(),
    setSkin: vi.fn(),
    filterBoard: vi.fn(() => true),
    goto: vi.fn(() => true),
    navigate: vi.fn(),
    random: () => 0.5,
    ...overrides,
  };
  return { ctx, lines };
}

const commands = createCommands(data);
const run = (input: string, ctx: ConsoleContext) => runCommand(input, ctx, commands);

describe('parseCommand', () => {
  it('lowercases and splits the name from its argument', () => {
    expect(parseCommand('  Skin   Light ')).toEqual({ name: 'skin', arg: 'light' });
    expect(parseCommand('/roll 20')).toEqual({ name: 'roll', arg: '20' });
    expect(parseCommand('   ')).toBeNull();
  });
});

describe('console commands', () => {
  it('help lists every command', () => {
    const { ctx, lines } = fakeContext();
    run('help', ctx);
    for (const name of Object.keys(commands)) expect(lines.some((l) => l.startsWith(name))).toBe(true);
  });

  it('rejects unknown commands', () => {
    const { ctx, lines } = fakeContext();
    expect(run('dance', ctx)).toBe(false);
    expect(lines[0]).toMatch(/Unknown command: dance/);
  });

  it('only accepts the two skins', () => {
    const { ctx } = fakeContext();
    run('skin neon', ctx);
    expect(ctx.setSkin).not.toHaveBeenCalled();
    run('skin yang', ctx);
    expect(ctx.setSkin).toHaveBeenCalledWith('light');
    run('skin yin', ctx);
    expect(ctx.setSkin).toHaveBeenCalledWith('dark');
    run('skin light', ctx);
    expect(ctx.setSkin).toHaveBeenCalledWith('light');
    run('skin heroic', ctx);
    expect(ctx.setSkin).toHaveBeenCalledWith('dark');
  });

  it('filters the projects, or goes home when they are elsewhere', () => {
    const home = fakeContext();
    run('filter game', home.ctx);
    expect(home.ctx.filterBoard).toHaveBeenCalledWith('game');
    expect(home.ctx.goto).toHaveBeenCalledWith('projects');

    const blog = fakeContext({ filterBoard: vi.fn(() => false) });
    run('filter web', blog.ctx);
    expect(blog.ctx.navigate).toHaveBeenCalledWith('/#projects');

    const bad = fakeContext();
    run('filter nope', bad.ctx);
    expect(bad.ctx.filterBoard).not.toHaveBeenCalled();
  });

  it('goto opens a section that is a page of its own', () => {
    const { ctx } = fakeContext();
    run('goto blog', ctx);
    expect(ctx.navigate).toHaveBeenCalledWith('/blog');
    expect(ctx.goto).not.toHaveBeenCalled();
  });

  it('goto validates the section', () => {
    const { ctx } = fakeContext();
    run('goto nowhere', ctx);
    expect(ctx.goto).not.toHaveBeenCalled();
    run('goto contact', ctx);
    expect(ctx.goto).toHaveBeenCalledWith('contact');
  });

  it('keeps the forge sealed', () => {
    const { ctx, lines } = fakeContext();
    run('forge', ctx);
    expect(lines.join(' ')).toMatch(/sealed/i);
    expect(ctx.goto).toHaveBeenCalledWith('forge');

    const home = fakeContext({ goto: vi.fn(() => false) });
    run('forge', home.ctx);
    expect(home.ctx.navigate).toHaveBeenCalledWith('/breakdowns/runefall#forge');
  });

  it('rolls within range, WoW-style', () => {
    const { ctx, lines } = fakeContext({ random: () => 0.999 });
    run('/roll', ctx);
    expect(lines[0]).toBe('Alexander rolls 100 (1-100)');
    run('roll 6', ctx);
    expect(lines[1]).toBe('Alexander rolls 6 (1-6)');
    run('roll -3', ctx);
    expect(lines[2]).toBe('Alexander rolls 100 (1-100)');
  });

  it('hire opens mail with a subject', () => {
    const { ctx } = fakeContext();
    run('hire', ctx);
    expect(ctx.navigate).toHaveBeenCalledWith(expect.stringMatching(/^mailto:ajshaham@gmail\.com\?subject=/));
  });
});
