// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static site served from Cloudflare Workers static assets (see wrangler.jsonc).
export default defineConfig({
  site: 'https://portfolio.ajshaham.workers.dev',
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
