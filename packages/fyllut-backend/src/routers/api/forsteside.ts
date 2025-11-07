import { ForstesideRequestBody, ForstesideType } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import correlator from 'express-correlation-id';
import fetch, { BodyInit, HeadersInit } from 'node-fetch';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { appMetrics } from '../../services';
import { LogMetadata } from '../../types/log';
import { responseToError } from '../../utils/errorHandling.js';
import forstesideV2 from './forstesideV2';

const { skjemabyggingProxyUrl } = config;

/*
 * TODO: This version of forsteside is deprecated.
 * v2 is can be removed, but the default version is used by fyllut-ettersending
 * @deprecated
 **/
const forsteside = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.version === 'v2') {
      logger.warn(
        `Unexpected invocation of forstesideV2 (navSkjemaId=${req.body.navSkjemaId}, foerstesidetype=${req.body.foerstesidetype}).`,
      );
      await forstesideV2.post(req, res, next);
    } else {
      try {
        const requestBody = req.body as ForstesideRequestBody;
        if (requestBody.foerstesidetype === 'SKJEMA') {
          logger.warn(`Unexpected foerstesidetype SKJEMA (navSkjemaId=${requestBody.navSkjemaId}).`);
        }
        const forsteside = await validateForstesideRequest(requestBody);
        const response = await forstesideRequest(req, JSON.stringify(forsteside));
        logForsteside(req.body, response, {
          fyllutRequestPath: req.path,
        });
        appMetrics.paperSubmissionsCounter.inc({ source: resolveSource(requestBody.foerstesidetype) });
        res.contentType('application/json');
        res.send(response);
      } catch (e) {
        next(e);
      }
    }
  },
};

const resolveSource = (type?: ForstesideType) => {
  if (type) {
    switch (type) {
      case 'ETTERSENDELSE':
        return 'ettersending';
      case 'LOESPOST':
        return 'lospost';
    }
  }
  return '-';
};

const validateForstesideRequest = async (forsteside: ForstesideRequestBody) => {
  if (!forsteside.adresse && !forsteside.netsPostboks) {
    forsteside.netsPostboks = '1400';
  }

  if (forsteside.spraakkode && forsteside.spraakkode.match(/-/)) {
    switch (forsteside.spraakkode) {
      case 'nn-NO':
        forsteside.spraakkode = 'NN';
        break;
      case 'nb-NO':
        forsteside.spraakkode = 'NB';
        break;
      default:
        forsteside.spraakkode = 'EN';
        break;
    }
  } else if (forsteside.spraakkode) {
    forsteside.spraakkode = forsteside.spraakkode.toUpperCase();
  }

  return forsteside;
};

const forstesideRequest = async (req: Request, body?: BodyInit) => {
  const response = await fetch(`${skjemabyggingProxyUrl}/foersteside`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${req.headers.AzureAccessToken}`,
      'x-correlation-id': correlator.getId(),
    } as HeadersInit,
    body,
  });

  if (response.ok) {
    return response.text();
  }

  throw await responseToError(response, 'Feil ved generering av førsteside', true);
};

const logForsteside = (forsteside: ForstesideRequestBody, response: any, logMeta: LogMetadata) => {
  logger.info('Download cover page', {
    ...logMeta,
    loepenummer: JSON.parse(response).loepenummer,
    foerstesidetype: forsteside.foerstesidetype,
    skjemanummer: forsteside.navSkjemaId,
    tema: forsteside.tema,
    enhetsnummer: forsteside.enhetsnummer,
    spraakkode: forsteside.spraakkode,
  });
};

export default forsteside;

export { validateForstesideRequest };
