function getPropertyFromComponent(comp, properties) {
  if (properties.length > 1) {
    return getPropertyFromComponent(comp[properties[0]], properties.slice(1));
  }
  return comp && comp[properties[0]];
}

function componentMatchesSearchFilters(component, searchFilters) {
  return searchFilters.every(({ key, value, operator }) => {
    switch (operator) {
      case "n_eq":
        return getPropertyFromComponent(component, key.split(".")) !== value;
      case "eq":
      default:
        return getPropertyFromComponent(component, key.split(".")) === value;
    }
  });
}

export { getPropertyFromComponent, componentMatchesSearchFilters };
