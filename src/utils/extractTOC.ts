export interface TOCItem {
  depth: number;
  slug: string;
  text: string;
}

/**
 * Normalizes headings to a tree or linear list for the TOC sidebar.
 * Astro's `render()` provides headings for MD/MDX.
 */
export function extractTOCFromHeadings(headings: TOCItem[], maxDepth: number = 3): TOCItem[] {
  return headings.filter((h) => h.depth <= maxDepth);
}

/**
 * Generates a slug from text.
 */
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * Extracts TOC from HTML string (e.g., converted from docx).
 */
export function extractTOCFromHTML(html: string, maxDepth: number = 3): TOCItem[] {
  const headings: TOCItem[] = [];
  const regex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  let match;

  while ((match = regex.exec(html)) !== null) {
    const depth = parseInt(match[1], 10);
    if (depth <= maxDepth) {
      const text = match[2].replace(/<[^>]+>/g, '').trim();
      const slug = slugify(text);
      headings.push({ depth, slug, text });
    }
  }

  return headings;
}

/**
 * Extracts TOC from LaTeX string.
 */
export function extractTOCFromTex(tex: string, maxDepth: number = 3): TOCItem[] {
  const headings: TOCItem[] = [];
  // Basic matching for section, subsection, subsubsection
  const regex = /\\(section|subsection|subsubsection)\*?\{(.*?)\}/g;
  let match;

  while ((match = regex.exec(tex)) !== null) {
    const type = match[1];
    let depth = 1;
    if (type === 'subsection') depth = 2;
    if (type === 'subsubsection') depth = 3;

    if (depth <= maxDepth) {
      const text = match[2].trim();
      const slug = slugify(text);
      headings.push({ depth, slug, text });
    }
  }

  return headings;
}

/**
 * Adds id attributes to HTML headings based on their slug so the TOC can link to them.
 */
export function injectHeadingIds(html: string): string {
  return html.replace(/<h([1-6])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, content) => {
    if (attrs.includes('id=')) return match;
    const text = content.replace(/<[^>]+>/g, '').trim();
    const slug = slugify(text);
    return `<h${level}${attrs} id="${slug}">${content}</h${level}>`;
  });
}
