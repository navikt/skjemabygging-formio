function componentMatchesSearchFilters(component, searchFilters) {
  return Object.keys(searchFilters).every((property) => component[property] === searchFilters[property]);
}

function migrateForm(form, options, script) {
  return {
    ...form,
    components: form.components.map((component) => {
      if (componentMatchesSearchFilters(component, options)) {
        return script(component);
      }
      return component;
    }),
  };
}

export { migrateForm };
