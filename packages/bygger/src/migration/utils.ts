import { DryRunResults, MigrationOptions } from "../../types/migration";

export const createUrlParams = (searchFilters: MigrationOptions, editOptions: MigrationOptions) => {
  let searchFilterParameters = "";
  let editOptionsParameters = "";
  const encodedSearchFilters = JSON.stringify(migrationOptionsAsMap(searchFilters));
  if (encodedSearchFilters) {
    searchFilterParameters = `?searchFilters=${encodedSearchFilters}`;
    const encodedEditOption = JSON.stringify(migrationOptionsAsMap(editOptions));
    if (encodedEditOption) {
      editOptionsParameters = `&editOptions=${encodedEditOption}`;
    }
  }
  return `${searchFilterParameters}${editOptionsParameters}`;
};

export const migrationOptionsAsMap = (migrationOptions: MigrationOptions) => {
  if (Object.keys(migrationOptions).length === 0) {
    return "";
  }
  return Object.values(migrationOptions).reduce((acc, curr) => {
    if (curr.key !== "") {
      return {
        ...acc,
        [curr.key]: curr.value,
      };
    }
    return acc;
  }, {});
};

export const getMigrationResultsMatchingSearchFilters = (dryRunResults: DryRunResults) =>
  dryRunResults
    ? Object.values(dryRunResults)
        .filter((results) => results.found > 0)
        .sort((a, b) => b.found - a.found)
    : [];

export const getUrlParamMap = (params, name) => {
  const param = params.get(name);
  if (param) {
    return JSON.parse(param);
  } else {
    return {};
  }
};
