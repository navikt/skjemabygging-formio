import { objectUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { fetchWithErrorHandling } from "./fetchUtils.js";

function getPropertyFromComponent(comp, properties) {
  if (properties.length > 1) {
    return getPropertyFromComponent(comp[properties[0]], properties.slice(1));
  }
  return comp && comp[properties[0]];
}

export function componentMatchesSearchFilters(component, searchFilters) {
  return Object.keys(searchFilters).every(
    (property) => getPropertyFromComponent(component, property.split(".")) === searchFilters[property]
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
    if (key === "id") return { ...acc, [key]: originalComponent[key] };
    if (originalComponent[key] !== editedComponent[key])
      return { ...acc, [key]: { _ORIGINAL: originalComponent[key], _NEW: editedComponent[key] } };
    if (key === "key" || key === "label") return { ...acc, [key]: originalComponent[key] };
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

async function migrateForms(
  searchFilters,
  editOptions,
  formPaths = [],
  url = "https://protected-island-44773.herokuapp.com/form?type=form&tags=nav-skjema&limit=100"
) {
  return fetchForms(url).then((response) => {
    let log = {};
    const migratedForms = response.data
      .filter((form) => formPaths.length === 0 || formPaths.includes(form.path))
      .map((form) => {
        const affectedComponentsLogger = [];
        const result = migrateForm(form, searchFilters, getEditScript(editOptions, affectedComponentsLogger));
        log[form.properties.skjemanummer] = {
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
    return { log, migratedForms };
  });
}

async function previewForm(
  searchFilters,
  editOptions,
  formPath,
  baseUrl = "https://protected-island-44773.herokuapp.com"
) {
  const url = `${baseUrl}/form?type=form&tags=nav-skjema&path=${formPath}&limit=1`;
  return fetchForms(url).then((response) => migrateForm(response.data[0], searchFilters, getEditScript(editOptions)));
}

export { migrateForm, migrateForms, getEditScript, previewForm };
