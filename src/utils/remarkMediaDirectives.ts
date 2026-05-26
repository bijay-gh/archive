import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';

/**
 * Detects if a URL is a YouTube video and extracts the video ID.
 */
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

/**
 * Detects if a URL is a Vimeo video and extracts the video ID.
 */
function getVimeoId(url: string): string | null {
  const m = url.match(/vimeo\.com\/(\d+)/);
  return m ? m[1] : null;
}

/**
 * Escapes HTML special characters for safe embedding in attributes.
 */
function escAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * Remark plugin that transforms custom media directives into HTML.
 *
 * Supported directives:
 *   ::video{src="local.mp4" caption="..."}
 *   ::video{url="https://youtube.com/watch?v=xxx" caption="..."}
 *   ::image{src="image.png" alt="..." caption="..."}
 *   ::audio{src="audio.mp3" caption="..."}
 *   ::gallery{images="a.png,b.png,c.png" captions="Cap A,Cap B,Cap C"}
 */
const remarkMediaDirectives: Plugin = () => {
  return (tree: any) => {
    visit(tree, (node: any) => {
      // Only process leaf directives (::name{...})
      if (node.type !== 'leafDirective') return;

      const attrs = node.attributes || {};
      const name = node.name;

      if (name === 'video') {
        handleVideo(node, attrs);
      } else if (name === 'image') {
        handleImage(node, attrs);
      } else if (name === 'audio') {
        handleAudio(node, attrs);
      } else if (name === 'gallery') {
        handleGallery(node, attrs);
      }
    });
  };
};

function handleVideo(node: any, attrs: Record<string, string>) {
  const src = attrs.src || '';
  const url = attrs.url || '';
  const caption = attrs.caption || '';
  const target = url || src;

  let inner = '';

  const ytId = getYouTubeId(target);
  const vimeoId = getVimeoId(target);

  if (ytId) {
    inner = `
      <div class="media-video__wrapper media-video__wrapper--16x9">
        <iframe
          src="https://www.youtube-nocookie.com/embed/${ytId}"
          title="${escAttr(caption || 'YouTube video')}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>`;
  } else if (vimeoId) {
    inner = `
      <div class="media-video__wrapper media-video__wrapper--16x9">
        <iframe
          src="https://player.vimeo.com/video/${vimeoId}?dnt=1"
          title="${escAttr(caption || 'Vimeo video')}"
          frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>`;
  } else {
    // Local / direct video file
    inner = `
      <div class="media-video__wrapper media-video__wrapper--16x9">
        <video controls preload="metadata" loading="lazy">
          <source src="${escAttr(target)}" />
          Your browser does not support the video tag.
        </video>
      </div>`;
  }

  if (caption) {
    inner += `<p class="media-caption">${caption}</p>`;
  }

  const data = node.data || (node.data = {});
  data.hName = 'figure';
  data.hProperties = { class: 'media-video' };
  node.children = [{ type: 'html', value: inner }];
}

function handleImage(node: any, attrs: Record<string, string>) {
  const src = attrs.src || '';
  const alt = attrs.alt || '';
  const caption = attrs.caption || alt;

  let inner = `
    <img
      src="${escAttr(src)}"
      alt="${escAttr(alt)}"
      loading="lazy"
      decoding="async"
      data-lightbox="true"
      class="media-image__img"
    />`;

  if (caption) {
    inner += `<figcaption class="media-caption">${caption}</figcaption>`;
  }

  const data = node.data || (node.data = {});
  data.hName = 'figure';
  data.hProperties = { class: 'media-image' };
  node.children = [{ type: 'html', value: inner }];
}

function handleAudio(node: any, attrs: Record<string, string>) {
  const src = attrs.src || '';
  const url = attrs.url || '';
  const caption = attrs.caption || '';
  const target = url || src;

  let inner = `
    <div class="audio-player" data-audio-src="${escAttr(target)}">
      <button class="audio-player__btn" type="button" aria-label="Play">
        <svg class="audio-player__icon audio-player__icon--play" viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><polygon points="6,3 20,12 6,21"></polygon></svg>
        <svg class="audio-player__icon audio-player__icon--pause" viewBox="0 0 24 24" fill="currentColor" width="20" height="20" style="display:none"><rect x="5" y="3" width="4" height="18"></rect><rect x="15" y="3" width="4" height="18"></rect></svg>
      </button>
      <div class="audio-player__track">
        <div class="audio-player__progress">
          <div class="audio-player__progress-bar"></div>
        </div>
      </div>
      <span class="audio-player__time">0:00 / 0:00</span>
      <audio preload="metadata" src="${escAttr(target)}"></audio>
    </div>`;

  if (caption) {
    inner += `<p class="media-caption">${caption}</p>`;
  }

  const data = node.data || (node.data = {});
  data.hName = 'figure';
  data.hProperties = { class: 'media-audio' };
  node.children = [{ type: 'html', value: inner }];
}

function handleGallery(node: any, attrs: Record<string, string>) {
  const images = (attrs.images || '').split(',').map(s => s.trim()).filter(Boolean);
  const captions = (attrs.captions || '').split(',').map(s => s.trim());

  const items = images.map((src, i) => {
    const cap = captions[i] || '';
    return `
      <figure class="media-gallery__item">
        <img
          src="${escAttr(src)}"
          alt="${escAttr(cap || `Gallery image ${i + 1}`)}"
          loading="lazy"
          decoding="async"
          data-lightbox="true"
          data-lightbox-group="gallery"
          class="media-gallery__img"
        />
        ${cap ? `<figcaption class="media-caption">${cap}</figcaption>` : ''}
      </figure>`;
  }).join('\n');

  const data = node.data || (node.data = {});
  data.hName = 'div';
  data.hProperties = { class: 'media-gallery' };
  node.children = [{ type: 'html', value: items }];
}

export default remarkMediaDirectives;
