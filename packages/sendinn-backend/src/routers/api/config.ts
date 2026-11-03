import { createSharedFrontendConfig } from '@navikt/skjemadigitalisering-shared-backend';
import { Request, Response } from 'express';
import { config as appConfig } from '../../config/config';

const frontendConfig = createSharedFrontendConfig({
  naisClusterName: appConfig.naisClusterName,
  featureToggles: {},
  loggerConfig: { enabled: true, logLevel: 'info', browserOnly: appConfig.isDevelopment },
  isDevelopment: appConfig.isDevelopment,
});

const config = {
  get: (_req: Request, res: Response) => {
    res.json(frontendConfig);
  },
};

export default config;
