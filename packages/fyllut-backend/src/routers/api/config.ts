import { ConfigType } from '@navikt/skjemadigitalisering-shared-domain';
import { config as configObject } from '../../config/config';
import { getIsLoggedIn } from '../../security/tokenHelper';

const {
  applicationName,
  naisClusterName,
  featureToggles,
  isDelingslenke,
  isDevelopment,
  frontendLoggerConfig,
  gitVersion,
  isMocksEnabled,
} = configObject;

const config = {
  get: async (req, res): Promise<ConfigType> => {
    const isLoggedIn = getIsLoggedIn(req);

    return res.json({
      NAIS_CLUSTER_NAME: naisClusterName,
      FEATURE_TOGGLES: featureToggles,
      isDelingslenke,
      isDevelopment,
      isMocksEnabled,
      isLoggedIn,
      gitVersion,
      loggerConfig: frontendLoggerConfig,
      applicationName,
    });
  },
};

export default config;
