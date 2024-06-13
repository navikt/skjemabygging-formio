import { SpanKind, SpanStatusCode, context, trace } from '@opentelemetry/api';
import { NextFunction, Request, Response } from 'express';
import { FlattenedJWSInput, JWSHeaderParameters, createRemoteJWKSet, jwtVerify } from 'jose';
import { GetKeyFunction } from 'jose/dist/types/types';
import { config } from '../config/config';
import { logger } from '../logger.js';
import { IdportenTokenPayload } from '../types/custom';

const { isDevelopment, mockIdportenJwt, mockIdportenPid } = config;

const getIdportenRemoteJWKSet: GetKeyFunction<JWSHeaderParameters, FlattenedJWSInput> = createRemoteJWKSet(
  new URL(config.idporten!.idportenJwksUri),
);

const verifyToken = async (token: string): Promise<IdportenTokenPayload> => {
  const verified = await jwtVerify(token, getIdportenRemoteJWKSet, {
    algorithms: ['RS256'],
    issuer: config.idporten!.idportenIssuer,
  });
  return verified.payload as IdportenTokenPayload;
};

const idportenAuthHandler = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization');

  if (isDevelopment) {
    logger.debug('Mocking idporten jwt and pid');
    req.getIdportenJwt = () => mockIdportenJwt;
    req.getIdportenPid = () => mockIdportenPid!;
  } else if (authHeader) {
    const activeSpan = trace.getSpan(context.active());
    if (activeSpan) {
      const { spanId, traceId, traceState } = activeSpan.spanContext();
      logger.info(`Active span :: spanId=${spanId} traceId=${traceId} traceState=${traceState || '<undefined>'}`);
    } else {
      logger.info('No active span');
    }

    const tracer = trace.getTracer(process.env.NAIS_APP_NAME!);
    const spanOptions = {
      kind: SpanKind.SERVER,
    };
    const authorized = await tracer.startActiveSpan('idporten.auth', spanOptions, async (span) => {
      try {
        const token = authHeader.split(' ')[1];

        logger.debug('Verifying jwt...');
        let tokenContent: IdportenTokenPayload;
        try {
          tokenContent = await verifyToken(token);
        } catch (err) {
          logger.warn('Failed to verify jwt signature', err);
          return false;
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
          return false;
        }

        logger.debug('Validation of jwt succeeded');
        req.getIdportenJwt = () => token;
        req.getIdportenPid = () => tokenContent.pid;
        return true;
      } catch (err: any) {
        span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
        throw err;
      } finally {
        span.end();
      }
    });
    if (!authorized) {
      return res.sendStatus(401);
    }
  } else if (req.header('Fyllut-Submission-Method') === 'digital') {
    logger.debug('Missing jwt');
    return res.sendStatus(401);
  }

  next();
};

export default idportenAuthHandler;
