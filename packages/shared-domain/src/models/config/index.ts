import { FeatureTogglesMap } from '../../utils';
import { FrontendLoggerConfigType } from '../logging';

export interface SharedFrontendConfig {
  NAIS_CLUSTER_NAME?: 'dev-gcp' | 'prod-gcp';
  FEATURE_TOGGLES: FeatureTogglesMap;
  featureToggles: FeatureTogglesMap;
  isProdGcp: boolean;
  isDevelopment: boolean;
  loggerConfig: FrontendLoggerConfigType;
}

export interface FyllutFrontendConfig extends SharedFrontendConfig {
  isDelingslenke: boolean;
  isLoggedIn: boolean;
  mocksEnabled: boolean;
  gitVersion: string;
  applicationName: string;
}

export interface ByggerFrontendUser {
  name?: string;
  preferredUsername?: string;
  NAVident?: string;
  isAdmin: boolean;
}

export interface ByggerFrontendConfig extends SharedFrontendConfig {
  fyllutBaseUrl: string;
  skjemadelingslenkeUrl: string;
  pusherCluster: string;
  pusherKey: string;
  user?: ByggerFrontendUser;
  mellomlagringDurationDays: string;
}
