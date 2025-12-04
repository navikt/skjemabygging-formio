import { JwtToken } from './types';

const parseToken = <T = JwtToken>(token: string | undefined): T | undefined => {
  if (!token) {
    return undefined;
  }
  const payload = token.split('.')[1];
  const decodedPayload = atob(payload);
  return JSON.parse(decodedPayload) as T;
};

const tokenUtils = {
  parseToken,
};

export type { JwtToken };

export default tokenUtils;
