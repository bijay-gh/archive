import fs from 'node:fs';
import path from 'node:path';
import mammoth from 'mammoth';
import katex from 'katex';
import { processLatexImageMacros } from './latexImageMacros.ts';
import { renderFileFallbackHTML, renderMathFallbackHTML } from './safeRender.ts';

// Base content directory
const CONTENT_DIR = path.join(process.cwd(), 'src', 'content');

/**
 * Resolves the absolute path of a content file.
 */
export function getFilePath(collection: string, filename: string): string {
  return path.join(CONTENT_DIR, collection, filename);
}

/**
 * Extracts HTML from a .docx file using mammoth.js.
 */
export async function parseDocx(filePath: string): Promise<string> {
  if (!fs.existsSync(filePath)) {
    return renderFileFallbackHTML(filePath, "Document could not be loaded: file not found");
  }
  try {
    const result = await mammoth.extractToHtml({ path: filePath });
    return result.value;
  } catch (e: any) {
    return renderFileFallbackHTML(filePath, "Document could not be loaded: " + e.message);
  }
}

/**
 * Basic LaTeX parser that renders equations using KaTeX.
 * Note: This handles basic text and math ($...$ and $$...$$).
 * For a full document, a more advanced LaTeX to HTML converter is needed.
 */
export function parseTex(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return renderFileFallbackHTML(filePath, "LaTeX document could not be loaded: file not found");
  }
  
  let content = fs.readFileSync(filePath, 'utf-8');

  // Strip common LaTeX preamble (very basic)
  const documentMatch = content.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  if (documentMatch) {
    content = documentMatch[1];
  }

  // Process custom image macros and standard figures
  content = processLatexImageMacros(content, filePath);

  // Process undefined references and citations (fallback)
  content = content.replace(/\\ref\{([^}]+)\}/g, (match, label) => {
    return `<span class="inline-block text-accent font-semibold cursor-help" title="Reference '${label}' not found">[?]</span>`;
  });
  content = content.replace(/\\cite\{([^}]+)\}/g, (match, key) => {
    return `<span class="inline-block text-accent font-semibold cursor-help" title="Citation '${key}' not found">[citation?]</span>`;
  });
  content = content.replace(/\\(?:input|include)\{([^}]+)\}/g, (match, file) => {
    return renderFileFallbackHTML(file + '.tex', `Included file not found`);
  });
  content = content.replace(/\\bibliography\{([^}]+)\}/g, (match, file) => {
    return renderFileFallbackHTML(file + '.bib', `Bibliography file not found`);
  });

  // Convert sections to HTML headings with IDs
  content = content.replace(/\\(section|subsection|subsubsection)\*?\{(.*?)\}/g, (match, type, title) => {
    let level = 2;
    if (type === 'subsection') level = 3;
    if (type === 'subsubsection') level = 4;
    
    const slug = title.toLowerCase().trim().replace(/\\s+/g, '-').replace(/[^\\w\\-]+/g, '').replace(/\\-\\-+/g, '-');
    return `<h${level} id="${slug}">${title}</h${level}>`;
  });

  // Render display math: $$...$$ or \[...\]
  content = content.replace(/\$\$(.*?)\$\$/gs, (match, math) => {
    try {
      return katex.renderToString(math, { displayMode: true, throwOnError: true });
    } catch (e: any) {
      return renderMathFallbackHTML(math, true);
    }
  });

  // Render inline math: $...$ or \(...\)
  content = content.replace(/\$(.*?)\$/g, (match, math) => {
    try {
      return katex.renderToString(math, { displayMode: false, throwOnError: true });
    } catch (e: any) {
      return renderMathFallbackHTML(math, false);
    }
  });

  // Simple paragraph splitting
  const paragraphs = content
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map(p => {
      // If it's already a div (like display math), don't wrap in p
      if (p.startsWith('<div')) return p;
      return `<p>${p}</p>`;
    });

  // Add KaTeX CSS link for styling
  const katexCss = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" crossorigin="anonymous">`;
  
  return katexCss + '\n<div class="tex-content">\n' + paragraphs.join('\n') + '\n</div>';
}
