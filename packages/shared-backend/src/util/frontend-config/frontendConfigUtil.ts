import {
  FeatureTogglesMap,
  FrontendLoggerConfigType,
  SharedFrontendConfig,
} from '@navikt/skjemadigitalisering-shared-domain';

type CreateSharedFrontendConfigProps = {
  naisClusterName?: string;
  featureToggles: FeatureTogglesMap;
  loggerConfig: FrontendLoggerConfigType;
  isDevelopment: boolean;
};

const createSharedFrontendConfig = ({
  naisClusterName,
  featureToggles,
  loggerConfig,
  isDevelopment,
}: CreateSharedFrontendConfigProps): SharedFrontendConfig => {
  const normalizedNaisClusterName =
    naisClusterName === 'dev-gcp' || naisClusterName === 'prod-gcp' ? naisClusterName : undefined;

  return {
    NAIS_CLUSTER_NAME: normalizedNaisClusterName,
    FEATURE_TOGGLES: featureToggles,
    featureToggles,
    isDevelopment,
    isProdGcp: normalizedNaisClusterName === 'prod-gcp',
    loggerConfig,
  };
};

export { createSharedFrontendConfig };
