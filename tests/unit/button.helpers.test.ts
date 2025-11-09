import {
  buildButtonClassList,
  resolveElementTag,
  resolveRelAttribute,
} from '../../src/components/ui/button.helpers';
import { describe, expect, it, vi } from 'vitest';

describe('buildButtonClassList', () => {
  it('returns default classes when no options provided', () => {
    expect(buildButtonClassList()).toBe(
      'c-button c-button--primary c-button--md'
    );
  });

  it('appends modifiers and full width flag', () => {
    const result = buildButtonClassList({
      variant: 'secondary',
      size: 'lg',
      fullWidth: true,
    });

    expect(result).toBe(
      'c-button c-button--secondary c-button--lg c-button--full'
    );
  });

  it('deduplicates class names and trims custom classes', () => {
    const result = buildButtonClassList({
      className: '  extra  c-button  ',
    });

    expect(result).toBe('c-button c-button--primary c-button--md extra');
  });

  it('skips falsy tokens when downstream consumers add them', () => {
    const mockTokens = ['extra', undefined] as unknown as string[];
    Object.defineProperty(mockTokens, 'filter', {
      configurable: true,
      value: function () {
        return this as unknown as string[];
      },
    });

    const splitSpy = vi
      .spyOn(String.prototype, 'split')
      .mockReturnValue(mockTokens);

    const result = buildButtonClassList({
      className: 'ignored',
    });

    expect(result).toBe('c-button c-button--primary c-button--md extra');

    splitSpy.mockRestore();
  });
});

describe('resolveElementTag', () => {
  it('returns anchor tag when href is provided', () => {
    expect(resolveElementTag('/contacto')).toBe('a');
  });

  it('returns button tag when href is falsy', () => {
    expect(resolveElementTag(undefined)).toBe('button');
    expect(resolveElementTag('')).toBe('button');
  });
});

describe('resolveRelAttribute', () => {
  it('returns provided rel when supplied', () => {
    expect(resolveRelAttribute('_blank', 'noopener')).toBe('noopener');
  });

  it('falls back to noopener when target is _blank', () => {
    expect(resolveRelAttribute('_blank', undefined)).toBe(
      'noopener noreferrer'
    );
  });

  it('is case insensitive for target matching', () => {
    expect(resolveRelAttribute('_BLANK', undefined)).toBe(
      'noopener noreferrer'
    );
  });

  it('returns undefined when rel and target are not provided', () => {
    expect(resolveRelAttribute(undefined, undefined)).toBeUndefined();
  });
});
