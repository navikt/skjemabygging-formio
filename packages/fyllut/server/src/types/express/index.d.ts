import { User } from "../custom";

declare global {
  namespace Express {
    export interface Request {
      getIdportenJwt: () => User;
      getIdportenPid: () => string;
      getTokenxAccessToken: () => string;
    }
  }
}
