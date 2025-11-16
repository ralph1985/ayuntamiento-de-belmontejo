(() => {
  const MODAL_ROOT_SELECTOR = '[data-modal-root]';
  const MODAL_ID_ATTRIBUTE = 'data-modal-id';
  const MODAL_CLOSE_SELECTOR = '[data-modal-close]';
  const OPEN_CLASS = 'is-open';
  const BODY_OVERFLOW_DATA_KEY = 'modalPrevOverflow';

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

  const openModalElement = modal => {
    if (!modal) {
      return;
    }

    modal.classList.add(OPEN_CLASS);
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    lockScroll();
  };

  const closeModalElement = modal => {
    if (!modal) {
      return;
    }

    modal.classList.remove(OPEN_CLASS);
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    unlockScroll();
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

  if (!globalThis.ModalUtils) {
    Object.defineProperty(globalThis, 'ModalUtils', {
      configurable: true,
      writable: false,
      value: Object.freeze(api),
    });
  }
})();
