import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categoryIds } from './data/blog';

/**
 * Blog posts: Markdown files in src/content/blog. Files starting with "_" are ignored; `draft: true` shows only in dev.
 * Every post belongs to one section (src/data/blog.ts).
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(categoryIds),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

/**
 * Breakdowns: how a project was built. Markdown files in src/content/breakdowns, named after the project's
 * `breakdown` slug (src/data/projects.ts, src/data/career.ts). Cards and entries link one only once it is published;
 * `draft: true` shows only in dev.
 */
const breakdowns = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/breakdowns' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      /** One line under the title, and the link preview. */
      description: z.string(),
      /** Screenshot under the header, relative to the Markdown file. */
      image: image(),
      imageAlt: z.string(),
      /** Optional line under the screenshot. */
      caption: z.string().optional(),
      role: z.string(),
      timeline: z.string(),
      stack: z.array(z.string()),
      status: z.string(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { blog, breakdowns };
