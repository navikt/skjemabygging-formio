import { Request } from 'express';
import { formioService } from '../services';
import { User } from '../types/custom';
import { getFormioToken } from './requestTool';

const devUser = {
  name: 'dev-user',
  preferredUsername: 'dev-user-preferred',
  NAVident: 'dev-navident',
  isAdmin: true,
};

export const getDevUser = async (req: Request): Promise<User> => {
  const formioToken = getFormioToken(req);
  if (formioToken) {
    try {
      const formioUser: any = await formioService.getFormioUser(formioToken);
      return {
        name: formioUser.data.email,
        preferredUsername: formioUser.data.email,
        NAVident: 'N/A',
        isAdmin: true,
      };
    } catch (e) {
      console.error('Error while fetching dev user:', (e as Error).message);
    }
  }
  return devUser;
};
