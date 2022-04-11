import { navFormUtils, objectUtils } from "@navikt/skjemadigitalisering-shared-domain";
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

function hasChangesToPropertiesWhichCanBreakDependencies(diff) {
  return (
    diff.key_NEW || // Keys are used to look up submissions for components, and is the most common dependency
    diff.values_NEW || // Changes to values for Radiopanel or Flervalg components can break references that are depending on a specific value
    diff.data_NEW ||
    (diff.data && diff.data.values_NEW) // Values for Nedtrekksliste are stored in data.values, so changes to data or data.values can be breaking
  );
}

function getBreakingChanges(form, changes) {
  return changes
    .filter((affected) => affected.diff)
    .map((affected) => affected.diff)
    .filter((diff) => hasChangesToPropertiesWhichCanBreakDependencies(diff))
    .flatMap((diff) => {
      const dependentComponents = navFormUtils.findDependentComponents(diff.id, form);
      if (dependentComponents.length > 0) {
        return [
          {
            componentWithDependencies: diff,
            dependentComponents,
          },
        ];
      } else return [];
    });
}

async function migrateForms(searchFilters, editOptions, allForms, formPaths = []) {
  let log = {};
  const migratedForms = allForms
    .filter((form) => formPaths.length === 0 || formPaths.includes(form.path))
    .map((form) => {
      const affectedComponentsLogger = [];
      const result = migrateForm(form, searchFilters, getEditScript(editOptions, affectedComponentsLogger));
      const breakingChanges = getBreakingChanges(form, affectedComponentsLogger);
      log[form.properties.skjemanummer] = {
        skjemanummer: form.properties.skjemanummer,
        name: form.name,
        title: form.title,
        path: form.path,
        found: affectedComponentsLogger.length,
        changed: affectedComponentsLogger.reduce((acc, curr) => acc + (curr.changed ? 1 : 0), 0),
        diff: affectedComponentsLogger.map((affected) => affected.diff).filter((diff) => diff),
        breakingChanges: breakingChanges,
      };
      return result;
    });
  return { log, migratedForms };
}

async function previewForm(searchFilters, editOptions, form) {
  return migrateForm(form, searchFilters, getEditScript(editOptions));
}

export { migrateForm, migrateForms, getEditScript, previewForm, getBreakingChanges };
