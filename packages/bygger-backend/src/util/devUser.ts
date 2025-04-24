import { Request } from 'express';
import { User } from '../types/custom';

const devUser = {
  name: 'dev-user',
  preferredUsername: 'dev-user-preferred',
  NAVident: 'dev-navident',
  isAdmin: true,
};

export const getDevUser = async (_req: Request): Promise<User> => {
  return devUser;
};
