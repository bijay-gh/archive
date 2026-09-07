import { visit } from 'unist-util-visit';
import { validateLocalFile, validateUrl, logWarning } from './linkValidator.ts';
import { renderImageFallbackHTML, getLinkWarningIconHTML } from './safeRender.ts';
import type { Plugin } from 'unified';

function escAttr(s: string): string {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const remarkSafeLinks: Plugin = () => {
  return async (tree: any, file: any) => {
    const promises: Promise<void>[] = [];
    
    visit(tree, ['link', 'image'], (node: any) => {
      promises.push((async () => {
        const filePath = file.history && file.history.length > 0 ? file.history[0] : 'unknown_file';
        
        if (node.type === 'link') {
          const url = node.url || '';
          if (url.startsWith('http')) {
            const isValid = await validateUrl(url);
            if (!isValid) {
              logWarning('Broken External Link', filePath, url);
              
              // We want to keep the inner text.
              let innerText = '';
              if (node.children) {
                // very simple text extraction
                innerText = node.children.map((c: any) => c.value || c.title || '').join('');
              }
              
              node.type = 'html';
              node.value = `<a href="${escAttr(url)}" target="_blank" rel="noopener noreferrer" class="opacity-80 cursor-default no-underline text-text-muted" title="Link may be unavailable">${escAttr(innerText || url)}${getLinkWarningIconHTML("Link may be unavailable")}</a>`;
            }
          }
        } else if (node.type === 'image') {
          const url = node.url || '';
          if (url.startsWith('http')) {
            const isValid = await validateUrl(url);
            if (!isValid) {
              logWarning('Broken External Image', filePath, url);
              node.type = 'html';
              node.value = renderImageFallbackHTML(url);
            }
          } else {
            const isValid = validateLocalFile(url, filePath);
            if (!isValid) {
              logWarning('Broken Local Image', filePath, url);
              node.type = 'html';
              node.value = renderImageFallbackHTML(url);
            }
          }
        }
      })());
    });
    
    await Promise.all(promises);
  };
};

export default remarkSafeLinks;
