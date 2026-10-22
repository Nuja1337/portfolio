/**
 * The hero art, drawn in code at build time and served as static SVG files, so the browser
 * rasterizes each piece once and never runs a loop for it.
 *   night / moon:  a dense starfield under a crimson glow, and an inked full moon with a red corona (dark mode)
 *   ink / enso:    rice paper framed by sumi-e bamboo, and a brush ensō with a bamboo-green dot (light mode)
 * The backdrops fill the hero; the moon and the ensō sit in the layout above the headline,
 * so they stay put at every screen size. Everything is seeded: every build draws the same art.
 */
import { seededRandom } from './geometry';

export const ART_W = 1600;
export const ART_H = 900;
/** Landscape art for wide screens; a portrait cut for phones, so nothing gets scaled up and blurry. */
export interface Size {
  w: number;
  h: number;
}
export const WIDE: Size = { w: ART_W, h: ART_H };
export const TALL: Size = { w: 800, h: 1800 };
/** The moon and the ensō are drawn on a square this size, centered. */
export const EMBLEM = 260;

/** Dark mode's red: a deep crimson for glows and a brighter one for small marks. */
const CRIMSON = '#8E0F15';
const CRIMSON_BRIGHT = '#D8262E';
/** Light mode's bamboo: stalk, leaf, and node greens, from pale to dark. */
const BAMBOO = { pale: '#A9BE8C', stalk: '#6F9150', leaf: '#3F6B2F', node: '#2A4A20' };

type Rng = () => number;

const n = (v: number) => String(Math.round(v * 10) / 10);

function svg(body: string, defs = '', w = ART_W, h = ART_H, fit = 'xMidYMin slice'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="${fit}">${defs ? `<defs>${defs}</defs>` : ''}${body}</svg>`;
}

/** Standard normal sample (Box-Muller). */
export function gaussian(rnd: Rng): number {
  const u = rnd() || 1e-9;
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rnd());
}

/** An irregular ink speck: a closed polygon with jittered radius. */
function speck(rnd: Rng, cx: number, cy: number, r: number, points = 6): string {
  let d = '';
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2 + rnd() * 0.5;
    const rr = r * (0.6 + rnd() * 0.6);
    d += `${i ? 'L' : 'M'}${n(cx + Math.cos(a) * rr)} ${n(cy + Math.sin(a) * rr)}`;
  }
  return `${d}Z`;
}

/** Groups items into a few opacity buckets so the file stays small. */
function buckets(items: { o: number; el: string }[], attrs: string): string {
  const groups = new Map<string, string[]>();
  for (const { o, el } of items) {
    const key = (Math.round(o * 5) / 5).toFixed(1);
    groups.set(key, [...(groups.get(key) ?? []), el]);
  }
  return [...groups]
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([o, els]) => `<g ${attrs} opacity="${o}">${els.join('')}</g>`)
    .join('');
}

const dot = (x: number, y: number, r: number) => `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}"/>`;

export interface Star {
  x: number;
  y: number;
  r: number;
  o: number;
}

/** A uniform scatter plus a denser diagonal band, like a ribbon of the Milky Way. */
export function starfield(seed: number, { w, h }: Size = WIDE, count = 520, band = 950): Star[] {
  const rnd = seededRandom(seed);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({ x: rnd() * w, y: rnd() * h, r: 0.5 + rnd() ** 2.5 * 1.5, o: 0.4 + rnd() * 0.6 });
  }
  const [ax, ay, bx, by] = [0.83 * w, -0.045 * h, 0.54 * w, 1.045 * h];
  const len = Math.hypot(bx - ax, by - ay);
  const [nx, ny] = [-(by - ay) / len, (bx - ax) / len];
  for (let i = 0; i < band; i++) {
    const t = rnd();
    const off = gaussian(rnd) * 110;
    const x = ax + (bx - ax) * t + nx * off;
    const y = ay + (by - ay) * t + ny * off;
    if (x < 0 || x > w || y < 0 || y > h) continue;
    stars.push({ x, y, r: 0.4 + rnd() ** 2 * 0.9, o: 0.3 + rnd() * 0.5 });
  }
  return stars;
}

export function nightSky(seed = 1337, size: Size = WIDE): string {
  const { w, h } = size;
  const rnd = seededRandom(seed);
  const defs =
    `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000000"/><stop offset=".65" stop-color="#040405"/><stop offset="1" stop-color="#0B0B0E"/></linearGradient>` +
    // A low crimson glow along the bottom edge, like the sky before an eclipse.
    `<radialGradient id="ember" cx="${w * 0.5}" cy="${h * 1.08}" r="${Math.max(w, h) * 0.6}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${CRIMSON}" stop-opacity=".42"/><stop offset=".45" stop-color="${CRIMSON}" stop-opacity=".12"/><stop offset="1" stop-color="${CRIMSON}" stop-opacity="0"/></radialGradient>`;

  const small = buckets(
    starfield(seed + 1, size).map((s) => ({ o: s.o, el: dot(s.x, s.y, s.r) })),
    'fill="#F4F4F4"',
  );
  const bright: { o: number; el: string }[] = [];
  for (let i = 0; i < 170; i++) {
    const x = rnd() * w;
    const y = rnd() * h * 0.85;
    const r = 1.1 + rnd() ** 2 * 2;
    bright.push({ o: 0.8 + rnd() * 0.2, el: i % 2 ? `<path d="${speck(rnd, x, y, r + 0.4)}"/>` : dot(x, y, r) });
  }
  // A few big irregular flecks, like white ink flicked across a black page, and a few of red.
  let flecks = '';
  for (let i = 0; i < 14; i++) flecks += `<path d="${speck(rnd, rnd() * w, rnd() * h * 0.8, 2.4 + rnd() * 1.4, 7)}"/>`;
  let blood = '';
  for (let i = 0; i < 9; i++)
    blood += `<path d="${speck(rnd, rnd() * w, h * 0.35 + rnd() * h * 0.6, 1.2 + rnd() * 1.6, 7)}"/>`;

  const body =
    `<rect width="${w}" height="${h}" fill="url(#sky)"/>` +
    `<rect width="${w}" height="${h}" fill="url(#ember)"/>` +
    small +
    buckets(bright, 'fill="#FFFFFF"') +
    `<g fill="#FFFFFF" opacity=".9">${flecks}</g>` +
    `<g fill="${CRIMSON_BRIGHT}" opacity=".75">${blood}</g>`;
  return svg(body, defs, w, h);
}

/** A second, sparse layer of brighter stars that the page fades in and out, so the sky twinkles for free. */
export function nightTwinkle(seed = 99, { w, h }: Size = WIDE): string {
  const rnd = seededRandom(seed);
  const items: string[] = [];
  for (let i = 0; i < 46; i++) items.push(dot(rnd() * w, rnd() * h * 0.8, 1 + rnd() * 0.9));
  return svg(`<g fill="#FFFFFF">${items.join('')}</g>`, '', w, h);
}

/** The moon: a white disc with a few maria, a fuzzy edge of short radial hatch strokes, and a blood-red corona. */
export function moon(seed = 7): string {
  const rnd = seededRandom(seed);
  const c = EMBLEM / 2;
  const r = 42;
  const defs =
    `<radialGradient id="glow"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".34"/><stop offset=".45" stop-color="#D6D6DA" stop-opacity=".1"/><stop offset="1" stop-color="#D6D6DA" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="corona"><stop offset=".3" stop-color="${CRIMSON}" stop-opacity="0"/><stop offset=".36" stop-color="${CRIMSON_BRIGHT}" stop-opacity=".55"/><stop offset=".55" stop-color="${CRIMSON}" stop-opacity=".16"/><stop offset=".85" stop-color="${CRIMSON}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="disc" cx="${c - r * 0.3}" cy="${c - r * 0.35}" r="${r * 1.35}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".65" stop-color="#E6E6E6"/><stop offset="1" stop-color="#B4B4B6"/></radialGradient>`;
  const hatch: { o: number; el: string }[] = [];
  for (let i = 0; i < 360; i++) {
    const a = (i / 360) * Math.PI * 2 + rnd() * 0.02;
    const r0 = r - 1.5;
    const len = 3 + rnd() ** 2 * 20;
    const [cos, sin] = [Math.cos(a), Math.sin(a)];
    hatch.push({
      o: 0.35 + rnd() * 0.65,
      el: `<path d="M${n(c + cos * r0)} ${n(c + sin * r0)}L${n(c + cos * (r0 + len))} ${n(c + sin * (r0 + len))}"/>`,
    });
  }
  let maria = '';
  for (let i = 0; i < 9; i++) {
    const a = rnd() * Math.PI * 2;
    const d = Math.sqrt(rnd()) * r * 0.6;
    maria += `<path d="${speck(rnd, c + Math.cos(a) * d, c + Math.sin(a) * d, r * (0.08 + rnd() * 0.16), 7)}"/>`;
  }
  const body =
    `<circle cx="${c}" cy="${c}" r="${c}" fill="url(#glow)"/>` +
    `<circle cx="${c}" cy="${c}" r="${c}" fill="url(#corona)"/>` +
    buckets(hatch, 'stroke="#F2F2F2" stroke-width="1" stroke-linecap="round"') +
    `<circle cx="${c}" cy="${c}" r="${r}" fill="url(#disc)"/>` +
    `<g fill="#A2A2A5" opacity=".38">${maria}</g>`;
  return svg(body, defs, EMBLEM, EMBLEM, 'xMidYMid meet');
}

/** A brush ensō: a thick stroke that presses in, sweeps most of a circle, and runs dry at the tail. */
export function ensoStroke(rnd: Rng, cx: number, cy: number, radius: number, width: number): string {
  const steps = 180;
  const start = (200 * Math.PI) / 180;
  const sweep = (322 * Math.PI) / 180;
  const outer: string[] = [];
  const inner: string[] = [];
  let wobble = 0;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = start + sweep * t;
    wobble += gaussian(rnd) * 0.25;
    wobble *= 0.9;
    const w = width * (t < 0.08 ? 0.6 + (0.4 * t) / 0.08 : 1 - 0.8 * ((t - 0.08) / 0.92) ** 1.5);
    const r = radius * (1 + 0.025 * Math.sin(t * 5)) + wobble;
    const [c, s] = [Math.cos(a), Math.sin(a)];
    outer.push(`${n(cx + c * (r + w / 2))} ${n(cy + s * (r + w / 2))}`);
    inner.push(`${n(cx + c * (r - w / 2))} ${n(cy + s * (r - w / 2))}`);
  }
  let body = `<path d="M${outer.join('L')}L${inner.reverse().join('L')}Z"/>`;
  // Dry brush: broken hairlines where the ink runs out.
  for (let k = 0; k < 6; k++) {
    const off = (k / 5 - 0.5) * width * 0.5;
    const pts: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const a = start + sweep * (0.72 + (i / 40) * 0.32);
      pts.push(`${n(cx + Math.cos(a) * (radius + off))} ${n(cy + Math.sin(a) * (radius + off))}`);
    }
    const dash = Array.from({ length: 6 }, () => n(4 + rnd() * 26)).join(' ');
    body += `<path d="M${pts.join('L')}" fill="none" stroke-width="${n(0.8 + rnd())}" stroke-dasharray="${dash}"/>`;
  }
  const [hx, hy] = [cx + Math.cos(start) * radius, cy + Math.sin(start) * radius];
  return body + `<path d="${speck(rnd, hx, hy, width * 0.62, 9)}"/>`;
}

const INK = '#1B1712';
const PAPER = '#F4F1E9';
const rough = (id: string, scale: number) =>
  `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".045" numOctaves="2" seed="2"/><feDisplacementMap in="SourceGraphic" scale="${scale}"/></filter>`;

/** One bamboo leaf: a slender, slightly curved blade from its base toward its tip. */
function bambooLeaf(x: number, y: number, angle: number, len: number, bend: number): string {
  const [c, s] = [Math.cos(angle), Math.sin(angle)];
  const [px, py] = [-s, c];
  const width = len * 0.12;
  const [mx, my] = [x + c * len * 0.42 + px * bend, y + s * len * 0.42 + py * bend];
  const [tx, ty] = [x + c * len, y + s * len];
  return `<path d="M${n(x)} ${n(y)}Q${n(mx + px * width)} ${n(my + py * width)} ${n(tx)} ${n(ty)}Q${n(mx - px * width * 0.7)} ${n(my - py * width * 0.7)} ${n(x)} ${n(y)}Z"/>`;
}

/** A fan of leaves hanging from one point, reaching right (dir 1) or left (dir -1) and drooping as bamboo does. */
function leafCluster(rnd: Rng, x: number, y: number, dir: 1 | -1, count: number, size: number): string {
  let out = '';
  for (let i = 0; i < count; i++) {
    const spread = (i - (count - 1) / 2) * 0.34;
    const angle = (dir > 0 ? 0 : Math.PI) + dir * (0.45 + spread + gaussian(rnd) * 0.08);
    const len = size * (0.7 + rnd() * 0.5);
    out += bambooLeaf(x, y, angle, len, dir * len * 0.07 * (rnd() - 0.2));
  }
  return out;
}

interface StalkOptions {
  x: number;
  bottom: number;
  top: number;
  width: number;
  lean?: number;
  /** Which way its leaves reach: 1 right, -1 left. */
  dir: 1 | -1;
  leafSize: number;
  /** Chance that a node grows a twig with leaves. */
  leafy?: number;
}

/**
 * A bamboo stalk in sumi-e: segments painted as single strokes with a pale dry-brush center, dark node marks
 * between them, and twigs of drooping leaves from some nodes.
 */
function bambooStalk(rnd: Rng, o: StalkOptions): string {
  const { x, bottom, top, width, lean = 0, dir, leafSize, leafy = 0.45 } = o;
  let segments = '';
  let highlights = '';
  let nodes = '';
  let twigs = '';
  let leaves = '';
  let y = bottom;
  let i = 0;
  while (y > top) {
    const len = width * 3.2 + rnd() * width * 2.4 + 40;
    const y2 = y - len;
    const [x1, x2] = [x + lean * (bottom - y), x + lean * (bottom - y2)];
    const w = width * (1 - Math.min(0.25, i * 0.02));
    const wob = () => gaussian(rnd) * width * 0.03;
    segments += `<path d="M${n(x1 - w / 2 + wob())} ${n(y - 2)}L${n(x2 - w * 0.47 + wob())} ${n(y2 + 2)}L${n(x2 + w * 0.47 + wob())} ${n(y2 + 2)}L${n(x1 + w / 2 + wob())} ${n(y - 2)}Z"/>`;
    highlights += `<path d="M${n(x1 - w * 0.12)} ${n(y - len * 0.15)}L${n(x2 - w * 0.08)} ${n(y2 + len * 0.2)}L${n(x2 + w * 0.02)} ${n(y2 + len * 0.2)}L${n(x1 + w * 0.02)} ${n(y - len * 0.15)}Z"/>`;
    nodes += `<path d="M${n(x2 - w * 0.62)} ${n(y2 + 1)}Q${n(x2)} ${n(y2 - 3)} ${n(x2 + w * 0.62)} ${n(y2 + 1)}"/>`;
    if (y2 > top + 20 && y2 < bottom - 60 && rnd() < leafy) {
      const tl = 26 + rnd() * 40;
      const [tx, ty] = [x2 + dir * tl * 0.8, y2 - tl * 0.6];
      twigs += `<path d="M${n(x2 + (dir * w) / 2)} ${n(y2)}Q${n(x2 + dir * tl * 0.5)} ${n(y2 - tl * 0.1)} ${n(tx)} ${n(ty)}"/>`;
      leaves += leafCluster(rnd, tx, ty, dir, 3 + Math.floor(rnd() * 3), leafSize);
    }
    y = y2 - 3;
    i++;
  }
  return (
    `<g fill="${BAMBOO.stalk}" opacity=".92">${segments}</g>` +
    `<g fill="${BAMBOO.pale}" opacity=".45">${highlights}</g>` +
    `<g fill="none" stroke="${BAMBOO.node}" stroke-width="${n(Math.max(1.6, width * 0.14))}" stroke-linecap="round">${nodes}</g>` +
    `<g fill="none" stroke="${BAMBOO.node}" stroke-width="1.6" stroke-linecap="round">${twigs}</g>` +
    `<g fill="${BAMBOO.leaf}" opacity=".88">${leaves}</g>`
  );
}

const paperDefs =
  `<filter id="mottle" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".005" numOctaves="3" seed="4"/><feColorMatrix values="0 0 0 0 .35 0 0 0 0 .27 0 0 0 0 .16 0 0 0 .22 -.06"/></filter>` +
  `<filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 .3 0 0 0 0 .24 0 0 0 0 .16 0 0 0 .55 -.18"/></filter>`;

/** Rice paper framed by bamboo: two stalks and a faint third on each edge, leaves reaching in toward the text. */
export function inkWash(seed = 2024, size: Size = WIDE): string {
  const { w, h } = size;
  const rnd = seededRandom(seed);
  const k = w / ART_W;
  const leaf = 58 + 30 * k;
  const stalk = (x: number, width: number, dir: 1 | -1, lean: number) =>
    bambooStalk(rnd, { x, bottom: h + 10, top: -30, width, lean, dir, leafSize: leaf });
  let specks = '';
  for (let i = 0; i < 16; i++)
    specks += `<path d="${speck(rnd, rnd() * w, rnd() * h * 0.7, 0.7 + rnd() ** 3 * 2.6)}"/>`;
  const body =
    `<rect width="${w}" height="${h}" fill="${PAPER}"/>` +
    `<rect width="${w}" height="${h}" filter="url(#mottle)"/>` +
    `<g opacity=".3" filter="url(#soft)">${stalk(0.12 * w, 10 + 6 * k, 1, 0.01)}${stalk(0.88 * w, 10 + 6 * k, -1, -0.012)}</g>` +
    `<g filter="url(#rough)">` +
    stalk(0.035 * w, 16 + 12 * k, 1, 0.004) +
    stalk(0.085 * w, 10 + 6 * k, 1, -0.006) +
    stalk(0.965 * w, 15 + 11 * k, -1, -0.004) +
    stalk(0.918 * w, 9 + 6 * k, -1, 0.007) +
    `</g>` +
    `<g fill="${INK}" opacity=".6">${specks}</g>` +
    `<rect width="${w}" height="${h}" filter="url(#grain)"/>`;
  return svg(
    body,
    paperDefs + rough('rough', 2.5) + `<filter id="soft"><feGaussianBlur stdDeviation="1.6"/></filter>`,
    w,
    h,
  );
}

/** The ensō with a spatter of ink and one bamboo-green dot beside it. */
export function enso(seed = 2024): string {
  const rnd = seededRandom(seed);
  const c = EMBLEM / 2;
  let specks = '';
  for (let i = 0; i < 16; i++) {
    specks += `<path d="${speck(rnd, c + gaussian(rnd) * 60, c + gaussian(rnd) * 50, 0.7 + rnd() ** 3 * 2.8)}"/>`;
  }
  const body =
    `<g fill="${INK}" stroke="${INK}" opacity=".9" filter="url(#rough)">${ensoStroke(rnd, c, c, 78, 20)}</g>` +
    `<g fill="${INK}" opacity=".75">${specks}</g>` +
    `<circle cx="${c + 96}" cy="${c + 58}" r="7" fill="${BAMBOO.leaf}" filter="url(#rough)"/>`;
  return svg(body, rough('rough', 4), EMBLEM, EMBLEM, 'xMidYMid meet');
}

/** Page texture for dark mode: a sparse starfield tile, so the night carries on past the hero. */
export function starsTile(seed = 404, tile = 1200): string {
  const rnd = seededRandom(seed);
  const faint: { o: number; el: string }[] = [];
  for (let i = 0; i < 240; i++) {
    faint.push({ o: 0.15 + rnd() * 0.45, el: dot(rnd() * tile, rnd() * tile, 0.4 + rnd() ** 3 * 0.9) });
  }
  let bright = '';
  for (let i = 0; i < 9; i++) bright += `<path d="${speck(rnd, rnd() * tile, rnd() * tile, 1.1 + rnd() * 0.8)}"/>`;
  return svg(
    buckets(faint, 'fill="#EDEDED"') + `<g fill="#FFFFFF" opacity=".55">${bright}</g>`,
    '',
    tile,
    tile,
    'none',
  );
}

/** Page texture for light mode: seamless rice-paper grain and a faint mottle. */
export function paperTile(tile = 600): string {
  const defs =
    `<filter id="g" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="9" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .3 0 0 0 0 .24 0 0 0 0 .16 0 0 0 .5 -.17"/></filter>` +
    `<filter id="m" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".008" numOctaves="2" seed="4" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 .35 0 0 0 0 .27 0 0 0 0 .16 0 0 0 .16 -.05"/></filter>`;
  return svg(
    `<rect width="${tile}" height="${tile}" filter="url(#m)"/><rect width="${tile}" height="${tile}" filter="url(#g)"/>`,
    defs,
    tile,
    tile,
    'none',
  );
}

const RULE_W = 1200;
const RULE_H = 64;

/** Section divider, dark mode: a thin stroke of white ink and one drop of red. */
export function ruleNight(seed = 31): string {
  const rnd = seededRandom(seed);
  const y = RULE_H / 2;
  const defs =
    rough('rough', 2.5) +
    `<radialGradient id="h"><stop offset="0" stop-color="${CRIMSON_BRIGHT}" stop-opacity=".45"/><stop offset="1" stop-color="${CRIMSON}" stop-opacity="0"/></radialGradient>`;
  const body =
    `<g fill="#EDEDED" stroke="#EDEDED" opacity=".62" filter="url(#rough)">${brushStroke(rnd, 300, RULE_W - 330, y, 4.5)}</g>` +
    `<circle cx="${RULE_W - 250}" cy="${y}" r="22" fill="url(#h)"/>` +
    `<circle cx="${RULE_W - 250}" cy="${y}" r="5.5" fill="${CRIMSON_BRIGHT}"/>`;
  return svg(body, defs, RULE_W, RULE_H, 'xMidYMid meet');
}

/** A horizontal brush stroke: pressed in on the left, thinning out, and breaking into dry hairlines at the tail. */
export function brushStroke(rnd: Rng, x0: number, x1: number, y: number, width: number): string {
  const steps = 160;
  const top: string[] = [];
  const bottom: string[] = [];
  let wobble = 0;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = x0 + (x1 - x0) * t;
    wobble += gaussian(rnd) * 0.18;
    wobble *= 0.92;
    const w = width * (t < 0.05 ? 0.55 + (0.45 * t) / 0.05 : 1 - 0.85 * ((t - 0.05) / 0.95) ** 1.3);
    const cy = y + Math.sin(t * Math.PI * 1.4) * 2.5 + wobble;
    top.push(`${n(x)} ${n(cy - w / 2)}`);
    bottom.push(`${n(x)} ${n(cy + w / 2)}`);
  }
  let body = `<path d="M${top.join('L')}L${bottom.reverse().join('L')}Z"/>`;
  for (let k = 0; k < 5; k++) {
    const off = (k / 4 - 0.5) * width * 0.55;
    const start = x0 + (x1 - x0) * (0.62 + rnd() * 0.1);
    const dash = Array.from({ length: 6 }, () => n(6 + rnd() * 40)).join(' ');
    body += `<path d="M${n(start)} ${n(y + off)}L${n(x1 + 30 + rnd() * 40)} ${n(y + off + gaussian(rnd))}" fill="none" stroke-width="${n(0.7 + rnd() * 0.8)}" stroke-dasharray="${dash}"/>`;
  }
  return body + `<path d="${speck(rnd, x0, y, width * 0.6, 8)}"/>`;
}

/** Section divider, light mode: a length of bamboo laid on its side, with a sprig of leaves at the end. */
export function ruleInk(seed = 12): string {
  const rnd = seededRandom(seed);
  const y = RULE_H / 2;
  const stalk = bambooStalk(rnd, { x: 0, bottom: 0, top: -560, width: 7, dir: 1, leafSize: 0, leafy: 0 });
  const sprig = `<g fill="${BAMBOO.leaf}" opacity=".9">${leafCluster(rnd, 882, y - 6, 1, 3, 30)}${leafCluster(rnd, 880, y - 4, -1, 2, 24)}</g>`;
  const twig = `<path d="M866 ${y}Q876 ${y - 4} 882 ${y - 6}" fill="none" stroke="${BAMBOO.node}" stroke-width="1.5"/>`;
  const body = `<g filter="url(#rough)"><g transform="translate(320 ${y}) rotate(90)">${stalk}</g>${twig}${sprig}</g>`;
  return svg(body, rough('rough', 2), RULE_W, RULE_H, 'xMidYMid meet');
}

const FIN_W = 1600;
const FIN_H = 340;

/** The closing scene, dark mode: an eclipse rising over a black horizon, the sky gone red around it. */
export function finaleNight(seed = 77): string {
  const rnd = seededRandom(seed);
  const [mx, my, mr] = [FIN_W * 0.7, 250, 58];
  const horizon = FIN_H - 44;
  const defs =
    `<radialGradient id="sky" cx="${mx}" cy="${FIN_H + 40}" r="${FIN_W * 0.55}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${CRIMSON}" stop-opacity=".55"/><stop offset=".4" stop-color="${CRIMSON}" stop-opacity=".16"/><stop offset="1" stop-color="${CRIMSON}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="corona" cx="${mx}" cy="${my}" r="${mr * 2.6}" gradientUnits="userSpaceOnUse"><stop offset=".36" stop-color="#FFFFFF" stop-opacity=".95"/><stop offset=".42" stop-color="${CRIMSON_BRIGHT}" stop-opacity=".6"/><stop offset=".7" stop-color="${CRIMSON}" stop-opacity=".18"/><stop offset="1" stop-color="${CRIMSON}" stop-opacity="0"/></radialGradient>`;
  const rays: { o: number; el: string }[] = [];
  for (let i = 0; i < 300; i++) {
    const a = (i / 300) * Math.PI * 2;
    const len = 6 + rnd() ** 2 * 44;
    const [c, s] = [Math.cos(a), Math.sin(a)];
    rays.push({
      o: 0.25 + rnd() * 0.6,
      el: `<path d="M${n(mx + c * (mr + 1))} ${n(my + s * (mr + 1))}L${n(mx + c * (mr + len))} ${n(my + s * (mr + len))}"/>`,
    });
  }
  // The land: nearly flat, with a thin rim of red light along its edge.
  const pts: string[] = [];
  for (let x = -20; x <= FIN_W + 20; x += 40)
    pts.push(`${x} ${n(horizon + gaussian(rnd) * 1.6 + Math.sin(x / 190) * 3)}`);
  const land = `M${pts.join('L')}L${FIN_W + 20} ${FIN_H + 5}L-20 ${FIN_H + 5}Z`;
  const body =
    `<rect width="${FIN_W}" height="${FIN_H}" fill="url(#sky)"/>` +
    `<circle cx="${mx}" cy="${my}" r="${mr * 2.6}" fill="url(#corona)"/>` +
    buckets(rays, `stroke="${CRIMSON_BRIGHT}" stroke-width="1" stroke-linecap="round"`) +
    `<circle cx="${mx}" cy="${my}" r="${mr}" fill="#030303"/>` +
    `<path d="${land}" fill="none" stroke="${CRIMSON_BRIGHT}" stroke-width="2.5" opacity=".7"/>` +
    `<path d="${land}" fill="#020202"/>`;
  return svg(body, defs, FIN_W, FIN_H, 'xMidYMax slice');
}

/** The closing scene, light mode: a bamboo grove, near stalks in full ink and far ones in wash, under a brush ensō. */
export function finaleInk(seed = 88): string {
  const rnd = seededRandom(seed);
  const layer = (xs: number[], width: number, leaf: number) =>
    xs
      .map((x, i) =>
        bambooStalk(rnd, {
          x,
          bottom: FIN_H + 10,
          top: -40,
          width,
          lean: gaussian(rnd) * 0.02,
          dir: i % 2 ? -1 : 1,
          leafSize: leaf,
          leafy: 0.6,
        }),
      )
      .join('');
  const body =
    `<g opacity=".28" filter="url(#soft)">${layer([90, 330, 560, 820, 1360, 1530], 9, 44)}</g>` +
    `<g opacity=".6" filter="url(#rough)">${layer([200, 450, 700, 1290, 1470], 13, 56)}</g>` +
    `<g filter="url(#rough)">${layer([40, 310, 600, 1400, 1580], 18, 70)}</g>` +
    `<g fill="${INK}" stroke="${INK}" opacity=".85" filter="url(#rough)">${ensoStroke(rnd, FIN_W * 0.7, 120, 62, 16)}</g>` +
    `<circle cx="${FIN_W * 0.7 + 80}" cy="168" r="7" fill="${BAMBOO.leaf}" filter="url(#rough)"/>`;
  return svg(
    body,
    rough('rough', 2.5) + `<filter id="soft"><feGaussianBlur stdDeviation="1.4"/></filter>`,
    FIN_W,
    FIN_H,
    'xMidYMax slice',
  );
}

/**
 * A brush-drawn frame for light-mode panels, used as a CSS border-image (slice 30). It carries an explicit
 * width and height so browsers slice it predictably. Four strokes, each pressed in and overshooting its corner.
 */
export const FRAME = 240;
export function brushFrame(seed = 61): string {
  const rnd = seededRandom(seed);
  const [a, b] = [12, FRAME - 12];
  const side = (x0: number, y0: number, x1: number, y1: number, w: number) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const angle = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
    return `<g transform="translate(${n(x0)} ${n(y0)}) rotate(${n(angle)})">${brushStroke(rnd, 0, len, 0, w)}</g>`;
  };
  const body =
    side(a - 6, a + 1, b + 5, a - 1, 7.5) +
    side(b + 1, a - 6, b - 1, b + 5, 7) +
    side(b + 6, b, a - 5, b + 1, 7.5) +
    side(a, b + 6, a + 1, a - 5, 7);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${FRAME}" height="${FRAME}" viewBox="0 0 ${FRAME} ${FRAME}"><defs>${rough('rough', 2.5)}</defs><g fill="${INK}" stroke="${INK}" stroke-width=".4" filter="url(#rough)">${body}</g></svg>`;
}

/** A single wide brush swash, stretched to fill a button: even width, ragged edges, a dry-brush tail. */
export function brushButton(seed = 17, color = INK): string {
  const rnd = seededRandom(seed);
  const top: string[] = [];
  const bottom: string[] = [];
  let [up, down] = [0, 0];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60;
    const x = 4 + 192 * t;
    up = up * 0.7 + gaussian(rnd) * 0.9;
    down = down * 0.7 + gaussian(rnd) * 0.9;
    const squeeze = t > 0.9 ? ((t - 0.9) / 0.1) * 7 : t < 0.03 ? ((0.03 - t) / 0.03) * 5 : 0;
    top.push(`${n(x)} ${n(8 + squeeze + up)}`);
    bottom.push(`${n(x)} ${n(52 - squeeze + down)}`);
  }
  let hairs = '';
  for (let k = 0; k < 4; k++) {
    const y = 16 + k * 9 + gaussian(rnd);
    hairs += `<path d="M${n(150 + rnd() * 20)} ${n(y)}L${n(199)} ${n(y + gaussian(rnd) * 0.6)}" fill="none" stroke-width="${n(0.8 + rnd())}" stroke-dasharray="${n(8 + rnd() * 10)} ${n(3 + rnd() * 5)}"/>`;
  }
  const body = `<g fill="${color}" stroke="${color}" filter="url(#rough)"><path d="M${top.join('L')}L${bottom.reverse().join('L')}Z"/>${hairs}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" preserveAspectRatio="none"><defs>${rough('rough', 3)}</defs>${body}</svg>`;
}

/** A long, thin brush line for the light-mode nav's lower edge, stretched to any width. */
export function brushLine(seed = 23): string {
  const rnd = seededRandom(seed);
  const body = `<g fill="${INK}" stroke="${INK}" filter="url(#rough)">${brushStroke(rnd, 4, 1596, 8, 4.5)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 16" preserveAspectRatio="none"><defs>${rough('rough', 1.5)}</defs>${body}</svg>`;
}

export const artworks = {
  night: () => nightSky(),
  'night-tall': () => nightSky(1337, TALL),
  'night-twinkle': () => nightTwinkle(),
  'night-twinkle-tall': () => nightTwinkle(99, TALL),
  moon: () => moon(),
  ink: () => inkWash(),
  'ink-tall': () => inkWash(2024, TALL),
  enso: () => enso(),
  'stars-tile': () => starsTile(),
  'paper-tile': () => paperTile(),
  'rule-night': () => ruleNight(),
  'rule-ink': () => ruleInk(),
  'finale-night': () => finaleNight(),
  'finale-ink': () => finaleInk(),
  'brush-frame': () => brushFrame(),
  'brush-button': () => brushButton(),
  'brush-button-bamboo': () => brushButton(17, BAMBOO.leaf),
  'brush-line': () => brushLine(),
} as const;
export type ArtName = keyof typeof artworks;
