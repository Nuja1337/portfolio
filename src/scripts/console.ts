/** The Chuken console: the tilde key or the action bar's console slot opens it. DOM wiring only; the commands live in lib/commands.ts. */
import { createCommands, runCommand, type ConsoleContext, type ConsoleData } from './lib/commands';
import { isTyping } from './actionbar';
import { filterBoard } from './board';
import { setSkin } from './skin';
import { opensNewTab } from '../data/site';

export function initConsole(data: ConsoleData): void {
  const panel = document.getElementById('console');
  const out = document.getElementById('con-out');
  const input = document.getElementById('con-in') as HTMLInputElement | null;
  if (!panel || !out || !input) return;

  const commands = createCommands(data);
  const history: string[] = [];
  let cursor = 0;
  let opener: HTMLElement | null = null;

  const scroll = () => (out.scrollTop = out.scrollHeight);
  const ctx: ConsoleContext = {
    print(text, dim) {
      const line = document.createElement('div');
      if (dim) line.className = 'con-dim';
      line.textContent = text;
      out.append(line);
      scroll();
    },
    link(label, href, after) {
      const line = document.createElement('div');
      const a = document.createElement('a');
      a.href = href;
      if (opensNewTab(href)) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      a.textContent = label;
      line.append(a);
      if (after) line.append(after);
      out.append(line);
      scroll();
    },
    clear: () => (out.textContent = ''),
    close,
    setSkin,
    filterBoard,
    goto(id) {
      const el = document.getElementById(id);
      if (!el) return false;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return true;
    },
    navigate: (href) => window.setTimeout(() => (window.location.href = href), 350),
    random: Math.random,
  };

  const triggers = [...document.querySelectorAll<HTMLElement>('[data-console-open]')];
  const setExpanded = (expanded: boolean) => triggers.forEach((t) => t.setAttribute('aria-expanded', String(expanded)));

  function open() {
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panel!.hidden = false;
    setExpanded(true);
    if (!out!.childNodes.length)
      ctx.print(`Chuken console v${document.documentElement.dataset.version ?? ''}. Type help.`, true);
    input!.focus();
  }

  function close() {
    panel!.hidden = true;
    setExpanded(false);
    opener?.focus();
  }

  document.addEventListener('keydown', (e) => {
    // The tilde key: ` unshifted, ~ shifted.
    if ((e.key === '`' || e.key === '~') && !(isTyping(e.target) && e.target !== input)) {
      e.preventDefault();
      if (panel.hidden) open();
      else close();
    } else if (e.key === 'Escape' && !panel.hidden) {
      e.preventDefault();
      close();
    }
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const value = input.value.trim();
      input.value = '';
      if (!value) return;
      history.push(value);
      cursor = history.length;
      const line = document.createElement('div');
      line.className = 'con-in';
      line.textContent = `> ${value}`;
      out.append(line);
      runCommand(value, ctx, commands);
      scroll();
    } else if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      cursor = Math.max(0, cursor - 1);
      input.value = history[cursor] ?? '';
    } else if (e.key === 'ArrowDown' && history.length) {
      e.preventDefault();
      cursor = Math.min(history.length, cursor + 1);
      input.value = history[cursor] ?? '';
    }
  });

  document.getElementById('con-close')?.addEventListener('click', close);
  for (const trigger of triggers) {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      open();
    });
  }
}
