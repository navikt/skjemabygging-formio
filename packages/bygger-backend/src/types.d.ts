import { Request } from 'express';

interface User {
  name: string;
  preferredUsername: string;
  NAVident: string;
}

export type ByggerRequest = Request & {
  getUser?: () => User;
};
