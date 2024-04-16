export interface ConfigType {
  FEATURE_TOGGLES: string;
  NAIS_CLUSTER_NAME: string;
  isDelingslenke: boolean;
  isDevelopment: boolean;
  isProduction: boolean;
  isLoggedIn: boolean;
  amplitudeApiEndpoint: string;
  loggerConfig: {
    enabled: boolean;
    logLevel: number;
    browserOnly: boolean;
  };
}
