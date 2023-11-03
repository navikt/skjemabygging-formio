import {
  Component,
  MigrationLevel,
  NavFormType,
  navFormUtils,
  objectUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { FormMigrationLogData } from '../types/migration';
import FormMigrationLogger from './FormMigrationLogger';
import {
  Filter,
  componentHasDependencyMatchingFilters,
  parseFiltersFromParam,
  targetMatchesFilters,
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
    targetMatchesFilters(component, searchFilters) &&
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

function migrateOnFormLevel(
  form: NavFormType,
  searchFilters: Filter[],
  editOptions: object,
  logger: FormMigrationLogger,
) {
  if (targetMatchesFilters(form, searchFilters)) {
    const migratedForm = getEditScript(editOptions)(form);
    logger.add(form as unknown as Component, migratedForm as unknown as Component);
    return migratedForm;
  } else {
    return form;
  }
}

function migrateForm(
  form: NavFormType,
  searchFiltersFromParam: object,
  dependencyFiltersFromParam: object,
  editOptions: object,
  migrationLevel: MigrationLevel = 'component',
) {
  const logger = new FormMigrationLogger(form);
  const searchFilters = parseFiltersFromParam(searchFiltersFromParam);
  const dependencyFilters = parseFiltersFromParam(dependencyFiltersFromParam);

  let migratedForm: NavFormType;
  if (migrationLevel === 'form') {
    migratedForm = migrateOnFormLevel(form, searchFilters, editOptions, logger);
  } else {
    migratedForm = recursivelyMigrateComponentAndSubcomponents(
      form,
      form as unknown as Component,
      searchFilters,
      dependencyFilters,
      getEditScript(editOptions),
      logger,
    );
  }
  return { migratedForm, logger };
}

type EditScript = <T extends object>(comp: T) => T;

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
    const matchesFilters = Object.keys(filters).length > 0 && targetMatchesFilters(component, filters);
    return { key, label, types, matchesFilters };
  });
}

type MigrationLog = Record<string, FormMigrationLogData>;
interface MigrateFormsOutput {
  log: MigrationLog;
  migratedForms: NavFormType[];
}

async function migrateForms(
  searchFilters: object,
  dependencyFilters: object,
  editOptions: object,
  allForms: NavFormType[],
  formPaths: string[] = [],
  migrationLevel: MigrationLevel = 'component',
): Promise<MigrateFormsOutput> {
  const log: MigrationLog = {};
  const migratedForms = allForms
    .filter((form) => formPaths.length === 0 || formPaths.includes(form.path))
    .map((form) => {
      const { migratedForm, logger } = migrateForm(form, searchFilters, dependencyFilters, editOptions, migrationLevel);

      if (logger.isEmpty()) {
        return null;
      }

      log[logger.getSkjemanummer()] = logger.getLog();
      return migratedForm;
    })
    .filter((form) => !!form);
  // @ts-ignore
  return { log, migratedForms };
}

async function previewForm(
  searchFilters: object,
  dependencyFilters: object,
  editOptions: object,
  form: NavFormType,
  migrationLevel: MigrationLevel = 'component',
) {
  const { migratedForm } = migrateForm(form, searchFilters, dependencyFilters, editOptions, migrationLevel);
  return migratedForm;
}

export { getEditScript, migrateForm, migrateForms, previewForm };
