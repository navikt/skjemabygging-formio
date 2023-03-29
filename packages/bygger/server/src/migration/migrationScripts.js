import { migrationUtils, navFormUtils, objectUtils } from "@navikt/skjemadigitalisering-shared-domain";
import FormMigrationLogger from "./FormMigrationLogger";
import { componentHasDependencyMatchingFilters, componentMatchesFilters } from "./searchFilter.js";

function recursivelyMigrateComponentAndSubcomponents(
  form,
  component,
  searchFilters,
  dependencyFilters,
  script,
  logger
) {
  let modifiedComponent = component;
  if (
    componentMatchesFilters(component, searchFilters) &&
    componentHasDependencyMatchingFilters(form, component, dependencyFilters)
  ) {
    modifiedComponent = script(component);
    const dependsOn = getDependeeComponentsForComponent(form, component, dependencyFilters);
    logger.add(component, modifiedComponent, dependsOn);
  }
  if (modifiedComponent.components) {
    return {
      ...modifiedComponent,
      components: modifiedComponent.components.map((subComponent) =>
        recursivelyMigrateComponentAndSubcomponents(
          form,
          subComponent,
          searchFilters,
          dependencyFilters,
          script,
          logger
        )
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
  const logger = new FormMigrationLogger(form);
  const searchFilters = parseFiltersFromParam(searchFiltersFromParam);
  const dependencyFilters = parseFiltersFromParam(dependencyFiltersFromParam);

  const migratedForm = recursivelyMigrateComponentAndSubcomponents(
    form,
    form,
    searchFilters,
    dependencyFilters,
    getEditScript(editOptions),
    logger
  );
  return { migratedForm, logger };
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

function getDependeeComponentsForComponent(form, dependentComponent, filters) {
  return navFormUtils.findDependeeComponents(dependentComponent, form).map(({ component, types }) => {
    const { key, label } = component;
    const matchesFilters = Object.keys(filters).length > 0 && componentMatchesFilters(component, filters);
    return { key, label, types, matchesFilters };
  });
}

async function migrateForms(searchFilters, dependencyFilters, editOptions, allForms, formPaths = []) {
  let log = {};
  const migratedForms = allForms
    .filter((form) => formPaths.length === 0 || formPaths.includes(form.path))
    .map((form) => {
      const { migratedForm, logger } = migrateForm(form, searchFilters, dependencyFilters, editOptions);

      if (logger.isEmpty()) {
        return null;
      }

      log[logger.getSkjemanummer()] = logger.getLog();
      return migratedForm;
    })
    .filter((form) => !!form);
  return { log, migratedForms };
}

async function previewForm(searchFilters, dependencyFilters, editOptions, form) {
  const { migratedForm } = migrateForm(form, searchFilters, dependencyFilters, editOptions);
  return migratedForm;
}

export { migrateForm, migrateForms, getEditScript, previewForm };
