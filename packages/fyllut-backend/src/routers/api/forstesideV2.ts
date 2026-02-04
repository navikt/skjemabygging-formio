import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import {
  FormPropertiesType,
  ForstesideRequestBody,
  forstesideUtils,
  Recipient,
} from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import fetch, { BodyInit, HeadersInit } from 'node-fetch';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { LogMetadata } from '../../types/log';
import { base64Decode } from '../../utils/base64';
import { responseToError } from '../../utils/errorHandling';

const { skjemabyggingProxyUrl, formsApiUrl } = config;

const forstesideV2 = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { form, submissionData, language, enhetNummer } = req.body;
      const formParsed = JSON.parse(form);
      const submissionDataParsed = JSON.parse(submissionData);

      const recipients = await getRecipients(formParsed?.properties);

      const forstesideBody = forstesideUtils.genererFoerstesideData(
        formParsed,
        submissionDataParsed,
        language,
        recipients,
        enhetNummer,
      );

      const response: any = await forstesideRequest(req, JSON.stringify(forstesideBody));
      logForsteside(req.body, response, {
        fyllutRequestPath: req.path,
      });

      const fileName = encodeURIComponent(`Førstesideark_${formParsed.path}.pdf`);
      res.contentType('application/pdf');
      res.setHeader('Content-Disposition', `inline; filename=${fileName}`);
      res.send(base64Decode(response.foersteside));
    } catch (e) {
      next(e);
    }
  },
};

const getRecipients = async (formProperties: FormPropertiesType): Promise<Recipient[] | undefined> => {
  if (formProperties.mottaksadresseId) {
    const recipientsResponse = await fetch(`${formsApiUrl}/v1/recipients`, {
      method: 'GET',
      headers: {
        'x-correlation-id': correlator.getId() as string,
      },
    });
    if (!recipientsResponse.ok) {
      throw new Error('Failed to fetch recipients');
    }

    return (await recipientsResponse.json()) as Recipient[] | undefined;
  }
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

const logForsteside = (forsteside: ForstesideRequestBody, response: any, logMeta: LogMetadata) => {
  logger.info('Download cover page', {
    ...logMeta,
    loepenummer: response.loepenummer,
    foerstesidetype: forsteside.foerstesidetype,
    skjemanummer: forsteside.navSkjemaId,
    tema: forsteside.tema,
    enhetsnummer: forsteside.enhetsnummer,
    spraakkode: forsteside.spraakkode,
  });
};

export default forstesideV2;
