/** Board filtering, kept pure so it is unit-tested without a DOM. */

export function matchesFilter(tags: readonly string[], filter: string): boolean {
  return filter === 'all' || tags.includes(filter);
}

/** Splits a space-separated data-tags attribute. */
export function parseTags(attr: string | null | undefined): string[] {
  return (attr ?? '').split(/\s+/).filter(Boolean);
}

export function countLabel(shown: number, total: number): string {
  return shown === total ? `${total} cards` : `${shown} of ${total} cards`;
}
