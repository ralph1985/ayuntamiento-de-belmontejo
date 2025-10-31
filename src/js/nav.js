// Astro:page-load wrapper for View Transitions purposes
document.addEventListener('astro:page-load', () => {
  // Make the script controlling the <Hamburger /> mobile menu component available after navigating to a new page.

  const CSbody = document.querySelector('body');
  const CSnavbarMenu = document.querySelector('[data-js="navigation"]');
  // const CSUlWrapper = document.getElementById('cs-ul-wrapper');
  const mobileMenuToggle = document.querySelector(
    '[data-js="mobile-menu-toggle"]'
  );

  function toggleMenu() {
    mobileMenuToggle.classList.toggle('c-active');
    CSnavbarMenu.classList.toggle('c-active');
    CSbody.classList.toggle('c-open');
  }

  // Toggles the hamburger mobile menu
  mobileMenuToggle.addEventListener('click', function () {
    toggleMenu();
    ariaExpanded(mobileMenuToggle);
  });

  // Close mobile menu when clicking on the overlay (outside the menu)
  CSnavbarMenu.addEventListener('click', function (event) {
    // Only close if clicking on the navigation element itself (the overlay area)
    // and not on any child elements (the actual menu content)
    if (
      event.target === CSnavbarMenu &&
      CSnavbarMenu.classList.contains('c-active')
    ) {
      toggleMenu();
      ariaExpanded(mobileMenuToggle);
    }
  });

  // Checks the value of aria expanded on an element and changes it accordingly whether it is expanded or not
  function ariaExpanded(element) {
    const isExpanded = element.getAttribute('aria-expanded');
    element.setAttribute(
      'aria-expanded',
      isExpanded === 'false' ? 'true' : 'false'
    );
  }

  // Add event listeners to each dropdown element for accessibility
  const dropdownElements = document.querySelectorAll('.c-dropdown');
  dropdownElements.forEach(element => {
    // This variable tracks if the Escape key was pressed. This flag will be checked in the focusout event handler to ensure that pressing the Escape key does not trigger the focusout event and subsequently remove the c-active class from the dropdown
    let escapePressed = false;

    element.addEventListener('focusout', function (event) {
      if (escapePressed) {
        escapePressed = false;
        return; // Skip the focusout logic if escape was pressed
      }
      // If the focus has moved outside the dropdown, remove the active class from the dropdown
      if (!element.contains(event.relatedTarget)) {
        element.classList.remove('c-active');
        // adjust aria-expanded attribute on the dropdown button only
        const dropdownButton = element.querySelector('.c-dropdown-button');
        if (dropdownButton) {
          ariaExpanded(dropdownButton);
        }
      }
    });

    element.addEventListener('keydown', function (event) {
      const dropdownButton = element.querySelector('.c-dropdown-button');
      // If the dropdown is active, stop the event from propagating. This is so we can use Escape to close the dropdown, then press it again to close the hamburger menu (if needed)
      if (element.classList.contains('c-active')) {
        event.stopPropagation();
      }

      // Pressing Enter or Space will toggle the dropdown and adjust the aria-expanded attribute
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();

        element.classList.toggle('c-active');
        // adjust aria-expanded attribute on the dropdown button only
        if (dropdownButton) {
          ariaExpanded(dropdownButton);
        }
      }

      // Pressing Escape will remove the active class from the dropdown. The stopPropagation above will stop the hamburger menu from closing
      if (event.key === 'Escape') {
        escapePressed = true;
        element.classList.remove('c-active');
        // adjust aria-expanded attribute on the dropdown button only
        if (dropdownButton) {
          ariaExpanded(dropdownButton);
        }
      }
    });

    // Handles dropdown menus on mobile - the matching media query (max-width: 63.9375rem) is necessary so that clicking the dropdown button on desktop does not add the active class and thus interfere with the hover state

    const maxWidthMediaQuery = window.matchMedia('(max-width: 63.9375rem)');
    if (maxWidthMediaQuery.matches) {
      element.addEventListener('click', () => {
        element.classList.toggle('c-active');
        const dropdownButton = element.querySelector('.c-dropdown-button');
        if (dropdownButton) {
          ariaExpanded(dropdownButton);
        }
      });

      // If you press Escape and the hamburger menu is open, close it
      document.addEventListener('keydown', event => {
        if (
          event.key === 'Escape' &&
          mobileMenuToggle.classList.contains('c-active')
        ) {
          toggleMenu();
        }
      });
    }
  });

  // Pressing Enter will redirect to the href
  const dropdownLinks = document.querySelectorAll(
    '.c-drop-li > .c-list__item-link'
  );
  dropdownLinks.forEach(link => {
    link.addEventListener('keydown', function (event) {
      if (event.key === 'Enter') {
        window.location.href = this.href;
      }
    });
  });
});
