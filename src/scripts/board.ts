/** Board filter bar: shows matching cards, hides decks left empty, keeps the counts honest. */
import { countLabel, matchesFilter, parseTags } from './lib/filter';

let applyFilter: ((filter: string) => boolean) | null = null;

/** Filters the board if it is on this page. */
export function filterBoard(filter: string): boolean {
  return applyFilter ? applyFilter(filter) : false;
}

export function initBoard(root: HTMLElement): void {
  const cards = [...root.querySelectorAll<HTMLElement>('[data-card]')];
  const groups = [...root.querySelectorAll<HTMLElement>('[data-deck]')];
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const status = root.querySelector<HTMLElement>('[data-filter-count]');
  const empty = root.querySelector<HTMLElement>('[data-empty]');
  const scroller = root.querySelector<HTMLElement>('[data-board-scroll]');
  const known = new Set(buttons.map((b) => b.dataset.filter));

  applyFilter = (filter) => {
    if (!known.has(filter)) return false;
    let shown = 0;
    for (const card of cards) {
      const ok = matchesFilter(parseTags(card.dataset.tags), filter);
      card.hidden = !ok;
      if (ok) shown++;
    }
    for (const group of groups) {
      const visible = group.querySelectorAll('[data-card]:not([hidden])').length;
      group.hidden = visible === 0;
      const count = group.querySelector<HTMLElement>('[data-group-count]');
      if (count) count.textContent = `${visible}`;
    }
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.filter === filter));
    if (status) status.textContent = countLabel(shown, cards.length);
    if (empty) empty.hidden = shown > 0;
    scroller?.scrollTo({ top: 0 });
    return true;
  };

  for (const b of buttons) b.addEventListener('click', () => applyFilter?.(b.dataset.filter ?? 'all'));
  applyFilter('all');
}
