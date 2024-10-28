import { ForstesideRequestBody, forstesideUtils, Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import correlator from 'express-correlation-id';
import fetch, { BodyInit, HeadersInit } from 'node-fetch';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { base64Decode } from '../../utils/base64';
import { responseToError } from '../../utils/errorHandling.js';

const { skjemabyggingProxyUrl } = config;

const forsteside = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { form, submission, language, enhetNummer } = req.body;
      const formParsed = JSON.parse(form);
      const submissionParsed = JSON.parse(submission);

      const recipientsResponse = await fetch(`${config.formsApiUrl}/v1/recipients`, {
        method: 'GET',
        headers: {
          'x-correlation-id': correlator.getId() as string,
        },
      });
      if (!recipientsResponse.ok) {
        next(new Error('Failed to fetch recipients'));
      }

      const recipients = (await recipientsResponse.json()) as Recipient[] | undefined;
      const forstesideBody = forstesideUtils.genererFoerstesideData(
        formParsed,
        submissionParsed,
        language,
        recipients,
        enhetNummer,
      );
      const forsteside = await validateForstesideRequest(forstesideBody);
      const response: any = await forstesideRequest(req, JSON.stringify(forsteside));
      logForsteside(req.body, response);

      const fileName = encodeURIComponent(`Førstesideark_${formParsed.path}.pdf`);
      res.contentType('application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${fileName}`);
      res.send(base64Decode(response.foersteside));
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
    return response.json();
  }

  throw await responseToError(response, 'Feil ved generering av førsteside', true);
};

const logForsteside = (forsteside: ForstesideRequestBody, response: any) => {
  logger.info('Download frontpage', {
    loepenummer: response.loepenummer,
    navSkjemaId: forsteside.navSkjemaId,
    tema: forsteside.tema,
    enhetsnummer: forsteside.enhetsnummer,
    spraakkode: forsteside.spraakkode,
  });
};

export default forsteside;

export { validateForstesideRequest };
