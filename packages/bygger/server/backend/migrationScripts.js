import { fetchWithErrorHandling } from "./fetchUtils.js";

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

async function fetchForms(url) {
  return await fetchWithErrorHandling(url, {
    method: "GET",
  });
}

async function migrateForms(
  searchFilters,
  editOptions,
  url = "https://protected-island-44773.herokuapp.com/form?type=form&tags=nav-skjema&limit=10&properties.tema__ne=xxx"
) {
  return fetchForms(url).then((response) =>
    response.data.map((form) =>
      migrateForm(form, searchFilters, (comp) => ({
        ...comp,
        validate: { custom: "valid = instance.something(input)", required: true },
      }))
    )
  );
}

export { migrateForm, migrateForms };
