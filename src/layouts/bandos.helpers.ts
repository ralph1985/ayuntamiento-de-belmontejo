export type BandoFilterItem = {
  title: string;
  description: string;
  category: string;
};

export const normalizeBandoSearch = (value: string) =>
  value
    .toLocaleLowerCase('es')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export const getBandoCategories = (categories: Array<string | undefined>) =>
  [...new Set(categories.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es')
  );

export const matchesBandoFilters = (
  item: BandoFilterItem,
  query: string,
  category: string
) => {
  const haystack = normalizeBandoSearch(
    `${item.title} ${item.description} ${item.category}`
  );
  const normalizedQuery = normalizeBandoSearch(query.trim());

  return (
    haystack.includes(normalizedQuery) &&
    (!category || item.category === category)
  );
};
