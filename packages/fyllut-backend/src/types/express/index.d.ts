import { User } from '../custom';
import { EnvQualifierType } from '../env';
import { NologinContext } from '../nologin';

declare global {
  namespace Express {
    export interface Request {
      getIdportenJwt: () => User;
      getIdportenPid: () => string;
      getTokenxAccessToken: () => string;
      getEnvQualifier: () => EnvQualifierType | undefined;
      getNologinContext: () => NologinContext | undefined;
    }
  }
}
