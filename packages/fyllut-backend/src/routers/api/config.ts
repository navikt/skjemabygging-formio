import { ConfigType } from '@navikt/skjemadigitalisering-shared-domain';
import { config as configObject } from '../../config/config';
import { getIsLoggedIn } from '../../security/tokenHelper';

const { naisClusterName, featureToggles, isDelingslenke, isDevelopment, frontendLoggerConfig, gitVersion } =
  configObject;

const config = {
  get: async (req, res): Promise<ConfigType> => {
    const isLoggedIn = getIsLoggedIn(req);

    return res.json({
      NAIS_CLUSTER_NAME: naisClusterName,
      FEATURE_TOGGLES: featureToggles,
      isDelingslenke,
      isDevelopment,
      isLoggedIn,
      gitVersion,
      loggerConfig: frontendLoggerConfig,
    });
  },
};

export default config;
