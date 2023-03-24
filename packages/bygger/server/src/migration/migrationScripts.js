import { migrationUtils, navFormUtils, objectUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { generateDiff } from "./diffingTool.js";
import { componentHasDependencyMatchingFilters, componentMatchesFilters } from "./searchFilter.js";

function recursivelyMigrateComponentAndSubcomponents(form, component, searchFilters, dependencyFilters, script) {
  let modifiedComponent = component;
  if (
    componentMatchesFilters(component, searchFilters) &&
    componentHasDependencyMatchingFilters(form, component, dependencyFilters)
  ) {
    modifiedComponent = script(component);
  }
  if (modifiedComponent.components) {
    return {
      ...modifiedComponent,
      components: modifiedComponent.components.map((subComponent) =>
        recursivelyMigrateComponentAndSubcomponents(form, subComponent, searchFilters, dependencyFilters, script)
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

function migrateForm(form, searchFiltersFromParam, dependencyFiltersFromParam, editOptions) {
  //TODO: potentially turn logger into a class
  let logger = [];
  const searchFilters = parseFiltersFromParam(searchFiltersFromParam);
  const dependencyFilters = parseFiltersFromParam(dependencyFiltersFromParam);

  const migratedForm = recursivelyMigrateComponentAndSubcomponents(
    form,
    form,
    searchFilters,
    dependencyFilters,
    getEditScript(editOptions, logger)
  );
  const breakingChanges = getBreakingChanges(form, logger);
  //TODO: find a way to check for matching dependencies inside recursivelyMigrateComponentAndSubcomponents - maybe generate a map and send in
  const dependeeComponents = getDependeeComponents(form, logger, dependencyFilters);

  // if (Object.keys(dependencyFilters).length > 0) {
  //   logger = logger.filter((affected) => {
  //     return !!dependeeComponents[affected.key]?.some((dependee) => dependee.matchesFilters);
  //   });
  // }
  return { migratedForm, affectedComponentsLog: logger, breakingChanges, dependeeComponents };
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

function getDependeeComponents(form, changes, filters) {
  return changes.reduce((acc, { key, original }) => {
    const dependeeComponents = navFormUtils.findDependeeComponents(original, form).map(({ component, types }) => {
      const { key, label } = component;
      const matchesFilters = Object.keys(filters).length > 0 && componentMatchesFilters(component, filters);
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
      const { migratedForm, affectedComponentsLog, breakingChanges, dependeeComponents } = migrateForm(
        form,
        searchFilters,
        dependencyFilters,
        editOptions
      );

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
      if (affectedComponentsLog.length > 0) {
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
          found: affectedComponentsLog.length,
          changed: affectedComponentsLog.reduce((acc, curr) => acc + (curr.changed ? 1 : 0), 0),
          diff: affectedComponentsLog.map((affected) => affected.diff).filter((diff) => Object.keys(diff).length > 0),
          dependeeComponents,
          breakingChanges,
        };
      }
      return migratedForm;
    });
  return { log, migratedForms };
}

async function previewForm(searchFilters, dependencyFilters, editOptions, form) {
  const { migratedForm } = migrateForm(form, searchFilters, dependencyFilters, editOptions);
  return migratedForm;
}

export { migrateForm, migrateForms, getEditScript, previewForm, getBreakingChanges };
