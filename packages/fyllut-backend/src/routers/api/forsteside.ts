import { correlator, ForstesideRequestBody } from '@navikt/skjemadigitalisering-shared-backend';
import { CoverPageType } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import fetch, { BodyInit, HeadersInit } from 'node-fetch';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { appMetrics } from '../../services';
import { LogMetadata } from '../../types/log';
import { responseToError } from '../../utils/errorHandling';

const { skjemabyggingProxyUrl } = config;

/**
 * @deprecated This is the old endpoint used by fyllut-ettersending. Will be deleted when remove fyllut-ettersending.
 */
const forsteside = {
  post: async (req: Request, res: Response, next: NextFunction) => {
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
  },
};

const resolveSource = (type?: CoverPageType) => {
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
