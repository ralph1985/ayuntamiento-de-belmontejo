import { formatDate, getCurrentYear } from '../../src/js/utils.js';
import { describe, expect, it } from 'vitest';

describe('date utilities', () => {
  it('formats dates deterministically in UTC', () => {
    expect(formatDate('2026-09-15T00:30:00.000Z')).toBe('Sep 15, 2026');
    expect(formatDate('2026-09-15T23:30:00.000Z')).toBe('Sep 15, 2026');
  });

  it('returns the current calendar year', () => {
    expect(getCurrentYear()).toBe(new Date().getFullYear());
  });
});
