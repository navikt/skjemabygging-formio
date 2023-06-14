import { guid, migrationUtils, Operator } from "@navikt/skjemadigitalisering-shared-domain";
import { DryRunResults, MigrationMap, MigrationOption, MigrationOptions, ParsedInput } from "../../types/migration";

const assembleUrlParams = (params: string[]) => {
  const filteredParams = params.filter((param) => param);
  if (filteredParams.length === 0) return "";
  const [first, ...rest] = filteredParams;
  return `?${first}${rest.map((param) => (param ? `&${param}` : "")).join("")}`;
};

const isEmpty = (obj) => {
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  return false;
};

export const createUrlParams = (
  searchFilters: MigrationOptions,
  dependencyFilters: MigrationOptions,
  editOptions: MigrationOptions
) => {
  let searchFilterParameters;
  let dependencyFilterParameters;
  let editOptionsParameters;

  const encodedSearchFilters = searchFiltersAsParams(searchFilters);
  searchFilterParameters = isEmpty(encodedSearchFilters)
    ? null
    : `searchFilters=${JSON.stringify(encodedSearchFilters)}`;

  const encodedDependencyFilters = searchFiltersAsParams(dependencyFilters);
  dependencyFilterParameters = isEmpty(encodedDependencyFilters)
    ? null
    : `dependencyFilters=${JSON.stringify(encodedDependencyFilters)}`;

  if (searchFilterParameters || dependencyFilterParameters) {
    const encodedEditOption = migrationOptionsAsMap(editOptions);
    editOptionsParameters = isEmpty(encodedEditOption) ? null : `editOptions=${JSON.stringify(encodedEditOption)}`;
  }

  return assembleUrlParams([searchFilterParameters, dependencyFilterParameters, editOptionsParameters]);
};

export const searchFiltersAsParams = (searchFilters: MigrationOptions): Record<string, ParsedInput> => {
  if (Object.keys(searchFilters).length === 0) {
    return {};
  }
  return Object.values(searchFilters).reduce((acc, { key, value, operator }) => {
    if (key !== "") {
      return {
        ...acc,
        [migrationUtils.combinePropAndOperator(key, operator)]: value,
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

export const sortAndFilterResults = (dryRunResults: DryRunResults) =>
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

export const createSearchFiltersFromParams = (filtersFromParam: Record<string, string> = {}): MigrationOptions => {
  const searchFilters: MigrationOptions = {};
  if (Object.keys(filtersFromParam).length > 0) {
    for (const [key, value] of Object.entries(filtersFromParam)) {
      const [prop, operator] = migrationUtils.getPropAndOperatorFromKey(key);
      Object.assign(
        searchFilters,
        createMigrationOption({
          key: prop,
          value,
          operator: (operator as Operator) || undefined,
        })
      );
    }
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
