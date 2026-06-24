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

- **Path Chosen**: Fully Static Site using Cloudflare Workers with Static Assets (`assets: { directory: "./dist" }`).
- **Why**: Inspection of the codebase (`astro.config.mjs` and `src/pages`) revealed no `output: 'server'` nor `prerender = false` usage. The site generates entirely static files.
- **Environment Variables**: No Netlify-specific environment variables or `netlify.toml` were present in the repository. If there are environment variables configured in the Netlify dashboard, they will need to be added to Cloudflare manually (via `wrangler.jsonc` `vars` or `npx wrangler secret put`).

## 4. Netlify-specific Features with No Direct Equivalent

- The project previously contained `public/_redirects` specifying `/* /index.html 200` (SPA fallback).
- **Resolution**: I ported this behavior directly into `wrangler.jsonc` by configuring `"not_found_handling": "single-page-application"`. There are no unresolved Netlify-specific features.

## 5. Manual Steps Required from the Owner

Since deploying and changing DNS require access to your personal Cloudflare account, please execute the following steps locally to complete the cutover:

1. **Authentication**: Run `npx wrangler login` to authenticate the CLI with your Cloudflare account.
2. **First Deployment**: Run `npx wrangler deploy` to push the site. It will give you a `.workers.dev` URL where you can verify the site works live.
3. **DNS Cutover**:
   - Go to your Cloudflare Dashboard > Workers & Pages > `your-site-name` > Settings > Triggers.
   - Add your custom domain.
   - Update your domain registrar's DNS records to point to Cloudflare (if not already managed by Cloudflare).
   - Wait for DNS propagation and verify SSL.

## 6. Rollback Plan

- **Netlify Fallback**: Your Netlify site and its configuration in the dashboard have not been deleted.
- **To Revert**: Simply execute `git revert HEAD` to undo the Phase 2 commit (`chore: migrate hosting from Netlify to Cloudflare`). This will bring back `@astrojs/netlify` and remove `wrangler.jsonc`. Pushing this reverted state to `main` will restore Netlify builds.

## 7. Outstanding/Unresolved Issues

- **None**: The upgrade and migration were completed successfully. The only remaining tasks are the manual execution of `wrangler login` and `wrangler deploy` by the project owner.
