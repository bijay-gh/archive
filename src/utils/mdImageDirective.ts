import { validateLocalFile, validateUrl, logWarning } from './linkValidator.ts';
import { renderImageFallbackHTML } from './safeRender.ts';

/**
 * Escapes HTML special characters for safe embedding in attributes.
 */
function escAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function handleMdImage(node: any, attrs: Record<string, string>, filePath: string) {
  const src = attrs.src || '';
  const alt = attrs.alt || '';
  const caption = attrs.caption || '';
  
  if (src.startsWith('http')) {
    const isValid = await validateUrl(src);
    if (!isValid) {
      logWarning('Broken External Image', filePath, src);
      node.type = 'html';
      node.value = renderImageFallbackHTML(src);
      return;
    }
  } else if (!validateLocalFile(src, filePath)) {
    logWarning('Broken Local Image', filePath, src);
    node.type = 'html';
    node.value = renderImageFallbackHTML(src);
    return;
  }

  const width = attrs.width || 'auto';
  const height = attrs.height || 'auto';
  const float = attrs.float || 'none'; // left, right, none
  const align = attrs.align || 'left'; // left, center, right
  const display = attrs.display || 'block'; // block, inline
  const margin = attrs.margin || '';
  const rounded = attrs.rounded === 'true';
  const border = attrs.border === 'true';

  let containerClasses = 'media-image relative group ';
  let styleStr = '';

  if (display === 'inline') {
    containerClasses += 'inline-block ';
  } else {
    containerClasses += 'block ';
  }

  if (float === 'left') {
    containerClasses += 'float-left mr-6 mb-4 ';
  } else if (float === 'right') {
    containerClasses += 'float-right ml-6 mb-4 ';
  } else if (align === 'center') {
    containerClasses += 'mx-auto ';
  }

  if (margin) {
    styleStr += `margin: ${escAttr(margin)}; `;
  }

  styleStr += `width: ${escAttr(width)}; max-width: 100%; `;
  if (height !== 'auto') {
    styleStr += `height: ${escAttr(height)}; `;
  }

  let imgClasses = 'media-image__img w-full h-auto object-cover ';
  if (rounded) imgClasses += 'rounded-lg ';
  if (border) imgClasses += 'border border-border/50 shadow-sm ';

  let inner = `
    <img
      src="${escAttr(src)}"
      alt="${escAttr(alt)}"
      loading="lazy"
      decoding="async"
      data-lightbox="true"
      class="${imgClasses}"
    />`;

  if (caption) {
    inner += `<figcaption class="media-caption mt-2 text-sm text-text-muted text-center italic">${escAttr(caption)}</figcaption>`;
  }

  const data = node.data || (node.data = {});
  data.hName = 'figure';
  data.hProperties = { 
    class: containerClasses.trim(),
    style: styleStr.trim()
  };
  node.children = [{ type: 'html', value: inner }];
}

export function handleMdClearfix(node: any) {
  const data = node.data || (node.data = {});
  data.hName = 'div';
  data.hProperties = { class: 'clear-both' };
  node.children = [];
}
