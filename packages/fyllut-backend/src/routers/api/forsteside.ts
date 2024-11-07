import { ForstesideRequestBody } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import correlator from 'express-correlation-id';
import fetch, { BodyInit, HeadersInit } from 'node-fetch';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { responseToError } from '../../utils/errorHandling.js';

const { skjemabyggingProxyUrl } = config;

/*
 * TODO: This version of forsteside is deprecated. When all consumers have changed to /v2/forsteside we can remove this file
 **/
const forsteside = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    console.log('forsteside body', req.body);
    try {
      const forsteside = await validateForstesideRequest(req.body);
      const response = await forstesideRequest(req, JSON.stringify(forsteside));
      logForsteside(req.body, response);
      res.contentType('application/json');
      res.send(response);
    } catch (e) {
      next(e);
    }
  },
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

const logForsteside = (forsteside: ForstesideRequestBody, response: any) => {
  logger.info('Download frontpage', {
    loepenummer: JSON.parse(response).loepenummer,
    navSkjemaId: forsteside.navSkjemaId,
    tema: forsteside.tema,
    enhetsnummer: forsteside.enhetsnummer,
    spraakkode: forsteside.spraakkode,
  });
};

export default forsteside;

export { validateForstesideRequest };
