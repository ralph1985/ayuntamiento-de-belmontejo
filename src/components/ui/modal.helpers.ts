export const MODAL_BASE_CLASS = 'c-modal';
export const MODAL_DIALOG_BASE_CLASS = 'c-modal__dialog';
export const MODAL_OVERLAY_BASE_CLASS = 'c-modal__overlay';
export const MODAL_CLOSE_BASE_CLASS = 'c-modal__close';
export const MODAL_OPEN_CLASS = 'is-open';

export interface ModalClassOptions {
  className?: string;
  isOpen?: boolean;
}

export interface ModalElementClassOptions {
  className?: string;
}

function normalizeClassName(className?: string) {
  if (!className) {
    return '';
  }

  return className
    .split(' ')
    .map(token => token.trim())
    .filter(Boolean)
    .join(' ');
}

export function buildModalClassList(options: ModalClassOptions = {}) {
  const classes = [MODAL_BASE_CLASS];

  if (options.isOpen) {
    classes.push(MODAL_OPEN_CLASS);
  }

  const normalized = normalizeClassName(options.className);
  if (normalized) {
    classes.push(normalized);
  }

  return classes.join(' ');
}

export function buildModalDialogClassList(
  options: ModalElementClassOptions = {}
) {
  const classes = [MODAL_DIALOG_BASE_CLASS];

  const normalized = normalizeClassName(options.className);
  if (normalized) {
    classes.push(normalized);
  }

  return classes.join(' ');
}

export function buildModalCloseButtonClassList(
  options: ModalElementClassOptions = {}
) {
  const classes = [MODAL_CLOSE_BASE_CLASS];

  const normalized = normalizeClassName(options.className);
  if (normalized) {
    classes.push(normalized);
  }

  return classes.join(' ');
}
