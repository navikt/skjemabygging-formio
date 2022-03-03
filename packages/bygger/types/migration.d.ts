export interface MigrationOption {
  key: string;
  value: any;
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

export interface DryRunResult {
  skjemanummer: string;
  name: string;
  title: string;
  path: string;
  found: number;
  changed: number;
  diff: FormMigrationDiff[];
}

export interface DryRunResults {
  [skjemanummer: string]: DryRunResult;
}
