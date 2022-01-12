import { objectUtils } from "@navikt/skjemadigitalisering-shared-domain";
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

function getEditScript(editOptions) {
  const editOptionObjects = Object.entries(editOptions).map(([editOptionKey, editOptionValue]) =>
    editOptionKey.split(".").reduceRight((acc, currentValue) => {
      return { [currentValue]: acc };
    }, editOptionValue)
  );
  const mergedEditOptionObject = editOptionObjects.reduce(objectUtils.deepMerge, {});

  return (comp) => {
    return objectUtils.deepMerge(comp, mergedEditOptionObject);
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
  return fetchForms(url).then((response) => {
    return response.data.map((form) => migrateForm(form, searchFilters, getEditScript(editOptions)));
  });
}

export { migrateForm, migrateForms, getEditScript };
