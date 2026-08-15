/**
 * Colecciones reutilizables de specs E2E.
 * Usa '@<grupo>' para hacer referencia a otro grupo y evitar duplicar rutas.
 */
export const e2eGroups = {
  'flows:cookies': ['tests/e2e/specs/flows/cookies.flow.spec.ts'],
  'flows:faq': ['tests/e2e/specs/flows/faq.flow.spec.ts'],
  'flows:bandos': ['tests/e2e/specs/flows/bandos.flow.spec.ts'],
  'flows:navigation': ['tests/e2e/specs/flows/navigation.flow.spec.ts'],
  'flows:search': ['tests/e2e/specs/flows/search.flow.spec.ts'],
  'flows:all': [
    '@flows:cookies',
    '@flows:faq',
    '@flows:bandos',
    '@flows:navigation',
    '@flows:search',
  ],
};
