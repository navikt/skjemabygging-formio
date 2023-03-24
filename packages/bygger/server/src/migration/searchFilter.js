import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";

function getPropertyFromComponent(comp, properties) {
  if (properties.length > 1) {
    return getPropertyFromComponent(comp[properties[0]], properties.slice(1));
  }
  return comp && comp[properties[0]];
}

function componentMatchesFilters(component, filters) {
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

function componentHasDependencyMatchingFilters(form, dependentComponent, dependencyFilters) {
  if (Object.keys(dependencyFilters).length > 0) {
    const dependees = navFormUtils.findDependeeComponents(dependentComponent, form);
    return dependees.some(({ component }) => componentMatchesFilters(component, dependencyFilters));
  }
  return true;
}

export { getPropertyFromComponent, componentMatchesFilters, componentHasDependencyMatchingFilters };
