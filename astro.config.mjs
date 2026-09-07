// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import remarkDirective from 'remark-directive';
import remarkMediaDirectives from './src/utils/remarkMediaDirectives.ts';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import fs from 'node:fs';
import path from 'node:path';
import { getWarnings } from './src/utils/linkValidator.ts';
import { unified } from '@astrojs/markdown-remark';
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
  integrations: [sitemap(), brokenLinksReporter()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    processor: unified({
      remarkPlugins: [
        remarkSafeLinks,
        remarkDirective,
        remarkMediaDirectives,
        remarkMath,
      ],
      rehypePlugins: [
        [rehypeKatex, { strict: false }],
      ],
    }),
  },
});