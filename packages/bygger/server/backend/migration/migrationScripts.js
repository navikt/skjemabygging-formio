import { objectUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { fetchWithErrorHandling } from "../fetchUtils.js";
import { generateDiff } from "./diffingTool.js";
import { componentMatchesSearchFilters } from "./searchFilter.js";

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
  return recursivelyMigrateComponentAndSubcomponents(form, searchFilters, script);
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
  url = "https://formio-api-server.ekstern.dev.nav.no/form?type=form&tags=nav-skjema&limit=100&properties.tema=xxx-migrering"
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
  baseUrl = "https://formio-api-server.ekstern.dev.nav.no"
) {
  const url = `${baseUrl}/form?type=form&tags=nav-skjema&path=${formPath}&limit=1`;
  return fetchForms(url).then((response) => migrateForm(response.data[0], searchFilters, getEditScript(editOptions)));
}

export { migrateForm, migrateForms, getEditScript, previewForm };
