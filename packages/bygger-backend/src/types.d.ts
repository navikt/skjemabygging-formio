import { Request } from 'express';

export interface ByggerUser {
  name: string;
  preferredUsername: string;
  NAVident: string;
  isAdmin: boolean;
}

export type ByggerRequest = Request & {
  getUser?: () => ByggerUser;
};
