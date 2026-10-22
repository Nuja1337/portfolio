import { describe, expect, it } from 'vitest';
import { countLabel, matchesFilter, parseTags } from '../../src/scripts/lib/filter';

describe('board filter', () => {
  it('shows everything for "all"', () => {
    expect(matchesFilter([], 'all')).toBe(true);
    expect(matchesFilter(['game'], 'all')).toBe(true);
  });

  it('matches whole tags only', () => {
    expect(matchesFilter(['game', 'team'], 'game')).toBe(true);
    expect(matchesFilter(['games'], 'game')).toBe(false);
    expect(matchesFilter(['tool'], 'web')).toBe(false);
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
