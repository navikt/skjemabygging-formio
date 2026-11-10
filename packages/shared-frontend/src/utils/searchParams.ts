type SearchParamUpdates = Record<string, string | undefined>;

const updateSearch = (search: string, updates: SearchParamUpdates): string => {
  const searchParams = new URLSearchParams(search);

  Object.entries(updates).forEach(([key, value]) => {
    if (value === undefined) {
      searchParams.delete(key);
      return;
    }

    searchParams.set(key, value);
  });

  const nextSearch = searchParams.toString();
  return nextSearch ? `?${nextSearch}` : '';
};

export { updateSearch };
export type { SearchParamUpdates };
