export interface MigrationOption {
  key: string;
  value: any;
}

export interface MigrationOptions {
  [key: string]: MigrationOption;
}
