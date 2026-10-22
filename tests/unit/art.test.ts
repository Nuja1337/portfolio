import { describe, expect, it } from 'vitest';
import { ART_H, ART_W, TALL, artworks, gaussian, inkWash, nightSky, starfield } from '../../src/scripts/lib/art';
import { seededRandom } from '../../src/scripts/lib/geometry';

describe('seededRandom', () => {
  it('draws the same sequence for the same seed', () => {
    const a = seededRandom(11);
    const b = seededRandom(11);
    expect(Array.from({ length: 5 }, a)).toEqual(Array.from({ length: 5 }, b));
  });

  it('stays inside (0, 1), even for a zero or negative seed', () => {
    for (const seed of [0, -5, 7, 2147483647]) {
      const rnd = seededRandom(seed);
      for (let i = 0; i < 1000; i++) {
        const v = rnd();
        expect(v).toBeGreaterThan(0);
        expect(v).toBeLessThan(1);
      }
    }
  });
});

describe('starfield', () => {
  const stars = starfield(3);

  it('keeps every star on the canvas', () => {
    for (const s of stars) {
      expect(s.x).toBeGreaterThanOrEqual(0);
      expect(s.x).toBeLessThanOrEqual(ART_W);
      expect(s.y).toBeGreaterThanOrEqual(0);
      expect(s.y).toBeLessThanOrEqual(ART_H);
    }
  });

  it('fills the portrait cut too', () => {
    for (const s of starfield(3, TALL)) {
      expect(s.x).toBeLessThanOrEqual(TALL.w);
      expect(s.y).toBeLessThanOrEqual(TALL.h);
    }
  });

  it('is dense but bounded, so the SVG stays small', () => {
    expect(stars.length).toBeGreaterThan(900);
    expect(stars.length).toBeLessThan(1500);
  });
});

describe('gaussian', () => {
  it('centers on zero with unit spread', () => {
    const rnd = seededRandom(5);
    const xs = Array.from({ length: 4000 }, () => gaussian(rnd));
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
    const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length);
    expect(Math.abs(mean)).toBeLessThan(0.08);
    expect(sd).toBeGreaterThan(0.9);
    expect(sd).toBeLessThan(1.1);
  });
});

describe('bamboo', () => {
  it('paints the light hero in bamboo greens, with no hills', () => {
    const svg = inkWash();
    expect(svg).toContain('#6F9150');
    expect(svg).toContain('#3F6B2F');
    expect(svg).not.toContain('wash-far');
  });
});

describe('dark art', () => {
  it('has no clouds, and a touch of crimson', () => {
    const svg = nightSky();
    expect(svg).not.toContain('tone');
    expect(svg).toContain('#8E0F15');
  });
});

describe('artworks', () => {
  it('draws the same art for the same seed and different art for another', () => {
    expect(nightSky(1)).toBe(nightSky(1));
    expect(nightSky(1)).not.toBe(nightSky(2));
    expect(inkWash(1)).toBe(inkWash(1));
  });

  it('emits standalone SVG documents under 100 KB', () => {
    for (const draw of Object.values(artworks)) {
      const svg = draw();
      expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')).toBe(true);
      expect(svg.endsWith('</svg>')).toBe(true);
      expect(svg).not.toMatch(/NaN|undefined/);
      expect(svg.length).toBeLessThan(100_000);
    }
  });
});
