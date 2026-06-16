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

  // Strip frontmatter if present (with or without % prefix)
  content = content.replace(/^(?:%?\s*---\r?\n[\s\S]*?\r?\n%?\s*---)/, '');

  // Strip common LaTeX preamble (very basic)
  const documentMatch = content.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  if (documentMatch) {
    content = documentMatch[1];
  }

  // Process custom image macros and standard figures
  content = processLatexImageMacros(content, filePath);

  // Process LaTeX tabular environment
  content = content.replace(/\\begin\{tabular\}\{([^}]+)\}([\s\S]*?)\\end\{tabular\}/g, (match, alignSpec, inner) => {
    const aligns = alignSpec.replace(/[^lcr]/g, '').split('');
    const rows = inner
      .split(/\\\\/)
      .map(row => row.trim())
      .filter(row => {
        const clean = row.replace(/\\hline/g, '').trim();
        return clean.length > 0;
      });

    let html = '<table class="table-auto border-collapse border border-border/50 my-6 mx-auto">\n';

    rows.forEach((row, rowIndex) => {
      // Remove any inline hlines
      const cleanRow = row.replace(/\\hline/g, '').trim();
      html += '  <tr>\n';
      const cells = cleanRow.split('&').map(cell => cell.trim());
      cells.forEach((cell, cellIndex) => {
        const align = aligns[cellIndex] === 'r' ? 'text-right' : (aligns[cellIndex] === 'c' ? 'text-center' : 'text-left');
        const tag = rowIndex === 0 ? 'th' : 'td';
        const classes = `border border-border/50 px-4 py-2 ${align} ${rowIndex === 0 ? 'bg-surface/50 font-semibold text-text' : 'text-text'}`;
        html += `    <${tag} class="${classes}">${cell}</${tag}>\n`;
      });
      html += '  </tr>\n';
    });

    html += '</table>';
    return html;
  });

  // Process \href{url}{text} and \url{url}
  content = content.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, (match, url, text) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="link">${text}</a>`;
  });
  content = content.replace(/\\url\{([^}]+)\}/g, (match, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="link">${url}</a>`;
  });

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

  // Render display math: $$...$$, \[...\], \begin{equation}...\end{equation}, \begin{align}...\end{align}
  content = content.replace(/\$\$(.*?)\$\$|\\\[(.*?)\\\]|\\begin\{equation\}(.*?)\\end\{equation\}|\\begin\{align\}(.*?)\\end\{align\}/gs, (match, m1, m2, m3, m4) => {
    const math = m1 || m2 || m3 || m4;
    if (!math) return match;
    try {
      return katex.renderToString(math, { displayMode: true, throwOnError: true });
    } catch (e: any) {
      return renderMathFallbackHTML(math, true);
    }
  });

  // Render inline math: $...$ or \(...\)
  content = content.replace(/\$(.*?)\$|\\\((.*?)\\\)/g, (match, m1, m2) => {
    const math = m1 || m2;
    if (!math) return match;
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
      // If it's already a div or display math span, don't wrap in p
      if (p.startsWith('<div') || p.startsWith('<span class="katex-display"')) return p;
      return `<p>${p}</p>`;
    });

  // Add KaTeX CSS link for styling
  const katexCss = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css" crossorigin="anonymous">`;

  return katexCss + '\n<div class="tex-content">\n' + paragraphs.join('\n') + '\n</div>';
}
