export const normalizeSearch = (value: string) =>
  value
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const getSearchTerms = (query: string) =>
  normalizeSearch(query).split(' ').filter(Boolean);

export const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const matchesSearchQuery = (text: string, query: string) => {
  const normalizedText = normalizeSearch(text);
  return getSearchTerms(query).every(term => normalizedText.includes(term));
};
