import { migrationUtils, navFormUtils, objectUtils } from "@navikt/skjemadigitalisering-shared-domain";
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

function parseFiltersFromParam(filtersFromParam) {
  return Object.entries(filtersFromParam).map(([key, value]) => {
    const [prop, operator] = migrationUtils.getPropAndOperatorFromKey(key);
    return { key: prop, value, operator };
  });
}

function migrateForm(form, filtersFromParam, script) {
  const searchFilters = parseFiltersFromParam(filtersFromParam);
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
    const diff = generateDiff(comp, editedComp);
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

function getDependeeComponents(form, changes, filtersFromParam) {
  const filters = parseFiltersFromParam(filtersFromParam);
  return changes.reduce((acc, { key, original }) => {
    const dependeeComponents = navFormUtils.findDependeeComponents(original, form).map(({ component, types }) => {
      const { key, label } = component;
      const matchesFilters = Object.keys(filters).length > 0 && componentMatchesSearchFilters(component, filters);
      return { key, label, types, matchesFilters };
    });
    if (dependeeComponents.length > 0) {
      return { ...acc, [key]: dependeeComponents };
    }
    return {};
  }, {});
}

async function migrateForms(searchFilters, dependencyFilters, editOptions, allForms, formPaths = []) {
  let log = {};
  const migratedForms = allForms
    .filter((form) => formPaths.length === 0 || formPaths.includes(form.path))
    .map((form) => {
      const affectedComponentsLogger = [];
      const result = migrateForm(form, searchFilters, getEditScript(editOptions, affectedComponentsLogger));
      const breakingChanges = getBreakingChanges(form, affectedComponentsLogger);
      const dependeeComponents = getDependeeComponents(form, affectedComponentsLogger, dependencyFilters);

      if (Object.keys(dependencyFilters).length > 0) {
        affectedComponentsLogger.filter((affected) => dependeeComponents[affected.key]?.matchesFilters);
      }

      const {
        skjemanummer,
        modified,
        modifiedBy,
        published,
        publishedBy,
        isTestForm,
        unpublished,
        unpublishedBy,
        publishedLanguages,
      } = form.properties;
      if (affectedComponentsLogger.length > 0) {
        log[form.properties.skjemanummer] = {
          skjemanummer,
          modified,
          modifiedBy,
          published,
          publishedBy,
          isTestForm,
          unpublished,
          unpublishedBy,
          publishedLanguages,
          name: form.name,
          title: form.title,
          path: form.path,
          found: affectedComponentsLogger.length,
          changed: affectedComponentsLogger.reduce((acc, curr) => acc + (curr.changed ? 1 : 0), 0),
          diff: affectedComponentsLogger.map((affected) => affected.diff).filter((diff) => diff),
          dependeeComponents,
          breakingChanges,
        };
      }
      return result;
    });
  return { log, migratedForms };
}

async function previewForm(searchFilters, editOptions, form) {
  return migrateForm(form, searchFilters, getEditScript(editOptions));
}

export { migrateForm, migrateForms, getEditScript, previewForm, getBreakingChanges };
