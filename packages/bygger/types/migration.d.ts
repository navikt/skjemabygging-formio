import { DependencyType, FormPropertiesType, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { FormStatusProperties } from '../src/Forms/status/types';
// se duplikat: bygger-backend/src/types/migration.d.ts

export type ParsedInput = number | string | boolean | null | object | Array;

export interface MigrationOption {
  key: string;
  value: ParsedInput;
  operator?: Operator;
}

export interface MigrationOptions {
  [key: string]: MigrationOption;
}

interface MigrationMap {
  [key: string]: string;
}

export type FormMigrationDiff = {
  id: string;
  key?: string;
  label?: string;
  [key: string]: ParsedInput;
};

export interface DependentComponents {
  key: string;
  label: string;
}

export interface BreakingChanges {
  componentWithDependencies: FormMigrationDiff;
  dependentComponents: DependentComponents[];
}

interface DependeeComponent {
  key: string;
  label: string;
  types: DependencyType[];
  matchesFilters: boolean;
}

export interface Dependencies {
  [key: string]: DependeeComponent[];
}

export interface FormMigrationLogData
  extends FormStatusProperties,
    Pick<FormPropertiesType, 'skjemanummer' | 'publishedLanguages'>,
    Pick<NavFormType, 'name' | 'title' | 'path'> {
  found: number;
  changed: number;
  diff: FormMigrationDiff[];
  dependencies: Dependencies;
  breakingChanges?: BreakingChanges[];
}

export interface DryRunResults {
  [skjemanummer: string]: FormMigrationLogData;
}
