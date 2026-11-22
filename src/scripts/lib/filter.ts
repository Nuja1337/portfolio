/** Board filtering, kept pure so it is unit-tested without a DOM. */

/** The tag picked in each filter group, keyed by group. A card shows when it carries every picked tag. */
export type Selection = ReadonlyMap<string, string>;

export function matchesSelection(tags: readonly string[], selection: Selection): boolean {
  for (const tag of selection.values()) if (!tags.includes(tag)) return false;
  return true;
}

/**
 * Pressing a tag picks it in its group, replacing the tag picked there before. Pressing a picked tag drops it, and
 * "all" drops every tag.
 */
export function toggleFilter(selection: Selection, group: string, tag: string): Map<string, string> {
  if (tag === 'all') return new Map();
  const next = new Map(selection);
  if (next.get(group) === tag) next.delete(group);
  else next.set(group, tag);
  return next;
}

/** Splits a space-separated data-tags attribute. */
export function parseTags(attr: string | null | undefined): string[] {
  return (attr ?? '').split(/\s+/).filter(Boolean);
}

export function countLabel(shown: number, total: number): string {
  return shown === total ? `${total} cards` : `${shown} of ${total} cards`;
}
