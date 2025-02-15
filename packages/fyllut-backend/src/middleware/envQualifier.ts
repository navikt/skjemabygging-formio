import { NextFunction, Request, Response } from 'express';
import { config } from '../config/config';
import { NaisCluster } from '../config/nais-cluster';
import { EnvQualifier, EnvQualifierType } from '../types/env';

const envQualifierMap = {
  'fyllut.ansatt.dev.nav.no': EnvQualifier.preprodAltAnsatt,
  'fyllut.intern.dev.nav.no': EnvQualifier.preprodAltIntern,
  'fyllut-preprod.ansatt.dev.nav.no': EnvQualifier.preprodAnsatt,
  'fyllut-preprod-alt.ansatt.dev.nav.no': EnvQualifier.preprodAltAnsatt,
  'fyllut-preprod.intern.dev.nav.no': EnvQualifier.preprodIntern,
  'fyllut-preprod-alt.intern.dev.nav.no': EnvQualifier.preprodAltIntern,
  localhost: EnvQualifier.local,
  skjemadelingslenke: EnvQualifier.delingslenke,
};

const envQualifier = (req: Request, _res: Response, next: NextFunction) => {
  let envQualifier: EnvQualifierType | undefined = undefined;
  if (config.naisClusterName !== NaisCluster.PROD) {
    const host = req.get('host');
    const matchingUrl = Object.keys(envQualifierMap).find((partialUrl) => host?.includes(partialUrl));
    if (matchingUrl) {
      envQualifier = envQualifierMap[matchingUrl];
    }
  }
  req.getEnvQualifier = () => envQualifier;
  next();
};

export type PartialUrl = keyof typeof envQualifierMap; // export for test

export default envQualifier;
