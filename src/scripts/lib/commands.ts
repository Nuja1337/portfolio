/**
 * The dev console's command set. Pure: every side effect goes through ConsoleContext,
 * so the whole command table is unit-tested with a fake context.
 */

export type Skin = 'dark' | 'light';

/** Dark and light; the earlier names (yin/yang, heroic/grimdark) still work. */
const SKIN_ALIASES: Record<string, Skin> = {
  yin: 'dark',
  yang: 'light',
  dark: 'dark',
  light: 'light',
  heroic: 'dark',
  grimdark: 'light',
};

export interface ConsoleContext {
  print(text: string, dim?: boolean): void;
  link(label: string, href: string, after?: string): void;
  clear(): void;
  close(): void;
  setSkin(skin: Skin): void;
  /** Filters the board; false when the board isn't on this page. */
  filterBoard(filter: string): boolean;
  /** Scrolls to a section; false when it isn't on this page. */
  goto(id: string): boolean;
  navigate(href: string): void;
  random(): number;
}

export interface ConsoleData {
  name: string;
  email: string;
  resumes: readonly { label: string; href: string }[];
  blog: string;
  links: { github: string; linkedin: string };
  sections: readonly { id: string; label: string; href?: string }[];
  filters: readonly string[];
}

export interface Command {
  usage: string;
  summary: string;
  run(ctx: ConsoleContext, arg: string): void;
}

export interface ParsedCommand {
  name: string;
  arg: string;
}

/** "Skin  Grimdark " -> { name: "skin", arg: "grimdark" }. A leading "/" is allowed, WoW-style. */
export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim().replace(/^\//, '');
  if (!trimmed) return null;
  const [name = '', ...rest] = trimmed.split(/\s+/);
  return { name: name.toLowerCase(), arg: rest.join(' ').toLowerCase() };
}

export function createCommands(data: ConsoleData): Record<string, Command> {
  const sectionIds = data.sections.map((s) => s.id);

  const commands: Record<string, Command> = {
    help: {
      usage: 'help',
      summary: 'list commands',
      run(ctx) {
        for (const [name, cmd] of Object.entries(commands))
          ctx.print(`${cmd.usage.padEnd(22)} ${cmd.summary}`, name !== 'help');
      },
    },
    whoami: {
      usage: 'whoami',
      summary: 'who built this',
      run(ctx) {
        ctx.print(
          `${data.name}. Gameplay and full-stack engineer. Independent game developer, Chuken Studios. Los Angeles.`,
        );
      },
    },
    hand: {
      usage: 'hand',
      summary: 'what I am working on',
      run(ctx) {
        ctx.print("$run   Runefall: playable online; the dungeon's first boss is next");
        ctx.print('$wow   Guild Golem: guild management for WoW Forever, in live beta');
        ctx.print('$job   Open to game design, gameplay, and software engineering roles');
      },
    },
    deck: {
      usage: 'deck',
      summary: 'every section, as links',
      run(ctx) {
        for (const s of data.sections) ctx.link(s.id, s.href ?? `/#${s.id}`, `  ${s.label}`);
      },
    },
    goto: {
      usage: 'goto <section>',
      summary: 'jump to a section',
      run(ctx, arg) {
        if (!arg || !sectionIds.includes(arg)) {
          ctx.print(`Sections: ${sectionIds.join(', ')}`, true);
          return;
        }
        const page = data.sections.find((s) => s.id === arg)?.href;
        if (page) {
          ctx.navigate(page);
          return;
        }
        if (ctx.goto(arg)) ctx.print(`Jumping to ${arg}.`, true);
        else ctx.navigate(`/#${arg}`);
      },
    },
    skin: {
      usage: 'skin <dark|light>',
      summary: 'change the look',
      run(ctx, arg) {
        const skin = SKIN_ALIASES[arg];
        if (!skin) {
          ctx.print('Modes: dark, light', true);
          return;
        }
        ctx.setSkin(skin);
        ctx.print(`Switched to ${skin} mode.`, true);
      },
    },
    filter: {
      usage: 'filter <tag>',
      summary: 'filter the projects',
      run(ctx, arg) {
        if (!arg || !data.filters.includes(arg)) {
          ctx.print(`Tags: ${data.filters.join(', ')}`, true);
          return;
        }
        if (ctx.filterBoard(arg)) {
          ctx.goto('projects');
          ctx.print(`Filtered the projects to: ${arg}`, true);
        } else ctx.navigate('/#projects');
      },
    },
    forge: {
      usage: 'forge',
      summary: 'open the Rune Forge',
      run(ctx) {
        ctx.print('The Rune Forge is sealed. It opens when it is ready. Coming soon.', true);
        if (!ctx.goto('forge')) ctx.navigate('/breakdowns/runefall#forge');
      },
    },
    blog: {
      usage: 'blog',
      summary: 'read the blog',
      run(ctx) {
        ctx.print('Opening the blog. It is under construction.', true);
        ctx.navigate(data.blog);
      },
    },
    resume: {
      usage: 'resume',
      summary: 'download a résumé',
      run(ctx) {
        for (const r of data.resumes) ctx.link(`${r.label} (PDF)`, r.href);
      },
    },
    contact: {
      usage: 'contact',
      summary: 'ways to reach me',
      run(ctx) {
        ctx.link(data.email, `mailto:${data.email}`);
        ctx.link(data.links.linkedin.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, ''), data.links.linkedin);
        ctx.link(data.links.github.replace(/^https:\/\//, ''), data.links.github);
      },
    },
    hire: {
      usage: 'hire',
      summary: 'good call',
      run(ctx) {
        ctx.print('Good call. Opening your mail client.', true);
        ctx.navigate(`mailto:${data.email}?subject=${encodeURIComponent("Let's talk")}`);
      },
    },
    roll: {
      usage: 'roll [max]',
      summary: 'roll for loot',
      run(ctx, arg) {
        const parsed = Number.parseInt(arg, 10);
        const max = Number.isFinite(parsed) && parsed >= 1 ? Math.min(parsed, 1_000_000) : 100;
        const value = 1 + Math.floor(ctx.random() * max);
        ctx.print(`${data.name.split(' ')[0]} rolls ${value} (1-${max})`);
      },
    },
    clear: {
      usage: 'clear',
      summary: 'clear the log',
      run(ctx) {
        ctx.clear();
      },
    },
    exit: {
      usage: 'exit',
      summary: 'close the console',
      run(ctx) {
        ctx.close();
      },
    },
  };
  return commands;
}

/** Runs one line of input. Returns false for an unknown command. */
export function runCommand(input: string, ctx: ConsoleContext, commands: Record<string, Command>): boolean {
  const parsed = parseCommand(input);
  if (!parsed) return true;
  const cmd = commands[parsed.name];
  if (!cmd) {
    ctx.print(`Unknown command: ${parsed.name}. Try help.`, true);
    return false;
  }
  cmd.run(ctx, parsed.arg);
  return true;
}
