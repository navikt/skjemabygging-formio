import {
  Component,
  migrationUtils,
  NavFormType,
  navFormUtils,
  Operator,
} from "@navikt/skjemadigitalisering-shared-domain";
import { ParsedInput } from "../types/migration";

interface Filter {
  key: string;
  value: ParsedInput;
  operator?: Operator;
}

function parseFiltersFromParam(filtersFromParam: string): Filter[] {
  return Object.entries(filtersFromParam).map(([key, value]) => {
    const [prop, operator] = migrationUtils.getPropAndOperatorFromKey(key);
    return { key: prop, value, operator };
  });
}

function getPropertyFromComponent(comp: any, properties: string[]): string | undefined {
  if (properties.length > 1) {
    return getPropertyFromComponent(comp[properties[0]], properties.slice(1));
  }
  return comp && comp[properties[0]];
}

function componentMatchesFilters(component: Component, filters: Filter[]) {
  return filters.every(({ key, value, operator }) => {
    switch (operator) {
      case "exists":
        return !!getPropertyFromComponent(component, key.split("."));
      case "n_exists":
        return !getPropertyFromComponent(component, key.split("."));
      case "contains":
        return getPropertyFromComponent(component, key.split("."))?.includes(value);
      case "n_contains":
        return !getPropertyFromComponent(component, key.split("."))?.includes(value);
      case "n_eq":
        return getPropertyFromComponent(component, key.split(".")) !== value;
      case "eq":
      default:
        return getPropertyFromComponent(component, key.split(".")) === value;
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
    return dependees.some(({ component }) => componentMatchesFilters(component, dependencyFilters));
  }
  return true;
}

export {
  parseFiltersFromParam,
  getPropertyFromComponent,
  componentMatchesFilters,
  componentHasDependencyMatchingFilters,
};
