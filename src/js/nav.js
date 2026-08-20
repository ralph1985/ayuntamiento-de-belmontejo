const MOBILE_BREAKPOINT = '(max-width: 74.6875rem)';

const setAriaExpanded = (element, expanded) => {
  element?.setAttribute('aria-expanded', String(expanded));
};

const initializeNavigation = () => {
  const body = document.body;
  const header = document.getElementById('cs-navigation');
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('cs-site-menu');

  if (!body || !header || !menuToggle || !menu || header.dataset.initialized) {
    return;
  }

  header.dataset.initialized = 'true';
  const mobileMediaQuery = globalThis.matchMedia(MOBILE_BREAKPOINT);
  let lastScrollY = globalThis.scrollY;
  let lastVisibleScrollY = globalThis.scrollY;

  const closeMenu = ({ restoreFocus = false } = {}) => {
    header.classList.remove('cs-active');
    menuToggle.classList.remove('cs-active');
    body.classList.remove('cs-open');
    setAriaExpanded(menuToggle, false);
    menu.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-label', 'Abrir menú de navegación');

    if (restoreFocus) {
      menuToggle.focus();
    }
  };

  const openMenu = () => {
    header.classList.add('cs-active');
    menuToggle.classList.add('cs-active');
    body.classList.add('cs-open');
    setAriaExpanded(menuToggle, true);
    menu.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-label', 'Cerrar menú de navegación');
  };

  const handleScrollDirection = () => {
    if (!mobileMediaQuery.matches) {
      header.classList.remove('cs-hidden');
      lastScrollY = globalThis.scrollY;
      return;
    }

    if (header.classList.contains('cs-active')) {
      header.classList.remove('cs-hidden');
      lastScrollY = globalThis.scrollY;
      lastVisibleScrollY = globalThis.scrollY;
      return;
    }

    const currentScrollY = globalThis.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;
    const scrollingUp = currentScrollY < lastScrollY;

    if (scrollingDown && currentScrollY - lastVisibleScrollY > 120) {
      header.classList.add('cs-hidden');
    } else if (scrollingUp) {
      header.classList.remove('cs-hidden');
      lastVisibleScrollY = currentScrollY;
    }

    lastScrollY = currentScrollY;
  };

  menuToggle.addEventListener('click', () => {
    header.classList.contains('cs-active')
      ? closeMenu({ restoreFocus: true })
      : openMenu();
  });

  header.addEventListener('click', event => {
    if (event.target === header && header.classList.contains('cs-active')) {
      closeMenu({ restoreFocus: true });
    }

    if (event.target.closest('.cs-menu a')) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('cs-active')) {
      closeMenu({ restoreFocus: true });
    }
  });

  globalThis.addEventListener('scroll', handleScrollDirection, {
    passive: true,
  });

  mobileMediaQuery.addEventListener('change', event => {
    if (!event.matches) {
      closeMenu();
      header.classList.remove('cs-hidden');
    }
  });
};

document.addEventListener('astro:page-load', initializeNavigation);
initializeNavigation();
