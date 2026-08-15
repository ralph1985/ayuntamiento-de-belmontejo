import { describe, expect, it } from 'vitest';
import {
  getBandoCategories,
  matchesBandoFilters,
  normalizeBandoSearch,
} from '../../src/layouts/bandos.helpers';

const bando = {
  title: 'Atención al público',
  description: 'El Ayuntamiento cambia su horario durante agosto.',
  category: 'Info General',
};

describe('normalizeBandoSearch', () => {
  it('normalizes case and accents for Spanish searches', () => {
    expect(normalizeBandoSearch('Atención MÉDICA')).toBe('atencion medica');
  });
});

describe('getBandoCategories', () => {
  it('removes empty duplicates and sorts categories in Spanish', () => {
    expect(
      getBandoCategories(['Avisos', 'Info General', 'Avisos', undefined])
    ).toStrictEqual(['Avisos', 'Info General']);
  });
});

describe('matchesBandoFilters', () => {
  it('matches title and description without requiring a category', () => {
    expect(matchesBandoFilters(bando, 'agosto', '')).toBe(true);
    expect(matchesBandoFilters(bando, 'público', '')).toBe(true);
  });

  it('combines text and category filters', () => {
    expect(matchesBandoFilters(bando, 'horario', 'Info General')).toBe(true);
    expect(matchesBandoFilters(bando, 'horario', 'Avisos')).toBe(false);
  });

  it('returns false when there is no text match', () => {
    expect(matchesBandoFilters(bando, 'farmacia', '')).toBe(false);
  });
});
