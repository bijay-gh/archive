# Migration Report: Astro Upgrade & Cloudflare Migration

## 1. Dependency Changes

| Package | Old Version | New Version | Reason |
|---------|-------------|-------------|--------|
| `astro` | `6.3.6` | `7.0.2` | Core framework upgrade |
| `@astrojs/netlify` | `7.0.10` | `8.0.0` | Official adapter upgrade |
| `@astrojs/sitemap` | `3.7.2` | `3.7.3` | Minor bump |
| `@astrojs/markdown-remark` | `n/a` | latest | Required after Astro 7 markdown processor change |

## 2. Breaking Changes Encountered

- **Astro 7 Default Markdown Processor Change**: 
  - **What broke**: `npm run build` failed with the error: `` `markdown.remarkPlugins`, `markdown.rehypePlugins`, and `markdown.remarkRehype` run on the `unified` processor from `@astrojs/markdown-remark`, which is no longer installed by default now that Sätteri is the default Markdown processor. ``
  - **How fixed**: Installed `@astrojs/markdown-remark` explicitly to maintain support for `remark-math` and `rehype-katex`.

## 3. Cloudflare Migration Summary

*(To be filled during migration)*

## 4. Netlify-specific Features with No Direct Equivalent

*(To be filled during migration)*

## 5. Manual Steps Required from the Owner

*(To be filled during migration)*

## 6. Rollback Plan

*(To be filled during migration)*

## 7. Outstanding/Unresolved Issues

*(To be filled during migration)*
