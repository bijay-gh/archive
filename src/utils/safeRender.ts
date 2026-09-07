/**
 * HTML string generators for graceful inline fallbacks.
 * These are used by Markdown parsers and AST transformers to inject
 * styled fallbacks instead of crashing or showing broken elements.
 */

function escAttr(s: string): string {
  if (!s) return '';
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function renderImageFallbackHTML(src: string): string {
  return `
    <figure class="fallback-box media-fallback flex flex-col items-center justify-center p-8 mb-6 border-2 border-dashed border-border-dark bg-bg-secondary rounded-lg text-center opacity-90 max-w-full overflow-hidden">
      <svg class="w-8 h-8 text-text-muted mb-2 opacity-80 sepia" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
      <span class="text-sm font-semibold text-text-primary mb-1">Image unavailable</span>
      <code class="text-xs text-text-muted font-mono px-2 py-1 bg-bg/50 rounded break-all max-w-full">${escAttr(src)}</code>
    </figure>
  `;
}

export function renderVideoFallbackHTML(src: string): string {
  return `
    <figure class="fallback-box media-fallback flex flex-col items-center justify-center p-8 mb-6 border-2 border-dashed border-border-dark bg-bg-secondary rounded-lg text-center opacity-90 w-full aspect-video">
      <svg class="w-10 h-10 text-text-muted mb-2 opacity-80 sepia" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      <span class="text-sm font-semibold text-text-primary mb-1">Video unavailable</span>
      <code class="text-xs text-text-muted font-mono px-2 py-1 bg-bg/50 rounded break-all max-w-full">${escAttr(src)}</code>
    </figure>
  `;
}

export function renderAudioFallbackHTML(src: string): string {
  return `
    <div class="fallback-box audio-fallback flex items-center p-4 mb-6 border-2 border-dashed border-border-dark bg-bg-secondary rounded-lg opacity-90 max-w-md mx-auto">
      <svg class="w-6 h-6 text-text-muted mr-3 opacity-80 sepia shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
      <div class="flex flex-col overflow-hidden">
        <span class="text-sm font-semibold text-text-primary leading-tight">Audio unavailable</span>
        <code class="text-[10px] text-text-muted font-mono truncate mt-1">${escAttr(src)}</code>
      </div>
    </div>
  `;
}

export function renderFileFallbackHTML(src: string, message: string = "Document could not be loaded"): string {
  return `
    <div class="fallback-box file-fallback flex items-start p-5 mb-6 border-2 border-dashed border-border-dark bg-bg-secondary rounded-lg opacity-90 w-full">
      <svg class="w-6 h-6 text-accent mr-3 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      <div class="flex flex-col min-w-0">
        <span class="text-sm font-bold text-text-primary">${escAttr(message)}</span>
        <code class="text-xs text-text-muted font-mono break-all mt-1">${escAttr(src)}</code>
      </div>
    </div>
  `;
}

export function renderMathFallbackHTML(source: string, isBlock: boolean = false): string {
  const inner = `
    <span class="inline-flex items-center gap-1 bg-bg-secondary border-dashed border border-border-dark px-1 rounded text-text-muted text-xs mx-1" title="Math render failed">
      <svg class="w-3 h-3 text-accent inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      <code class="font-mono text-text-primary bg-transparent p-0 border-0">${escAttr(source)}</code>
    </span>
  `;
  if (isBlock) {
    return `<div class="math-fallback-block my-4 text-center">${inner}</div>`;
  }
  return inner;
}

export function getLinkWarningIconHTML(message: string): string {
  return `<span class="inline-flex align-middle ml-1" title="${escAttr(message)}"><svg class="w-3.5 h-3.5 text-accent opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg></span>`;
}
