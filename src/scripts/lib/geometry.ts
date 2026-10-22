/** Seeded randomness for the build-time art. No DOM, so it is unit-tested directly. */

/** Park-Miller minimal standard generator: the same seed always draws the same art. Returns values in (0, 1). */
export function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}
