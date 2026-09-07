/**
 * Lightweight vanilla JS lightbox for [data-lightbox] images.
 * Supports keyboard navigation (Escape, Left, Right) and grouped galleries.
 */
(function initLightbox() {
  let overlay: HTMLDivElement | null = null;
  let imgEl: HTMLImageElement | null = null;
  let captionEl: HTMLDivElement | null = null;
  let images: HTMLImageElement[] = [];
  let currentIndex = 0;

  function createOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';

    imgEl = document.createElement('img');
    imgEl.alt = '';

    captionEl = document.createElement('div');
    captionEl.className = 'lightbox-caption';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'lightbox-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.addEventListener('click', close);

    const prevBtn = document.createElement('button');
    prevBtn.className = 'lightbox-prev';
    prevBtn.innerHTML = '&#8249;';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.addEventListener('click', prev);

    const nextBtn = document.createElement('button');
    nextBtn.className = 'lightbox-next';
    nextBtn.innerHTML = '&#8250;';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.addEventListener('click', next);

    overlay.appendChild(imgEl);
    overlay.appendChild(captionEl);
    overlay.appendChild(closeBtn);
    overlay.appendChild(prevBtn);
    overlay.appendChild(nextBtn);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    document.body.appendChild(overlay);
  }

  function open(index: number) {
    if (!overlay) createOverlay();
    currentIndex = index;
    show();
    overlay!.classList.add('is-active');
    overlay!.setAttribute('data-count', String(images.length));
    document.body.style.overflow = 'hidden';
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('is-active');
    document.body.style.overflow = '';
  }

  function show() {
    if (!imgEl || !captionEl) return;
    const img = images[currentIndex];
    imgEl.src = img.src;
    imgEl.alt = img.alt || '';
    const fig = img.closest('figure');
    const cap = fig?.querySelector('figcaption');
    captionEl.textContent = cap?.textContent || img.alt || '';
    captionEl.style.display = captionEl.textContent ? '' : 'none';
  }

  function prev() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    show();
  }

  function next() {
    currentIndex = (currentIndex + 1) % images.length;
    show();
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!overlay?.classList.contains('is-active')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  });

  // Bind to all lightbox images
  function bind() {
    images = Array.from(document.querySelectorAll<HTMLImageElement>('[data-lightbox]'));
    images.forEach((img, i) => {
      img.addEventListener('click', () => open(i));
      img.style.cursor = 'zoom-in';
    });
  }

  // Init on DOM ready and after Astro page transitions
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
  document.addEventListener('astro:page-load', bind);
})();
