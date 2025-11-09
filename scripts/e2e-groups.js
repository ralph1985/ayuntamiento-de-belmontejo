/**
 * Colecciones reutilizables de specs E2E.
 * Usa '@<grupo>' para hacer referencia a otro grupo y evitar duplicar rutas.
 */
export const e2eGroups = {
  'visual:pages:desktop': [
    'tests/e2e/specs/visual/desktop/pages.desktop.visual.spec.ts',
  ],
  'visual:pages:mobile': [
    'tests/e2e/specs/visual/mobile/pages.mobile.visual.spec.ts',
  ],
  'visual:pages': ['@visual:pages:desktop', '@visual:pages:mobile'],
  'visual:search-results:desktop': [
    'tests/e2e/specs/visual/desktop/search-results.desktop.visual.spec.ts',
  ],
  'visual:search-results:mobile': [
    'tests/e2e/specs/visual/mobile/search-results.mobile.visual.spec.ts',
  ],
  'visual:search-results': [
    '@visual:search-results:desktop',
    '@visual:search-results:mobile',
  ],
  'visual:all': ['@visual:pages', '@visual:search-results'],
  'flows:cookies': ['tests/e2e/specs/flows/cookies.flow.spec.ts'],
  'flows:faq': ['tests/e2e/specs/flows/faq.flow.spec.ts'],
  'flows:navigation': ['tests/e2e/specs/flows/navigation.flow.spec.ts'],
  'flows:search': ['tests/e2e/specs/flows/search.flow.spec.ts'],
  'flows:all': [
    '@flows:cookies',
    '@flows:faq',
    '@flows:navigation',
    '@flows:search',
  ],
};
