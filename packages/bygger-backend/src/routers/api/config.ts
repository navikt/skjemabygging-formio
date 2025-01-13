import { Response } from 'express';
import appConfig from '../../config';
import { createFormioJwt } from '../../middleware/authHandler';
import { ByggerRequest } from '../../types';
import { getByggerUrl } from '../../util/url';

const config = (req: ByggerRequest, res: Response) => {
  const user = appConfig.isProduction || process.env.API_MOCKING === 'true' ? req.getUser() : undefined;
  if (user && appConfig.isProduction) {
    res.header('Bygger-Formio-Token', createFormioJwt(user));
  }
  res.json({
    formioProjectUrl: `${getByggerUrl(req)}/${appConfig.formio.projectName}`,
    fyllutBaseUrl: `${getByggerUrl(req)}/fyllut`,
    skjemadelingslenkeUrl: appConfig.fyllut.skjemadelingslenkeUrl,
    pusherCluster: appConfig.pusher.cluster,
    pusherKey: appConfig.pusher.key,
    isDevelopment: appConfig.isDevelopment,
    featureToggles: appConfig.featureToggles,
    formioRoleIds: appConfig.formio.roleIds,
    loggerConfig: appConfig.frontendLoggerConfig,
    isProdGcp: appConfig.naisClusterName === 'prod-gcp',
    user,
    mellomlagringDurationDays: appConfig.mellomlagringDurationDays,
  });
};

export default config;
