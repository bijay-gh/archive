import { defineCollection, z } from 'astro:content';
import { glob as astroGlob } from 'astro/loaders';
import fs from 'node:fs';
import path from 'node:path';
import fastGlob from 'fast-glob';

// Simple parser to extract frontmatter from LaTeX comment block at the top
function parseTexFrontmatter(content: string) {
  const frontmatter: Record<string, any> = {};
  const lines = content.split(/\r?\n/);
  let inFrontmatter = false;
  let hasFrontmatter = false;
  let isCommented = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '---' || trimmed === '% ---' || trimmed === '%---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
        hasFrontmatter = true;
        isCommented = trimmed.startsWith('%');
        continue;
      } else {
        break; // End of frontmatter block
      }
    }

    if (inFrontmatter) {
      let cleanLine = trimmed;
      if (isCommented) {
        if (trimmed.startsWith('%')) {
          cleanLine = trimmed.slice(1).trim();
        } else {
          break; // Malformed frontmatter
        }
      }
      
      const colonIndex = cleanLine.indexOf(':');
      if (colonIndex !== -1) {
        const key = cleanLine.substring(0, colonIndex).trim();
        const value = cleanLine.substring(colonIndex + 1).trim();
        
        // Basic type parsing
        if (value === 'true') {
          frontmatter[key] = true;
        } else if (value === 'false') {
          frontmatter[key] = false;
        } else if (!isNaN(Number(value)) && value !== '') {
          frontmatter[key] = Number(value);
        } else if (value.startsWith('[') && value.endsWith(']')) {
          frontmatter[key] = value
            .slice(1, -1)
            .split(',')
            .map(s => s.trim().replace(/^["']|["']$/g, ''))
            .filter(Boolean);
        } else {
          frontmatter[key] = value.replace(/^["']|["']$/g, '');
        }
      }
    }
  }
  return hasFrontmatter ? frontmatter : null;
}

// Combined loader helper that merges standard glob loading with custom .tex frontmatter parsing
function createTexGlobLoader({ pattern, base }: { pattern: string; base: string }) {
  const baseLoader = astroGlob({ pattern, base });
  const absoluteBase = path.resolve(base);

  return {
    name: 'tex-glob-loader',
    load: async (context: any) => {
      const { watcher, store } = context;

      const loadTexFiles = async () => {
        const texFiles = await fastGlob('**/*.tex', { cwd: absoluteBase, absolute: true });
        for (const filePath of texFiles) {
          const relativePath = path.relative(absoluteBase, filePath).replace(/\\/g, '/');
          const id = relativePath.replace(/\.tex$/, '');
          
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const frontmatter = parseTexFrontmatter(content);
            
            if (frontmatter) {
              const parsed = await context.parseData({
                id,
                data: {
                  format: 'tex',
                  file: path.basename(filePath),
                  ...frontmatter,
                },
              });

              store.set({
                id,
                data: parsed,
                body: content,
              });
            } else {
              store.delete(id);
            }
          } catch (err) {
            console.error(`Error loading .tex file ${filePath}:`, err);
          }
        }
      };

      // 1. Run standard glob loader for .md, .mdx, and .json
      await baseLoader.load(context);

      // 2. Discover and parse .tex files manually
      await loadTexFiles();

      // 3. Register watcher for development mode
      if (watcher) {
        const globPattern = path.join(absoluteBase, '**/*.tex').replace(/\\/g, '/');
        watcher.add(globPattern);

        const reloadOnWatcherEvent = async (filePath: string) => {
          if (filePath.endsWith('.tex')) {
            await loadTexFiles();
          }
        };

        if (!context.meta.get('watcher-initialized')) {
          watcher.on('add', reloadOnWatcherEvent);
          watcher.on('change', reloadOnWatcherEvent);
          watcher.on('unlink', async (filePath: string) => {
            if (filePath.endsWith('.tex')) {
              const relativePath = path.relative(absoluteBase, filePath).replace(/\\/g, '/');
              const id = relativePath.replace(/\.tex$/, '');
              store.delete(id);
            }
          });
          context.meta.set('watcher-initialized', true);
        }
      }
    }
  };
}

const posts = defineCollection({
  loader: createTexGlobLoader({ pattern: '**/*.{md,mdx,json}', base: './src/content/posts' }),
  schema: z.object({
    format: z.enum(['md', 'pdf', 'docx', 'tex']).default('md'),
    file: z.string().optional(),
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('The Author'),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    toc: z.boolean().default(false),
    toc_depth: z.number().default(3),
    listed: z.boolean().default(true),
    parent: z.string().optional(),
    media: z.object({
      hasVideo: z.boolean().default(false),
      hasAudio: z.boolean().default(false),
      hasImages: z.boolean().default(false),
    }).optional(),
  }),
});

const notes = defineCollection({
  loader: createTexGlobLoader({ pattern: '**/*.{md,mdx,json}', base: './src/content/notes' }),
  schema: z.object({
    format: z.enum(['md', 'pdf', 'docx', 'tex']).default('md'),
    file: z.string().optional(),
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    subject: z.string().default('General'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    toc: z.boolean().default(false),
    toc_depth: z.number().default(3),
    listed: z.boolean().default(true),
    parent: z.string().optional(),
    media: z.object({
      hasVideo: z.boolean().default(false),
      hasAudio: z.boolean().default(false),
      hasImages: z.boolean().default(false),
    }).optional(),
  }),
});

const reports = defineCollection({
  loader: createTexGlobLoader({ pattern: '**/*.{md,mdx,json}', base: './src/content/reports' }),
  schema: z.object({
    format: z.enum(['md', 'pdf', 'docx', 'tex']).default('md'),
    file: z.string().optional(),
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('The Author'),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    toc: z.boolean().default(false),
    toc_depth: z.number().default(3),
    listed: z.boolean().default(true),
    parent: z.string().optional(),
    media: z.object({
      hasVideo: z.boolean().default(false),
      hasAudio: z.boolean().default(false),
      hasImages: z.boolean().default(false),
    }).optional(),
  }),
});

const projects = defineCollection({
  loader: createTexGlobLoader({ pattern: '**/*.{md,mdx,json}', base: './src/content/projects' }),
  schema: z.object({
    format: z.enum(['md', 'pdf', 'docx', 'tex']).default('md'),
    file: z.string().optional(),
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    status: z.enum(['in-progress', 'completed', 'archived']).default('in-progress'),
    tags: z.array(z.string()).default([]),
    url: z.string().url().optional(),
    draft: z.boolean().default(false),
    toc: z.boolean().default(false),
    toc_depth: z.number().default(3),
    listed: z.boolean().default(true),
    parent: z.string().optional(),
    media: z.object({
      hasVideo: z.boolean().default(false),
      hasAudio: z.boolean().default(false),
      hasImages: z.boolean().default(false),
    }).optional(),
  }),
});

export const collections = { posts, notes, reports, projects };
