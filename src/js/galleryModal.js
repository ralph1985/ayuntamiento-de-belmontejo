const SELECTORS = {
  gallery: '.c-image-gallery',
  modal: '[data-gallery-modal]',
  trigger: '[data-modal-trigger]',
  close: '[data-modal-close]',
  modalImage: '[data-modal-image]',
  modalCaption: '[data-modal-caption]',
};

const lockScroll = () => {
  const { body } = document;
  if (!body.dataset.modalPrevOverflow) {
    body.dataset.modalPrevOverflow = body.style.overflow || '';
  }
  body.style.overflow = 'hidden';
};

const unlockScroll = () => {
  const anyOpen = document.querySelector(`${SELECTORS.modal}.is-open`);
  if (anyOpen) return;
  const { body } = document;
  body.style.overflow = body.dataset.modalPrevOverflow ?? '';
  delete body.dataset.modalPrevOverflow;
};

const updateModalContent = (modal, src, alt) => {
  const modalImage = modal.querySelector(SELECTORS.modalImage);
  const modalCaption = modal.querySelector(SELECTORS.modalCaption);

  if (modalImage) {
    modalImage.src = src;
    modalImage.alt = alt;
  }

  if (modalCaption) {
    modalCaption.textContent = alt;
  }
};

const clearModalContent = modal => {
  const modalImage = modal.querySelector(SELECTORS.modalImage);
  const modalCaption = modal.querySelector(SELECTORS.modalCaption);

  if (modalImage) {
    modalImage.removeAttribute('src');
    modalImage.removeAttribute('alt');
  }

  if (modalCaption) {
    modalCaption.textContent = '';
  }
};

const openModal = (modal, src, alt) => {
  updateModalContent(modal, src, alt);
  modal.classList.add('is-open');
  modal.removeAttribute('hidden');
  modal.setAttribute('aria-hidden', 'false');
  lockScroll();
};

const closeModal = modal => {
  modal.classList.remove('is-open');
  modal.setAttribute('hidden', '');
  modal.setAttribute('aria-hidden', 'true');
  clearModalContent(modal);
  unlockScroll();
};

const bindModal = gallery => {
  if (gallery.dataset.modalReady === 'true') return;
  const modal = gallery.querySelector(SELECTORS.modal);
  if (!modal) return;

  const triggers = gallery.querySelectorAll(SELECTORS.trigger);
  triggers.forEach(trigger => {
    const openFromTrigger = () => {
      const src = trigger.getAttribute('data-image-src');
      if (!src) return;
      const alt = trigger.getAttribute('data-image-alt') ?? '';
      openModal(modal, src, alt);
    };

    trigger.addEventListener('click', event => {
      event.preventDefault();
      openFromTrigger();
    });

    trigger.addEventListener('keydown', event => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      openFromTrigger();
    });
  });

  const closeTargets = modal.querySelectorAll(SELECTORS.close);
  closeTargets.forEach(closeEl => {
    closeEl.addEventListener('click', () => closeModal(modal));
  });

  modal.addEventListener('click', event => {
    if (event.target === modal) {
      closeModal(modal);
    }
  });

  gallery.dataset.modalReady = 'true';
};

let escapeListenerBound = false;
const handleKeyDown = event => {
  if (event.key !== 'Escape') return;
  const openModalEl = document.querySelector(`${SELECTORS.modal}.is-open`);
  if (openModalEl) {
    closeModal(openModalEl);
  }
};

const ensureEscapeListener = () => {
  if (escapeListenerBound) return;
  document.addEventListener('keydown', handleKeyDown);
  escapeListenerBound = true;
};

const initGalleryModal = () => {
  const galleries = document.querySelectorAll(SELECTORS.gallery);
  if (!galleries.length) return;
  galleries.forEach(bindModal);
  ensureEscapeListener();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initGalleryModal);
} else {
  initGalleryModal();
}

document.addEventListener('astro:page-load', initGalleryModal);
