import { createSharedFrontendConfig } from '@navikt/skjemadigitalisering-shared-backend';
import { ByggerFrontendConfig } from '@navikt/skjemadigitalisering-shared-domain';
import { Response } from 'express';
import appConfig from '../../config';
import { ByggerRequest } from '../../types';
import { getByggerUrl } from '../../util/url';

const config = (req: ByggerRequest, res: Response) => {
  const user = appConfig.isDevelopment ? undefined : req.getUser?.();
  const sharedConfig = createSharedFrontendConfig({
    naisClusterName: appConfig.naisClusterName,
    featureToggles: appConfig.featureToggles,
    isDevelopment: appConfig.isDevelopment,
    loggerConfig: appConfig.frontendLoggerConfig,
  });

  const payload = {
    ...sharedConfig,
    fyllutBaseUrl: `${getByggerUrl(req)}/fyllut`,
    skjemadelingslenkeUrl: appConfig.fyllut.skjemadelingslenkeUrl,
    pusherCluster: appConfig.pusher.cluster,
    pusherKey: appConfig.pusher.key,
    user,
    mellomlagringDurationDays: appConfig.mellomlagringDurationDays,
  } satisfies ByggerFrontendConfig;

  res.json(payload);
};

export default config;
