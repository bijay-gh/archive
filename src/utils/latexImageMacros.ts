/**
 * Processes custom LaTeX image macros and \clearfloat, converting them to HTML.
 */
export function processLatexImageMacros(content: string): string {
  let processed = content;

  // \imageleft{src}{width}{caption}
  // e.g. \imageleft{chart.png}{0.35}{Caption here}
  processed = processed.replace(/\\imageleft\{(.*?)\}\{(.*?)\}\{(.*?)\}/g, (match, src, width, caption) => {
    return generateImageHtml(src, width, caption, 'left');
  });

  // \imageright{src}{width}{caption}
  processed = processed.replace(/\\imageright\{(.*?)\}\{(.*?)\}\{(.*?)\}/g, (match, src, width, caption) => {
    return generateImageHtml(src, width, caption, 'right');
  });

  // \imagecenter{src}{width}{caption}
  processed = processed.replace(/\\imagecenter\{(.*?)\}\{(.*?)\}\{(.*?)\}/g, (match, src, width, caption) => {
    return generateImageHtml(src, width, caption, 'center');
  });

  // \imageinline{src}{height}
  // e.g. \imageinline{icon.png}{1.2em}
  processed = processed.replace(/\\imageinline\{(.*?)\}\{(.*?)\}/g, (match, src, height) => {
    return `<img src="${src}" style="height: ${height}; width: auto;" class="inline-block align-middle mx-1" />`;
  });

  // \subpage{slug}{label}
  processed = processed.replace(/\\subpage\{(.*?)\}\{(.*?)\}/g, (match, slug, label) => {
    return `
      <a href="/notes/${slug}" class="subpage-link block my-8 group no-underline">
        <div class="border border-border/50 rounded-xl p-6 bg-surface/30 hover:bg-surface/60 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-between">
          <div class="flex-1">
            <span class="text-sm font-medium text-forest uppercase tracking-wider mb-1 block">Deep Dive</span>
            <h3 class="text-xl font-semibold text-text group-hover:text-forest transition-colors duration-200 m-0">${label}</h3>
          </div>
          <div class="ml-4 bg-forest/10 rounded-full p-3 group-hover:bg-forest/20 transition-colors duration-300">
            <svg class="w-6 h-6 text-forest" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </div>
        </div>
      </a>
    `;
  });

  // \clearfloat
  processed = processed.replace(/\\clearfloat/g, '<div class="clear-both"></div>');

  // Also try to handle standard \begin{figure} mostly gracefully
  processed = processed.replace(/\\begin\{figure\}\[h?\]([\s\S]*?)\\end\{figure\}/g, (match, inner) => {
    let src = '';
    let caption = '';
    let width = '100%';
    
    const incMatch = inner.match(/\\includegraphics(?:\[width=(.*?)\])?\{(.*?)\}/);
    if (incMatch) {
      if (incMatch[1]) width = incMatch[1].replace('\\textwidth', '%').replace(/[^0-9.%a-z]/g, '');
      src = incMatch[2];
    }
    const capMatch = inner.match(/\\caption\{(.*?)\}/);
    if (capMatch) caption = capMatch[1];

    if (!src) return match;
    return generateImageHtml(src, width, caption, 'center');
  });

  return processed;
}

function generateImageHtml(src: string, width: string, caption: string, align: 'left' | 'right' | 'center'): string {
  // Translate latex widths like 0.35 to 35% if they don't have units
  let cssWidth = width;
  if (/^[0-9.]+$/.test(width)) {
    cssWidth = `${parseFloat(width) * 100}%`;
  } else if (width.includes('\\textwidth')) {
    cssWidth = width.replace('\\textwidth', '%').replace(/[^0-9.%a-z]/g, '');
  }

  let containerClasses = 'media-image relative group block ';
  if (align === 'left') {
    containerClasses += 'float-left mr-6 mb-4 ';
  } else if (align === 'right') {
    containerClasses += 'float-right ml-6 mb-4 ';
  } else if (align === 'center') {
    containerClasses += 'mx-auto mb-4 ';
  }

  return `
    <figure class="${containerClasses.trim()}" style="width: ${cssWidth}; max-width: 100%;">
      <img src="${src}" alt="${caption || ''}" class="w-full h-auto rounded-lg border border-border/50 shadow-sm" loading="lazy" />
      ${caption ? `<figcaption class="media-caption mt-2 text-sm text-text-muted text-center italic">${caption}</figcaption>` : ''}
    </figure>
  `;
}
