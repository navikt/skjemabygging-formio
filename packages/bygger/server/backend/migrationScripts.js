function componentMatchesSearchFilters(component, searchFilters) {
  return Object.keys(searchFilters).every((property) => component[property] === searchFilters[property]);
}

function recursivelyMigrateComponentAndSubcomponents(component, searchFilters, script) {
  let modifiedComponent = component;
  if (componentMatchesSearchFilters(component, searchFilters)) {
    modifiedComponent = script(component);
  }
  if (modifiedComponent.components) {
    return {
      ...modifiedComponent,
      components: modifiedComponent.components.map((subComponent) =>
        recursivelyMigrateComponentAndSubcomponents(subComponent, searchFilters, script)
      ),
    };
  }
  return modifiedComponent;
}

function migrateForm(form, searchFilters, script) {
  return {
    ...form,
    components: form.components.map((component) =>
      recursivelyMigrateComponentAndSubcomponents(component, searchFilters, script)
    ),
  };
}

export { migrateForm };
