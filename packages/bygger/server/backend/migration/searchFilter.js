function getPropertyFromComponent(comp, properties) {
  if (properties.length > 1) {
    return getPropertyFromComponent(comp[properties[0]], properties.slice(1));
  }
  return comp && comp[properties[0]];
}

function componentMatchesSearchFilters(component, searchFilters) {
  return Object.keys(searchFilters).every(
    (property) => getPropertyFromComponent(component, property.split(".")) === searchFilters[property]
  );
}

export { getPropertyFromComponent, componentMatchesSearchFilters };
