import {
  Component,
  migrationUtils,
  NavFormType,
  navFormUtils,
  Operator,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ParsedInput } from '../types/migration';

export interface Filter {
  key: string;
  value: ParsedInput;
  operator?: Operator;
}

function parseFiltersFromParam(filtersFromParam: object): Filter[] {
  return Object.entries(filtersFromParam).map(([key, value]) => {
    const [prop, operator] = migrationUtils.getPropAndOperatorFromKey(key);
    return { key: prop, value, operator };
  });
}

function getPropertyFromTarget(comp: any, properties: string[]): string | undefined {
  if (properties.length > 1 && comp[properties[0]]) {
    return getPropertyFromTarget(comp[properties[0]], properties.slice(1));
  }
  return comp && comp[properties[0]];
}

function targetMatchesFilters(target: Component | NavFormType, filters: Filter[]) {
  return filters.every(({ key, value, operator }) => {
    switch (operator) {
      case 'exists':
        return !!getPropertyFromTarget(target, key.split('.'));
      case 'n_exists':
        return !getPropertyFromTarget(target, key.split('.'));
      case 'contains':
        return getPropertyFromTarget(target, key.split('.'))?.includes(value);
      case 'n_contains':
        return !getPropertyFromTarget(target, key.split('.'))?.includes(value);
      case 'n_eq':
        return getPropertyFromTarget(target, key.split('.')) !== value;
      case 'eq':
      default:
        return getPropertyFromTarget(target, key.split('.')) === value;
    }
  });
}

function componentHasDependencyMatchingFilters(
  form: NavFormType,
  dependentComponent: Component,
  dependencyFilters: Filter[],
) {
  if (Object.keys(dependencyFilters).length > 0) {
    const dependees = navFormUtils.findDependeeComponents(dependentComponent, form);
    return dependees.some(({ component }) => targetMatchesFilters(component, dependencyFilters));
  }
  return true;
}

export { componentHasDependencyMatchingFilters, getPropertyFromTarget, parseFiltersFromParam, targetMatchesFilters };
