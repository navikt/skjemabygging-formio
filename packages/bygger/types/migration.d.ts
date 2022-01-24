export interface MigrationOption {
  key: string;
  value: any;
}

export interface MigrationOptions {
  [key: string]: MigrationOption;
}

export interface FormMigrationDiff {
  key: string;
  label: string;
  id: string;
  [property: string]: { _ORIGINAL: any; _NEW: any };
}

export interface FormMigrationResult {
  skjemanummer: string;
  name: string;
  title: string;
  path: string;
  found: number;
  changed: number;
  diff: FormMigrationDiff[];
}

export interface FormMigrationResults {
  [skjemanummer: string]: FormMigrationResult;
}
