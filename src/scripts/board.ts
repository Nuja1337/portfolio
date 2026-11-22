/**
 * Board filter bar: shows the cards that carry every picked tag, hides decks left empty, keeps the counts honest.
 * Tags in one group replace each other; tags from different groups combine.
 */
import { countLabel, matchesSelection, parseTags, toggleFilter, type Selection } from './lib/filter';

let showOnly: ((filter: string) => boolean) | null = null;

/** Filters the board to one tag (or "all") if the board is on this page. */
export function filterBoard(filter: string): boolean {
  return showOnly ? showOnly(filter) : false;
}

export function initBoard(root: HTMLElement): void {
  const cards = [...root.querySelectorAll<HTMLElement>('[data-card]')].map((el) => ({
    el,
    tags: parseTags(el.dataset.tags),
  }));
  const groups = [...root.querySelectorAll<HTMLElement>('[data-deck]')];
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const status = root.querySelector<HTMLElement>('[data-filter-count]');
  const empty = root.querySelector<HTMLElement>('[data-empty]');
  const scroller = root.querySelector<HTMLElement>('[data-board-scroll]');
  const groupOf = new Map(buttons.map((b) => [b.dataset.filter ?? '', b.dataset.group ?? '']));
  let selection: Selection = new Map();

  const render = () => {
    let shown = 0;
    for (const { el, tags } of cards) {
      const ok = matchesSelection(tags, selection);
      el.hidden = !ok;
      if (ok) shown++;
    }
    for (const group of groups) {
      const visible = group.querySelectorAll('[data-card]:not([hidden])').length;
      group.hidden = visible === 0;
      const count = group.querySelector<HTMLElement>('[data-group-count]');
      if (count) count.textContent = `${visible}`;
    }
    for (const b of buttons) {
      const id = b.dataset.filter ?? '';
      const pressed = id === 'all' ? selection.size === 0 : selection.get(groupOf.get(id) ?? '') === id;
      b.setAttribute('aria-pressed', String(pressed));
    }
    if (status) status.textContent = countLabel(shown, cards.length);
    if (empty) empty.hidden = shown > 0;
    scroller?.scrollTo({ top: 0 });
  };

  const press = (id: string, from: Selection) => {
    selection = toggleFilter(from, groupOf.get(id) ?? '', id);
    render();
  };

  showOnly = (filter) => {
    if (!groupOf.has(filter)) return false;
    press(filter, new Map());
    return true;
  };

  for (const b of buttons) b.addEventListener('click', () => press(b.dataset.filter ?? 'all', selection));
  render();
}
