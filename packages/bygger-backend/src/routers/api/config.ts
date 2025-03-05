import { Response } from 'express';
import appConfig from '../../config';
import { ByggerRequest } from '../../types';
import { getByggerUrl } from '../../util/url';

const config = (req: ByggerRequest, res: Response) => {
  const user = appConfig.isDevelopment ? undefined : req.getUser?.();
  res.json({
    fyllutBaseUrl: `${getByggerUrl(req)}/fyllut`,
    skjemadelingslenkeUrl: appConfig.fyllut.skjemadelingslenkeUrl,
    pusherCluster: appConfig.pusher.cluster,
    pusherKey: appConfig.pusher.key,
    isDevelopment: appConfig.isDevelopment,
    featureToggles: appConfig.featureToggles,
    loggerConfig: appConfig.frontendLoggerConfig,
    isProdGcp: appConfig.naisClusterName === 'prod-gcp',
    user,
    mellomlagringDurationDays: appConfig.mellomlagringDurationDays,
  });
};

export default config;
