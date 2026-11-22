import { describe, expect, it } from 'vitest';
import { countLabel, matchesSelection, parseTags, toggleFilter } from '../../src/scripts/lib/filter';

describe('board filter', () => {
  it('shows everything when nothing is picked', () => {
    expect(matchesSelection([], new Map())).toBe(true);
    expect(matchesSelection(['game'], new Map())).toBe(true);
  });

  it('matches whole tags only', () => {
    expect(matchesSelection(['game', 'team'], new Map([['kind', 'game']]))).toBe(true);
    expect(matchesSelection(['games'], new Map([['kind', 'game']]))).toBe(false);
    expect(matchesSelection(['tool'], new Map([['kind', 'web']]))).toBe(false);
  });

  it('needs every picked tag', () => {
    const teamGames = new Map([
      ['kind', 'game'],
      ['size', 'team'],
    ]);
    expect(matchesSelection(['game', 'team'], teamGames)).toBe(true);
    expect(matchesSelection(['game', 'solo'], teamGames)).toBe(false);
    expect(matchesSelection(['web', 'team'], teamGames)).toBe(false);
  });

  it('replaces a tag in the same group, keeps other groups, and drops a tag pressed twice', () => {
    let s = toggleFilter(new Map(), 'kind', 'game');
    s = toggleFilter(s, 'size', 'team');
    expect([...s]).toEqual([
      ['kind', 'game'],
      ['size', 'team'],
    ]);
    s = toggleFilter(s, 'kind', 'web');
    expect(s.get('kind')).toBe('web');
    expect(s.get('size')).toBe('team');
    s = toggleFilter(s, 'size', 'team');
    expect(s.has('size')).toBe(false);
  });

  it('clears everything for "all", without changing what it was given', () => {
    const before = new Map([['kind', 'game']]);
    expect(toggleFilter(before, 'all', 'all').size).toBe(0);
    toggleFilter(before, 'kind', 'web');
    expect(before.get('kind')).toBe('game');
  });

  it('parses a data-tags attribute', () => {
    expect(parseTags(' web  tool solo ')).toEqual(['web', 'tool', 'solo']);
    expect(parseTags(undefined)).toEqual([]);
    expect(parseTags('')).toEqual([]);
  });

  it('labels the count', () => {
    expect(countLabel(17, 17)).toBe('17 cards');
    expect(countLabel(7, 17)).toBe('7 of 17 cards');
  });
});
