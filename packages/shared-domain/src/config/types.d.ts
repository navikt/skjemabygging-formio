export interface ConfigType {
  FEATURE_TOGGLES: string;
  NAIS_CLUSTER_NAME?: 'dev-gcp' | 'prod-gcp';
  isDelingslenke: boolean;
  isDevelopment: boolean;
  isLoggedIn: boolean;
  loggerConfig: {
    enabled: boolean;
    logLevel: number;
    browserOnly: boolean;
  };
}
