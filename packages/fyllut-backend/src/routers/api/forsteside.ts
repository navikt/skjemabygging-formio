import { ForstesideRequestBody, Mottaksadresse } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import correlator from 'express-correlation-id';
import fetch, { BodyInit, HeadersInit } from 'node-fetch';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { responseToError } from '../../utils/errorHandling.js';
import { loadMottaksadresser } from './mottaksadresser';

const { skjemabyggingProxyUrl } = config;

const forsteside = {
  post: async (req: Request, res: Response, next: NextFunction) => {
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
  if (forsteside.tema && !forsteside.adresse) {
    const mottaksadresser: Mottaksadresse[] = await loadMottaksadresser();
    const addresses = mottaksadresser
      .map((mottaksadresse) => mottaksadresse.data)
      .filter((mottaksadresseData) => mottaksadresseData.temakoder?.includes(forsteside.tema));

    if (addresses.length > 0) {
      forsteside.adresse = {
        adresselinje1: addresses[0].adresselinje1,
        adresselinje2: addresses[0].adresselinje2,
        adresselinje3: addresses[0].adresselinje3,
        postnummer: addresses[0].postnummer,
        poststed: addresses[0].poststed,
      };

      if (addresses.length > 1) {
        console.warn(`Multiple addresses setup with theme: ${forsteside.tema}`);
      }
    }
  }

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
