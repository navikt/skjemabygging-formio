import { NextFunction, Request, Response } from 'express';
import { config } from '../config/config';
import { NaisCluster } from '../config/nais-cluster';
import { EnvQualifier, EnvQualifierType } from '../types/env';

const envQualifier = (req: Request, _res: Response, next: NextFunction) => {
  let envQualifier: EnvQualifierType | undefined = undefined;
  if (config.naisClusterName !== NaisCluster.PROD) {
    const host = req.get('host');
    if (host?.includes('fyllut-preprod.ansatt.dev.nav.no')) {
      envQualifier = EnvQualifier.preprodAnsatt;
    } else if (host?.includes('fyllut-preprod-alt.ansatt.dev.nav.no')) {
      envQualifier = EnvQualifier.preprodAltAnsatt;
    } else if (host?.includes('fyllut-preprod.intern.dev.nav.no')) {
      envQualifier = EnvQualifier.preprodIntern;
    } else if (host?.includes('fyllut-preprod-alt.intern.dev.nav.no')) {
      envQualifier = EnvQualifier.preprodAltIntern;
    } else if (host?.includes('localhost')) {
      envQualifier = EnvQualifier.local;
    }
  }
  req.getEnvQualifier = () => envQualifier;
  next();
};

export default envQualifier;
