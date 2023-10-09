import { User } from '../custom';

declare global {
  namespace Express {
    export interface Request {
      getUser: () => User;
      getFormioToken: () => string;
    }
  }
}
