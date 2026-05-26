/**
 * Custom audio player controller.
 * Initializes all .audio-player elements with play/pause, seek, and time display.
 */
(function initAudioPlayers() {
  function formatTime(sec: number): string {
    if (!isFinite(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function setup(container: HTMLElement) {
    const audio = container.querySelector('audio') as HTMLAudioElement | null;
    if (!audio) return;

    const btn = container.querySelector('.audio-player__btn') as HTMLButtonElement;
    const playIcon = container.querySelector('.audio-player__icon--play') as SVGElement;
    const pauseIcon = container.querySelector('.audio-player__icon--pause') as SVGElement;
    const progressBar = container.querySelector('.audio-player__progress-bar') as HTMLElement;
    const track = container.querySelector('.audio-player__track') as HTMLElement;
    const timeEl = container.querySelector('.audio-player__time') as HTMLElement;

    let isPlaying = false;

    function updateTime() {
      const cur = formatTime(audio!.currentTime);
      const dur = formatTime(audio!.duration);
      timeEl.textContent = `${cur} / ${dur}`;
      const pct = audio!.duration ? (audio!.currentTime / audio!.duration) * 100 : 0;
      progressBar.style.width = `${pct}%`;
    }

    btn.addEventListener('click', () => {
      if (isPlaying) {
        audio!.pause();
      } else {
        audio!.play();
      }
    });

    audio.addEventListener('play', () => {
      isPlaying = true;
      playIcon.style.display = 'none';
      pauseIcon.style.display = '';
    });

    audio.addEventListener('pause', () => {
      isPlaying = false;
      playIcon.style.display = '';
      pauseIcon.style.display = 'none';
    });

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateTime);

    audio.addEventListener('ended', () => {
      isPlaying = false;
      playIcon.style.display = '';
      pauseIcon.style.display = 'none';
      progressBar.style.width = '0%';
    });

    // Seek on track click
    track.addEventListener('click', (e: MouseEvent) => {
      const rect = track.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      if (audio!.duration) {
        audio!.currentTime = pct * audio!.duration;
      }
    });
  }

  function bind() {
    document.querySelectorAll<HTMLElement>('.audio-player').forEach(setup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bind);
  } else {
    bind();
  }
  document.addEventListener('astro:page-load', bind);
})();
