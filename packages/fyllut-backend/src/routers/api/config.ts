import { createSharedFrontendConfig } from '@navikt/skjemadigitalisering-shared-backend';
import { FyllutFrontendConfig } from '@navikt/skjemadigitalisering-shared-domain';
import { config as configObject } from '../../config/config';
import { getIsLoggedIn } from '../../security/tokenHelper';

const {
  applicationName,
  naisClusterName,
  featureToggles,
  newRenderForms,
  isDelingslenke,
  isDevelopment,
  frontendLoggerConfig,
  gitVersion,
  mocksEnabled,
} = configObject;

const config = {
  get: async (req, res) => {
    const isLoggedIn = getIsLoggedIn(req);
    const sharedConfig = createSharedFrontendConfig({
      naisClusterName,
      featureToggles,
      isDevelopment,
      loggerConfig: frontendLoggerConfig,
    });

    const payload = {
      ...sharedConfig,
      isDelingslenke,
      newRenderForms,
      mocksEnabled,
      isLoggedIn,
      gitVersion,
      applicationName,
    } satisfies FyllutFrontendConfig;

    return res.json(payload);
  },
};

export default config;
