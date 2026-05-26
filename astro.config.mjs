// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import remarkDirective from 'remark-directive';
import remarkMediaDirectives from './src/utils/remarkMediaDirectives.ts';

// https://astro.build/config
export default defineConfig({
  site: 'https://your-site.netlify.app',
  adapter: netlify(),
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [
      remarkDirective,
      remarkMediaDirectives,
    ],
  },
});