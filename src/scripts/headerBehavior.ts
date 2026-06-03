// headerBehavior.ts

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.masthead') as HTMLElement;
  if (!header) return;

  let lastScrollY = window.scrollY;
  let isHidden = false;
  let inactivityTimer: number;

  const showHeader = () => {
    if (isHidden) {
      header.classList.remove('is-hidden');
      isHidden = false;
    }
  };

  const hideHeader = () => {
    if (!isHidden && window.scrollY > 80) {
      header.classList.add('is-hidden');
      isHidden = true;
    }
  };

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    if (window.scrollY > 80) {
      inactivityTimer = window.setTimeout(() => {
        hideHeader();
      }, 3000);
    }
  };

  const handleScroll = () => {
    const currentScrollY = Math.max(0, window.scrollY);
    const scrollDelta = currentScrollY - lastScrollY;

    // Background blur when scrolled
    if (currentScrollY > 10) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }

    if (currentScrollY <= 10) {
      // Top of page -> always show
      showHeader();
      clearTimeout(inactivityTimer);
    } else if (scrollDelta > 5 && currentScrollY > 80) {
      // Scrolling down past threshold -> hide
      hideHeader();
      clearTimeout(inactivityTimer);
    }

    lastScrollY = currentScrollY;
  };

  window.addEventListener('scroll', handleScroll, { passive: true });

  header.addEventListener('mouseenter', () => {
    showHeader();
    clearTimeout(inactivityTimer);
  });

  header.addEventListener('mouseleave', () => {
    if (window.scrollY > 80) {
      resetInactivityTimer();
    }
  });

  // Initial check
  if (window.scrollY > 10) {
    header.classList.add('is-scrolled');
  }
  resetInactivityTimer();
});
