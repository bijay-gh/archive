import { getCollection } from 'astro:content';
import fs from 'node:fs';
import path from 'node:path';
import mime from 'mime-types';
import glob from 'fast-glob';
import type { APIRoute } from 'astro';

// Ensure this endpoint is prerendered as static files during build
export const prerender = true;

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');

export async function getStaticPaths() {
  const collections = ['posts', 'notes', 'reports', 'projects'];
  const paths: any[] = [];

  for (const collection of collections) {
    const items = await getCollection(collection as any);
    for (const item of items) {
      if (item.data.format && item.data.format !== 'md' && item.data.file) {
        paths.push({
          params: { path: `${collection}/${item.data.file}` },
          props: { collection, file: item.data.file },
        });
      }
    }
  }

  // Also include any files in 'media' subdirectories within content
  const mediaFiles = await glob('**/*/media/**/*', { cwd: CONTENT_DIR });
  for (const file of mediaFiles) {
    const parts = file.split('/');
    const collection = parts[0];
    const rest = parts.slice(1).join('/');
    paths.push({
      params: { path: `${collection}/${rest}` },
      props: { collection, file: rest },
    });
  }

  return paths;
}

export const GET: APIRoute = async ({ props }) => {
  const { collection, file } = props;
  const filePath = path.join(CONTENT_DIR, collection, file);

  if (!fs.existsSync(filePath)) {
    return new Response('Not found', { status: 404 });
  }

  const buffer = fs.readFileSync(filePath);
  const mimeType = mime.lookup(filePath) || 'application/octet-stream';

  return new Response(buffer, {
    headers: {
      'Content-Type': mimeType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
