import { Request } from 'express';

const getTokenxAccessToken = (req: Request) => {
  const tokenxAccessToken = req.getTokenxAccessToken ? req.getTokenxAccessToken() : null;
  if (!tokenxAccessToken) {
    throw new Error('Missing TokenX access token');
  }
  return tokenxAccessToken;
};

const getIdportenPid = (req: Request) => {
  const idportenPid = req.getIdportenPid ? req.getIdportenPid() : null;
  if (!idportenPid) {
    throw new Error('Missing idporten pid');
  }
  return idportenPid;
};

const getIsLoggedIn = (req: Request) => {
  const idportenPid = req.getIdportenPid ? req.getIdportenPid() : null;
  return !!idportenPid;
};

export { getIdportenPid, getIsLoggedIn, getTokenxAccessToken };
