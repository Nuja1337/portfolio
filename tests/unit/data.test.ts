import { categories, categoryIds } from '../../src/data/blog';
import { describe, expect, it } from 'vitest';
import { jobs } from '../../src/data/career';
import { achievements } from '../../src/data/life';
import { loadout } from '../../src/data/loadout';
import { boardProjects, decks, featured, featuredProjects, filters, projects } from '../../src/data/projects';
import { milestones, spec, tenets } from '../../src/data/runefall';
import { sections } from '../../src/data/site';

describe('board', () => {
  it('gives every card a unique ref', () => {
    const refs = projects.map((p) => p.ref);
    expect(new Set(refs).size).toBe(refs.length);
  });

  it('only uses known tags, and every filter matches something', () => {
    const known = new Set(filters.map((f) => f.id));
    for (const p of projects) for (const t of p.tags) expect(known.has(t), `${p.ref}: ${t}`).toBe(true);
    for (const f of filters) {
      if (f.id === 'all') continue;
      expect(
        projects.some((p) => (p.tags as string[]).includes(f.id)),
        f.id,
      ).toBe(true);
    }
  });

  it('puts every card in a known deck, and keeps the games and tools on the board', () => {
    const known = new Set(decks.map((d) => d.id));
    for (const p of projects) expect(known.has(p.deck), p.ref).toBe(true);
    for (const d of ['games', 'tools'])
      expect(
        boardProjects.some((p) => p.deck === d),
        d,
      ).toBe(true);
  });

  it('links nothing that is no longer hosted', () => {
    const old = [
      '$qoth',
      '$cube',
      '$osu',
      '$keep',
      '$puff',
      '$barf',
      '$beast',
      '$cloato',
      '$guess',
      '$waiver',
      '$logs',
      '$sims',
    ];
    for (const p of projects.filter((p) => old.includes(p.ref))) {
      expect(p.link, p.ref).toBeUndefined();
      expect(p.offline, p.ref).toBe(true);
      expect(p.state.label, p.ref).not.toBe('Playable');
    }
  });

  it('links over https or mailto (or to a section of the page), and describes every image', () => {
    for (const p of projects) {
      if (p.link) expect(p.link.href, p.ref).toMatch(/^(https:\/\/|mailto:|#)/);
      if (p.image) expect(p.image.alt.length, p.ref).toBeGreaterThan(10);
    }
  });

  it('leads with four featured projects that each have a pitch, and keeps them off the board', () => {
    expect(featuredProjects).toHaveLength(4);
    for (const p of featuredProjects) {
      expect(p, 'featured ref').toBeDefined();
      expect(p.pitch, p.ref).toBeTruthy();
      expect(p.image, p.ref).toBeDefined();
    }
    for (const p of boardProjects) expect((featured as readonly string[]).includes(p.ref), p.ref).toBe(false);
    expect(boardProjects.length + featuredProjects.length + projects.filter((p) => p.partOf).length).toBe(
      projects.length,
    );
  });

  it('includes the web apps, and keeps the retired ones as history', () => {
    for (const title of ['Guild Golem', 'Drafts', 'Tally', 'Logs', 'Sims'])
      expect(
        projects.some((p) => p.title === title),
        title,
      ).toBe(true);
    for (const ref of ['$logs', '$sims'])
      expect(
        boardProjects.some((p) => p.ref === ref),
        ref,
      ).toBe(true);
  });
});

describe('Runefall', () => {
  it('has ten milestones with exactly one in progress, after every closed one', () => {
    expect(milestones).toHaveLength(10);
    const now = milestones.findIndex((m) => m.status === 'now');
    expect(milestones.filter((m) => m.status === 'now')).toHaveLength(1);
    milestones.forEach((m, i) => expect(m.status).toBe(i < now ? 'done' : i === now ? 'now' : 'todo'));
  });

  it('keeps the Rune Forge sealed: no forge internals anywhere in the content', () => {
    const text = JSON.stringify({ spec, tenets, jobs, loadout, projects, achievements }).toLowerCase();
    for (const secret of [
      'paradox',
      'powerscore',
      'meta-magic',
      'cadence',
      '130 rune',
      '31 paradox',
      'pillars of the forge',
    ]) {
      expect(text.includes(secret), secret).toBe(false);
    }
  });
});

describe('career and life', () => {
  it('keeps the freelance work and the QA internship, newest first', () => {
    expect(jobs.map((j) => j.ref)).toEqual(['$chuken', '$bigfix', '$intern', '$freelance', '$qa', '$ucsc']);
  });

  it('fills the three-column grid with no gaps and has unique titles', () => {
    // Spanning cards take two or three columns; cards with a photo take two rows.
    const cells = achievements.reduce((sum, a) => sum + (a.span ?? 1) * (a.photo ? 2 : 1), 0);
    expect(cells % 3).toBe(0);
    expect(new Set(achievements.map((a) => a.title)).size).toBe(achievements.length);
    expect(achievements.some((a) => /off the grid/i.test(a.title))).toBe(false);
  });

  it('drops the lines that were asked to go', () => {
    const text = achievements.map((a) => a.text).join(' ');
    for (const gone of ['Yosemite', 'feedback loop', 'strong opinions', 'mostly with friends'])
      expect(text).not.toContain(gone);
  });
});

describe('sections', () => {
  it('have unique ids and fit on the number keys', () => {
    const ids = sections.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeLessThanOrEqual(9);
    expect(ids[0]).toBe('top');
  });
});

describe('blog sections', () => {
  it('have unique ids and cover more than work', () => {
    expect(new Set(categoryIds).size).toBe(categories.length);
    for (const id of ['devlog', 'design', 'engineering', 'opinions', 'stories']) expect(categoryIds).toContain(id);
  });
});

describe('links', () => {
  it('open other sites and files in a new tab, and keep site navigation in place', async () => {
    const { opensNewTab, site } = await import('../../src/data/site');
    expect(site.resumes).toHaveLength(2);
    for (const r of site.resumes) expect(opensNewTab(r.href)).toBe(true);
    expect(opensNewTab('/rss.xml')).toBe(true);
    expect(opensNewTab(site.links.github)).toBe(true);
    expect(opensNewTab('/blog')).toBe(false);
    expect(opensNewTab('#contact')).toBe(false);
    expect(opensNewTab(`mailto:${site.email}`)).toBe(false);
  });
});

describe('runefall tenets', () => {
  it("are the game's core ideas, not a list of course corrections", () => {
    expect(new Set(tenets.map((t) => t.ref)).size).toBe(tenets.length);
    const titles = tenets.map((t) => t.title.toLowerCase()).join(' ');
    for (const retro of ['engine change', 'scope', 'cut']) expect(titles).not.toContain(retro);
  });
});
