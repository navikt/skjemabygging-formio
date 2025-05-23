import { Form, guid, MigrationLevel, migrationUtils, Operator } from '@navikt/skjemadigitalisering-shared-domain';
import {
  DryRunResults,
  FormMigrationLogData,
  MigrationMap,
  MigrationOption,
  MigrationOptions,
  ParsedInput,
} from '../../types/migration';
import { FormStatusProperties } from '../Forms/status/types';

const assembleUrlParams = (params: string[]) => {
  const filteredParams = params.filter((param) => param);
  if (filteredParams.length === 0) return '';
  const [first, ...rest] = filteredParams;
  return `?${first}${rest.map((param) => (param ? `&${param}` : '')).join('')}`;
};

const isEmpty = (obj) => {
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  if (Array.isArray(obj)) return obj.length === 0;
  return false;
};

export const createUrlParams = (
  formSearchFilters: MigrationOptions,
  searchFilters: MigrationOptions,
  dependencyFilters: MigrationOptions,
  editOptions: MigrationOptions,
  migrationLevel: MigrationLevel,
) => {
  let editOptionsParameters;

  const encodedFormSearchFilters = searchFiltersAsParams(formSearchFilters);
  const formSearchFilterParameters = isEmpty(encodedFormSearchFilters)
    ? null
    : `formSearchFilters=${JSON.stringify(encodedFormSearchFilters)}`;

  const encodedSearchFilters = searchFiltersAsParams(searchFilters);
  const searchFilterParameters = isEmpty(encodedSearchFilters)
    ? null
    : `searchFilters=${JSON.stringify(encodedSearchFilters)}`;

  const encodedDependencyFilters = searchFiltersAsParams(dependencyFilters);
  const dependencyFilterParameters = isEmpty(encodedDependencyFilters)
    ? null
    : `dependencyFilters=${JSON.stringify(encodedDependencyFilters)}`;

  if (formSearchFilterParameters || searchFilterParameters || dependencyFilterParameters) {
    const encodedEditOption = migrationOptionsAsMap(editOptions);
    editOptionsParameters = isEmpty(encodedEditOption) ? null : `editOptions=${JSON.stringify(encodedEditOption)}`;
  }

  const migrationLevelParameter = `migrationLevel=${migrationLevel}`;

  return assembleUrlParams([
    formSearchFilterParameters,
    searchFilterParameters,
    dependencyFilterParameters,
    editOptionsParameters,
    migrationLevelParameter,
  ]);
};

export const searchFiltersAsParams = (searchFilters: MigrationOptions): Record<string, ParsedInput> => {
  if (Object.keys(searchFilters).length === 0) {
    return {};
  }
  return Object.values(searchFilters).reduce((acc, { key, value, operator }) => {
    if (key !== '') {
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
    if (curr.key !== '') {
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

const createMigrationOption = (option: MigrationOption = { key: '', value: '' }): MigrationOptions => ({
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
        }),
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

export const getMigrationLevelFromParams = (searchParams: URLSearchParams): MigrationLevel => {
  return (searchParams.get('migrationLevel') as MigrationLevel) || 'component';
};

// Ved omskriving av migreringsfunksjonaliteten bør vi ta sikte på å forbedre FormMigrationLogData-typen slik at vi ikke trenger spesialbehandling slik som denne funksjonen
export const toFormStatusProperties = (formElement: FormMigrationLogData | Form): FormStatusProperties => {
  const status = formElement.status as any;
  let isTestForm: boolean | undefined;
  if ('properties' in formElement) {
    const { properties } = formElement as Form;
    isTestForm = properties?.isTestForm;
  } else {
    isTestForm = formElement.isTestForm;
  }
  return {
    status,
    properties: {
      isTestForm,
    },
  };
};
