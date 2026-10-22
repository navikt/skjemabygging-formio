import { NextFunction, Request, Response } from 'express';
import { createRemoteJWKSet, errors, jwtVerify } from 'jose';
import { config } from '../config/config';
import { logger } from '../logger';
import { appMetrics } from '../services';
import { IdportenTokenPayload } from '../types/custom';

const { isDevelopment, mockIdportenJwt, mockIdportenPid } = config;

const getIdportenRemoteJWKSet = createRemoteJWKSet(new URL(config.idporten!.idportenJwksUri));

const verifyToken = async (token: string): Promise<IdportenTokenPayload> => {
  const verified = await jwtVerify(token, getIdportenRemoteJWKSet, {
    algorithms: ['RS256'],
    issuer: config.idporten!.idportenIssuer,
  });
  return verified.payload as IdportenTokenPayload;
};

const isInvalidIdportenJwt = (err: unknown): boolean =>
  err instanceof errors.JOSEError &&
  err.constructor !== errors.JOSEError &&
  !(err instanceof errors.JWKSTimeout || err instanceof errors.JWKSInvalid || err instanceof errors.JWKInvalid);

const idportenAuthHandler = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');

  if (isDevelopment) {
    logger.debug('Mocking idporten jwt and pid');
    req.getIdportenJwt = () => mockIdportenJwt;
    req.getIdportenPid = () => mockIdportenPid!;
  } else if (authHeader) {
    const token = /^Bearer (\S+)$/i.exec(authHeader)?.[1];
    if (!token) {
      return res.sendStatus(401);
    }

    logger.debug('Verifying jwt...');
    let tokenContent: IdportenTokenPayload;
    const stopTimer = appMetrics.idportenVerifyTokenDuration.startTimer();
    try {
      tokenContent = await verifyToken(token);
    } catch (err) {
      if (isInvalidIdportenJwt(err)) {
        logger.warn('Failed to verify ID-porten JWT');
        return res.sendStatus(401);
      }
      return next(err);
    } finally {
      stopTimer();
    }
    const currentTime = new Date().getTime() / 1000;
    const expired = tokenContent.exp! - 10 < currentTime;
    const idportenClientIdMismatch = tokenContent.client_id !== config.idporten!.idportenClientId;
    const wrongSecurityLevel = tokenContent.acr !== 'Level4' && tokenContent.acr !== 'idporten-loa-high';
    if (expired || idportenClientIdMismatch || wrongSecurityLevel) {
      logger.debug('Validation of jwt failed', {
        jwtErrors: {
          expired,
          idportenClientIdMismatch,
          wrongSecurityLevel,
        },
      });
      return res.sendStatus(401);
    }

    logger.debug('Validation of jwt succeeded');
    req.getIdportenJwt = () => token;
    req.getIdportenPid = () => tokenContent.pid;
  } else if (req.header('Fyllut-Submission-Method') === 'digital') {
    logger.debug('Missing jwt');
    return res.sendStatus(401);
  }

  next();
};

export default idportenAuthHandler;
