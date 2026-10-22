/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// Unit tests only; e2e specs run under Playwright.
export default getViteConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
