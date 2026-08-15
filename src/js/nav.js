const MOBILE_BREAKPOINT = '(max-width: 74.6875rem)';

const setAriaExpanded = (element, expanded) => {
  element?.setAttribute('aria-expanded', String(expanded));
};

const initializeNavigation = () => {
  const body = document.body;
  const header = document.getElementById('cs-navigation');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

  if (!body || !header || !mobileMenuToggle || header.dataset.initialized) {
    return;
  }

  header.dataset.initialized = 'true';
  const mobileMediaQuery = globalThis.matchMedia(MOBILE_BREAKPOINT);
  let lastScrollY = globalThis.scrollY;
  let lastVisibleScrollY = globalThis.scrollY;

  const closeDropdown = dropdown => {
    dropdown.classList.remove('cs-active');
    setAriaExpanded(dropdown.querySelector('.cs-dropdown-button'), false);
  };

  const closeMenu = () => {
    header.classList.remove('cs-active');
    mobileMenuToggle.classList.remove('cs-active');
    body.classList.remove('cs-open');
    setAriaExpanded(mobileMenuToggle, false);
    mobileMenuToggle.setAttribute('aria-label', 'Abrir menú de navegación');
    header.querySelectorAll('.cs-dropdown.cs-active').forEach(closeDropdown);
  };

  const openMenu = () => {
    header.classList.add('cs-active');
    mobileMenuToggle.classList.add('cs-active');
    body.classList.add('cs-open');
    setAriaExpanded(mobileMenuToggle, true);
    mobileMenuToggle.setAttribute('aria-label', 'Cerrar menú de navegación');
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

  mobileMenuToggle.addEventListener('click', () => {
    header.classList.contains('cs-active') ? closeMenu() : openMenu();
  });

  header.addEventListener('click', event => {
    if (event.target === header && header.classList.contains('cs-active')) {
      closeMenu();
    }

    if (event.target.closest('.cs-li-link:not(.cs-dropdown-button)')) {
      closeMenu();
    }
  });

  header.querySelectorAll('.cs-dropdown').forEach(dropdown => {
    const dropdownButton = dropdown.querySelector('.cs-dropdown-button');

    dropdownButton?.addEventListener('click', event => {
      event.stopPropagation();
      const isActive = dropdown.classList.toggle('cs-active');
      setAriaExpanded(dropdownButton, isActive);
    });

    dropdown.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        closeDropdown(dropdown);
        dropdownButton?.focus();
      }
    });

    dropdown.addEventListener('focusout', event => {
      if (!dropdown.contains(event.relatedTarget)) {
        closeDropdown(dropdown);
      }
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      if (header.classList.contains('cs-active')) {
        closeMenu();
      } else {
        header
          .querySelectorAll('.cs-dropdown.cs-active')
          .forEach(closeDropdown);
      }
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
