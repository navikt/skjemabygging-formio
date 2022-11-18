import { guid } from "nav-frontend-js-utils";
import { DryRunResults, MigrationMap, MigrationOption, MigrationOptions, ParsedInput } from "../../types/migration";

export const createUrlParams = (searchFilters: MigrationOptions, editOptions: MigrationOptions) => {
  let searchFilterParameters = "";
  let editOptionsParameters = "";
  const encodedSearchFilters = JSON.stringify(searchFiltersAsParams(searchFilters));
  if (encodedSearchFilters) {
    searchFilterParameters = `?searchFilters=${encodedSearchFilters}`;
    const encodedEditOption = JSON.stringify(migrationOptionsAsMap(editOptions));
    if (encodedEditOption) {
      editOptionsParameters = `&editOptions=${encodedEditOption}`;
    }
  }
  return `${searchFilterParameters}${editOptionsParameters}`;
};

export const searchFiltersAsParams = (searchFilters: MigrationOptions) => {
  if (Object.keys(searchFilters).length === 0) {
    return {};
  }
  return Object.values(searchFilters).reduce((acc, { key, value, operator }) => {
    if (key !== "") {
      return {
        ...acc,
        [operator ? `${key}__${operator}` : key]: value,
      };
    }
    return acc;
  }, {});
};

export const migrationOptionsAsMap = (migrationOptions: MigrationOptions): Record<string, ParsedInput> => {
  if (Object.keys(migrationOptions).length === 0) {
    return {};
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
    return undefined;
  }
};

export const isJSON = (value: string): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch (_e) {
    return false;
  }
};

const createMigrationOption = (option: MigrationOption = { key: "", value: "" }): MigrationOptions => ({
  [guid()]: option,
});

export const createSearchFilters = (filters: MigrationOption[] = []): MigrationOptions => {
  const searchFilters: MigrationOptions = {};
  if (filters.length > 0) {
    filters.forEach((filter) => {
      Object.assign(searchFilters, createMigrationOption(filter));
    });
  } else {
    Object.assign(searchFilters, createMigrationOption());
  }

  return searchFilters;
};

export const createEditOptions = (options: MigrationMap = {}): MigrationOptions => {
  const editOptions: MigrationOptions = {};
  if (Object.keys(options).length > 0) {
    for (const [key, value] of Object.entries(options)) {
      Object.assign(editOptions, createMigrationOption({ key, value }));
    }
  } else {
    Object.assign(editOptions, createMigrationOption());
  }

  return editOptions;
};
