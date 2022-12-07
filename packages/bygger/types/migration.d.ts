import { FormPropertiesType, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";

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

export type FormMigrationDiff =
  | {
      key: string;
      label: string;
      id: string;
    }
  | { [property: string]: { _ORIGINAL: any; _NEW: any } };

export type ComponentWithDependencies = {
  id: string;
  [key: string]: string;
} & (
  | {
      key: string;
    }
  | {
      key_ORIGINAL: string;
      key_NEW: string;
    }
) &
  (
    | {
        label: string;
      }
    | {
        label_ORIGINAL: string;
        label_NEW: string;
      }
  );

export interface DependentComponents {
  key: string;
  label: string;
}

export interface BreakingChanges {
  componentWithDependencies: ComponentWithDependencies;
  dependentComponents: DependentComponents[];
}

export interface DryRunResult
  extends Pick<FormPropertiesType, "skjemanummer" | "modified" | "published" | "isTestForm" | "unpublished">,
    Pick<NavFormType, "name" | "title" | "path"> {
  found: number;
  changed: number;
  diff: FormMigrationDiff[];
  breakingChanges?: BreakingChanges[];
}

export interface DryRunResults {
  [skjemanummer: string]: DryRunResult;
}
