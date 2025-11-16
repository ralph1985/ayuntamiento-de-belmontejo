import {
  MODAL_BASE_CLASS,
  MODAL_CLOSE_BASE_CLASS,
  MODAL_DIALOG_BASE_CLASS,
  MODAL_OPEN_CLASS,
  buildModalClassList,
  buildModalCloseButtonClassList,
  buildModalDialogClassList,
} from '../../src/components/ui/modal.helpers';
import { describe, expect, it } from 'vitest';

describe('buildModalClassList', () => {
  it('returns base class when no options provided', () => {
    expect(buildModalClassList()).toBe(MODAL_BASE_CLASS);
  });

  it('appends open class when requested', () => {
    expect(buildModalClassList({ isOpen: true })).toBe(
      `${MODAL_BASE_CLASS} ${MODAL_OPEN_CLASS}`
    );
  });

  it('normalizes additional class tokens', () => {
    expect(buildModalClassList({ className: ' extra  custom ' })).toBe(
      `${MODAL_BASE_CLASS} extra custom`
    );
  });
});

describe('buildModalDialogClassList', () => {
  it('returns base dialog class by default', () => {
    expect(buildModalDialogClassList()).toBe(MODAL_DIALOG_BASE_CLASS);
  });

  it('appends normalized custom classes', () => {
    expect(buildModalDialogClassList({ className: ' primary  surface ' })).toBe(
      `${MODAL_DIALOG_BASE_CLASS} primary surface`
    );
  });
});

describe('buildModalCloseButtonClassList', () => {
  it('returns base close button class by default', () => {
    expect(buildModalCloseButtonClassList()).toBe(MODAL_CLOSE_BASE_CLASS);
  });

  it('concatenates additional tokens', () => {
    expect(
      buildModalCloseButtonClassList({ className: ' danger  rounded ' })
    ).toBe(`${MODAL_CLOSE_BASE_CLASS} danger rounded`);
  });
});
