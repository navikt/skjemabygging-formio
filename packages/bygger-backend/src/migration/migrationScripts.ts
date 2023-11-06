import { Component, NavFormType, navFormUtils, objectUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { FormMigrationLogData } from '../types/migration';
import FormMigrationLogger from './FormMigrationLogger';
import {
  Filter,
  componentHasDependencyMatchingFilters,
  componentMatchesFilters,
  parseFiltersFromParam,
} from './filterUtils';

function recursivelyMigrateComponentAndSubcomponents(
  form: NavFormType,
  component: Component,
  searchFilters: Filter[],
  dependencyFilters: Filter[],
  script: EditScript,
  logger: FormMigrationLogger,
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
          logger,
        ),
      ),
    };
  }
  return modifiedComponent;
}

function migrateForm(
  form: NavFormType,
  searchFiltersFromParam: object,
  dependencyFiltersFromParam: object,
  editOptions: object,
) {
  const logger = new FormMigrationLogger(form);
  const searchFilters = parseFiltersFromParam(searchFiltersFromParam);
  const dependencyFilters = parseFiltersFromParam(dependencyFiltersFromParam);

  const migratedForm = recursivelyMigrateComponentAndSubcomponents(
    form,
    form as unknown as Component,
    searchFilters,
    dependencyFilters,
    getEditScript(editOptions),
    logger,
  );
  return { migratedForm, logger };
}

type EditScript = (comp: Component) => Component;
function getEditScript(editOptions: object): EditScript {
  const editOptionObjects = Object.entries(editOptions).map(([editOptionKey, editOptionValue]) =>
    editOptionKey.split('.').reduceRight((acc, currentValue) => {
      return { [currentValue]: acc };
    }, editOptionValue),
  );
  const mergedEditOptionObject: {} = editOptionObjects.reduce(objectUtils.deepMerge, {});

  return (comp) => {
    return objectUtils.deepMerge(comp, mergedEditOptionObject);
  };
}

function getDependeeComponentsForComponent(form: NavFormType, dependentComponent: Component, filters: Filter[]) {
  return navFormUtils.findDependeeComponents(dependentComponent, form).map(({ component, types }) => {
    const { key, label } = component;
    const matchesFilters = Object.keys(filters).length > 0 && componentMatchesFilters(component, filters);
    return { key, label, types, matchesFilters };
  });
}

type MigrationLog = Record<string, FormMigrationLogData>;

async function migrateForms(
  searchFilters: object,
  dependencyFilters: object,
  editOptions: object,
  allForms: NavFormType[],
  formPaths: string[] = [],
) {
  const log: MigrationLog = {};
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

async function previewForm(searchFilters: object, dependencyFilters: object, editOptions: object, form: NavFormType) {
  const { migratedForm } = migrateForm(form, searchFilters, dependencyFilters, editOptions);
  return migratedForm;
}

export { getEditScript, migrateForm, migrateForms, previewForm };
