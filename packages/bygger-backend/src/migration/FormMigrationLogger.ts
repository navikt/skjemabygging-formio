import { Component, NavFormType, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import {
  BreakingChanges,
  DependeeComponent,
  Dependencies,
  FormMigrationDiff,
  FormMigrationLogData,
} from '../types/migration';
import { generateDiff } from './diffingTool';

interface AffectedComponent {
  key: string;
  original: Component;
  withChanges: Component;
  changed: boolean;
  diff: FormMigrationDiff;
  dependsOn: DependeeComponent[];
}

class FormMigrationLogger {
  form: NavFormType;
  affectedComponents: AffectedComponent[];

  constructor(form: NavFormType) {
    this.form = form;
    this.affectedComponents = [];
  }

  add(original: Component, withChanges: Component, dependsOn: DependeeComponent[] = []) {
    const diff = generateDiff(original, withChanges);
    const changed = JSON.stringify(original) !== JSON.stringify(withChanges);
    this.affectedComponents.push({ key: original.key, original, withChanges, diff, changed, dependsOn });
  }

  getSize() {
    return this.affectedComponents.length;
  }

  isEmpty() {
    return this.getSize() === 0;
  }

  getSkjemanummer() {
    return this.form.properties.skjemanummer;
  }

  private hasChangesToPropertiesWhichCanBreakDependencies(diff: FormMigrationDiff) {
    return (
      // Values for Nedtrekksliste are stored in data.values, so changes to data or data.values can be breaking
      diff.key_NEW || // Keys are used to look up submissions for components, and is the most common dependency
      diff.values_NEW || // Changes to values for Radiopanel or Flervalg components can break references that are depending on a specific value
      diff.data_NEW ||
      (diff.data && diff.data.values_NEW)
    );
  }

  getBreakingChanges(): BreakingChanges[] {
    return this.affectedComponents
      .filter((affected) => affected.diff)
      .filter((affected) => this.hasChangesToPropertiesWhichCanBreakDependencies(affected.diff))
      .flatMap(({ original, diff }) => {
        const dependentComponents = original.id ? navFormUtils.findDependentComponents(original.id, this.form) : [];
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

  getDependencies(): Dependencies {
    return this.affectedComponents.reduce((acc, curr) => {
      if (curr.dependsOn.length > 0) {
        return {
          ...acc,
          [curr.key]: curr.dependsOn,
        };
      }
      return acc;
    }, {});
  }

  getLog(): FormMigrationLogData {
    const { skjemanummer, isTestForm } = this.form.properties;
    return {
      skjemanummer,
      isTestForm,
      publishedLanguages: this.form.publishedLanguages,
      name: this.form.name,
      title: this.form.title,
      path: this.form.path,
      status: this.form.status,
      changedAt: this.form.changedAt,
      changedBy: this.form.changedBy,
      publishedAt: this.form.publishedAt,
      publishedBy: this.form.publishedBy,
      found: this.getSize(),
      changed: this.affectedComponents.reduce((acc, curr) => acc + (curr.changed ? 1 : 0), 0),
      diff: this.affectedComponents.map((affected) => affected.diff).filter((diff) => Object.keys(diff).length > 0),
      dependencies: this.getDependencies(),
      breakingChanges: this.getBreakingChanges(),
    };
  }
}

export default FormMigrationLogger;
