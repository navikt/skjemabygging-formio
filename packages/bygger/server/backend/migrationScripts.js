import { objectUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { fetchWithErrorHandling } from "./fetchUtils.js";

function getPropertyFromComponentAsString(comp, properties) {
  if (properties.length > 1) {
    return getPropertyFromComponentAsString(comp[properties[0]], properties.slice(1));
  }
  return comp && `${comp[properties[0]]}`;
}

export function componentMatchesSearchFilters(component, searchFilters) {
  return Object.keys(searchFilters).every(
    (property) => getPropertyFromComponentAsString(component, property.split(".")) === searchFilters[property]
  );
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

function generateDiff(originalComponent, editedComponent) {
  return Object.keys(originalComponent).reduce((acc, key) => {
    if (key === "key" || key === "label" || key === "id") return { ...acc, [key]: originalComponent[key] };
    if (originalComponent[key] !== editedComponent[key])
      return { ...acc, [key]: { _ORIGINAL: originalComponent[key], _NEW: editedComponent[key] } };
    return acc;
  }, {});
}

function getEditScript(editOptions, logger = []) {
  const editOptionObjects = Object.entries(editOptions).map(([editOptionKey, editOptionValue]) =>
    editOptionKey.split(".").reduceRight((acc, currentValue) => {
      return { [currentValue]: acc };
    }, editOptionValue)
  );
  const mergedEditOptionObject = editOptionObjects.reduce(objectUtils.deepMerge, {});

  return (comp) => {
    const editedComp = objectUtils.deepMerge(comp, mergedEditOptionObject);
    const changed = JSON.stringify(comp) !== JSON.stringify(editedComp);
    const diff = changed && generateDiff(comp, editedComp);
    logger.push({ key: comp.key, original: comp, new: editedComp, changed, diff });
    return editedComp;
  };
}

async function fetchForms(url) {
  return await fetchWithErrorHandling(url, {
    method: "GET",
  });
}

let editedForms = [];

async function migrateForms(
  searchFilters,
  editOptions,
  url = "https://protected-island-44773.herokuapp.com/form?type=form&tags=nav-skjema&limit=100&properties.tema__ne=xxx"
) {
  return fetchForms(url).then((response) => {
    let formsLogger = {};
    editedForms = response.data.map((form) => {
      const affectedComponentsLogger = [];
      const result = migrateForm(form, searchFilters, getEditScript(editOptions, affectedComponentsLogger));
      formsLogger[form.properties.skjemanummer] = {
        skjemanummer: form.properties.skjemanummer,
        name: form.name,
        title: form.title,
        path: form.path,
        found: affectedComponentsLogger.length,
        changed: affectedComponentsLogger.reduce((acc, curr) => acc + (curr.changed ? 1 : 0), 0),
        diff: affectedComponentsLogger.map((affected) => affected.diff).filter((diff) => diff),
      };
      return result;
    });
    return formsLogger;
  });
}

function getMigratedForm(formPath) {
  return editedForms.find((form) => form.path === formPath);
}

export { migrateForm, migrateForms, getEditScript, getMigratedForm };
