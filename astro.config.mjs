// @ts-check
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import remarkDirective from 'remark-directive';
import remarkMediaDirectives from './src/utils/remarkMediaDirectives.ts';

import fs from 'node:fs';
import path from 'node:path';
import { getWarnings } from './src/utils/linkValidator.ts';
import remarkSafeLinks from './src/utils/remarkSafeLinks.ts';

function brokenLinksReporter() {
  return {
    name: 'broken-links-reporter',
    hooks: {
      'astro:build:done': () => {
        const warnings = getWarnings();
        const reportPath = path.join(process.cwd(), 'broken-links-report.txt');
        if (warnings.length > 0) {
          const lines = warnings.map(w => `[WARN] ${w.type}: ${w.file}\n  -> ${w.message}`);
          fs.writeFileSync(reportPath, lines.join('\n\n'), 'utf-8');
          console.log(`\n[Report] Wrote ${warnings.length} warnings to broken-links-report.txt\n`);
        } else {
          fs.writeFileSync(reportPath, 'No broken links found.', 'utf-8');
        }
      }
    }
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://your-site.netlify.app',
  adapter: netlify(),
  integrations: [sitemap(), tailwind(), brokenLinksReporter()],
  markdown: {
    remarkPlugins: [
      remarkSafeLinks,
      remarkDirective,
      remarkMediaDirectives,
    ],
  },
});