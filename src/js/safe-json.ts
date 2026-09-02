/**
 * Serialize JSON for an inline script element without allowing data to close
 * the element and inject markup or JavaScript.
 */
export function serializeJsonForHtml(value: unknown): string {
  const serialized = JSON.stringify(value) ?? 'null';

  return serialized
    .replaceAll('<', '\\u003C')
    .replaceAll('>', '\\u003E')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
}
