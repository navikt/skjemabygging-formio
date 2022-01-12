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

function getEditScript(editOptions, logger) {
  const editOptionObjects = Object.entries(editOptions).map(([editOptionKey, editOptionValue]) =>
    editOptionKey.split(".").reduceRight((acc, currentValue) => {
      return { [currentValue]: acc };
    }, editOptionValue)
  );
  const mergedEditOptionObject = editOptionObjects.reduce(objectUtils.deepMerge, {});

  return (comp) => {
    const editedComp = objectUtils.deepMerge(comp, mergedEditOptionObject);
    const changed = JSON.stringify(comp) !== JSON.stringify(editedComp);
    logger.push({ key: comp.key, original: comp, new: editedComp, changed });
    return editedComp;
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
  url = "https://protected-island-44773.herokuapp.com/form?type=form&tags=nav-skjema&limit=100&properties.tema__ne=xxx"
) {
  return fetchForms(url).then((response) => {
    let formsLogger = {};
    response.data.map((form) => {
      const affectedComponentsLogger = [];
      const result = migrateForm(form, searchFilters, getEditScript(editOptions, affectedComponentsLogger));
      formsLogger[form.properties.skjemanummer] = {
        found: affectedComponentsLogger.length,
        changed: affectedComponentsLogger.reduce((acc, curr) => acc + (curr.changed ? 1 : 0), 0),
      };
      return result;
    });

    return formsLogger;
  });
}

export { migrateForm, migrateForms, getEditScript };
