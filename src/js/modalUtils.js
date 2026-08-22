(() => {
  const MODAL_ROOT_SELECTOR = '[data-modal-root]';
  const MODAL_ID_ATTRIBUTE = 'data-modal-id';
  const MODAL_CLOSE_SELECTOR = '[data-modal-close]';
  const OPEN_CLASS = 'is-open';
  const BODY_OVERFLOW_DATA_KEY = 'modalPrevOverflow';
  const FOCUSABLE_SELECTOR = [
    'a[href]',
    'area[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');
  const modalState = new WeakMap();

  const getBody = () => document.body;

  const anyModalOpen = () =>
    document.querySelector(`${MODAL_ROOT_SELECTOR}.${OPEN_CLASS}`);

  const lockScroll = () => {
    const body = getBody();
    if (!body.dataset[BODY_OVERFLOW_DATA_KEY]) {
      body.dataset[BODY_OVERFLOW_DATA_KEY] = body.style.overflow || '';
    }
    body.style.overflow = 'hidden';
  };

  const unlockScroll = () => {
    if (anyModalOpen()) {
      return;
    }

    const body = getBody();
    body.style.overflow = body.dataset[BODY_OVERFLOW_DATA_KEY] ?? '';
    delete body.dataset[BODY_OVERFLOW_DATA_KEY];
  };

  const getFocusableElements = modal =>
    Array.from(modal.querySelectorAll(FOCUSABLE_SELECTOR)).filter(element => {
      const styles = globalThis.getComputedStyle?.(element);
      return !element.hidden && styles?.visibility !== 'hidden';
    });

  const focusModal = modal => {
    const dialog = modal.querySelector('[data-modal-dialog]');
    const focusable = getFocusableElements(dialog ?? modal);
    (focusable[0] ?? dialog ?? modal).focus?.();
  };

  const handleFocusTrap = event => {
    const modal = event.target.closest?.(
      `${MODAL_ROOT_SELECTOR}.${OPEN_CLASS}`
    );
    if (!modal || event.key !== 'Tab') {
      return;
    }

    const focusable = getFocusableElements(
      modal.querySelector('[data-modal-dialog]') ?? modal
    );
    if (!focusable.length) {
      event.preventDefault();
      modal.querySelector('[data-modal-dialog]')?.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const openModalElement = modal => {
    if (!modal) {
      return;
    }

    modal.classList.add(OPEN_CLASS);
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    if (!modalState.has(modal)) {
      const activeElement = document.activeElement;
      modalState.set(modal, {
        opener:
          activeElement && typeof activeElement.focus === 'function'
            ? activeElement
            : null,
      });
    }
    lockScroll();
    (globalThis.requestAnimationFrame ?? globalThis.setTimeout)(
      () => focusModal(modal),
      0
    );
  };

  const closeModalElement = modal => {
    if (!modal) {
      return;
    }

    modal.classList.remove(OPEN_CLASS);
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    unlockScroll();
    const state = modalState.get(modal);
    modalState.delete(modal);
    if (state?.opener?.isConnected) {
      state.opener.focus();
    }
  };

  const getModalElement = id =>
    document.querySelector(
      `${MODAL_ROOT_SELECTOR}[${MODAL_ID_ATTRIBUTE}="${id}"]`
    );

  const openModalById = id => {
    const modal = getModalElement(id);
    if (modal) {
      openModalElement(modal);
    }
    return modal;
  };

  const closeModalById = id => {
    const modal = getModalElement(id);
    if (modal) {
      closeModalElement(modal);
    }
    return modal;
  };

  const isModalOpen = modal => modal?.classList.contains(OPEN_CLASS) ?? false;

  const getOpenModals = () =>
    Array.from(
      document.querySelectorAll(`${MODAL_ROOT_SELECTOR}.${OPEN_CLASS}`)
    );

  const api = {
    open: openModalElement,
    close: closeModalElement,
    openById: openModalById,
    closeById: closeModalById,
    getById: getModalElement,
    isOpen: isModalOpen,
    getOpenModals,
    lockScroll,
    unlockScroll,
    SELECTORS: {
      root: MODAL_ROOT_SELECTOR,
      close: MODAL_CLOSE_SELECTOR,
    },
  };

  document.addEventListener('keydown', event => {
    if (event.key === 'Tab') {
      handleFocusTrap(event);
      return;
    }

    if (event.key === 'Escape') {
      const openModal = getOpenModals()[0];
      if (openModal) {
        closeModalElement(openModal);
      }
    }
  });

  if (!globalThis.ModalUtils) {
    Object.defineProperty(globalThis, 'ModalUtils', {
      configurable: true,
      writable: false,
      value: Object.freeze(api),
    });
  }
})();
