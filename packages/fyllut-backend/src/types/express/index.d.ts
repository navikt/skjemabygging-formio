import { User } from '../custom';
import { EnvQualifierType } from '../env';

declare global {
  namespace Express {
    export interface Request {
      getIdportenJwt: () => User;
      getIdportenPid: () => string;
      getTokenxAccessToken: () => string;
      getEnvQualifier: () => EnvQualifierType | undefined;
    }
  }
}
