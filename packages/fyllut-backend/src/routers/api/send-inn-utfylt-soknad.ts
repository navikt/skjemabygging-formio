import { localizationUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { getIdportenPid, getTokenxAccessToken } from '../../security/tokenHelper';
import { responseToError } from '../../utils/errorHandling';
import { createPdfAsByteArray } from './helpers/pdfService';
import {
  assembleSendInnSoknadBody,
  isMellomLagringEnabled,
  isNotFound,
  sanitizeInnsendingsId,
  validateInnsendingsId,
} from './helpers/sendInn';

const { featureToggles, sendInnConfig } = config;

const sendInnUtfyltSoknad = {
  put: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);

      const { form, submission, submissionMethod, translation, language, innsendingsId } = req.body;
      if (!req.headers.AzureAccessToken) {
        logger.error('Azure access token is missing. Unable to generate pdf');
      }

      const sanitizedInnsendingsId = sanitizeInnsendingsId(innsendingsId);
      const errorMessage = validateInnsendingsId(
        sanitizedInnsendingsId,
        'Kan ikke oppdatere mellomlagret søknad med ferdig utfylt versjon',
      );
      if (errorMessage) {
        next(new Error(errorMessage));
        return;
      }

      const pdfByteArray = await createPdfAsByteArray(
        req.headers.AzureAccessToken as string,
        form,
        submission,
        submissionMethod,
        translation,
        localizationUtils.getLanguageCodeAsIso639_1(language),
      );

      const body = assembleSendInnSoknadBody(req.body, idportenPid, pdfByteArray);

      if (!isMellomLagringEnabled(featureToggles)) {
        res.json(body);
        return;
      }

      const sendInnResponse = await fetch(
        `${sendInnConfig.host}${sendInnConfig.paths.utfyltSoknad}/${sanitizedInnsendingsId}`,
        {
          method: 'PUT',
          redirect: 'manual',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenxAccessToken}`,
          },
          body: JSON.stringify(body),
        },
      );

      if (sendInnResponse.ok || sendInnResponse.status === 302) {
        const location = sendInnResponse.headers.get('location');
        logger.debug(`Successfylly posted data to SendInn (location: ${location})`);
        res.header({
          'Access-Control-Expose-Headers': 'Location',
          Location: location,
        });
        res.sendStatus(201);
      } else {
        const responseError = await responseToError(sendInnResponse, 'Feil ved kall til SendInn', true);
        if (isNotFound(sendInnResponse, responseError)) {
          return res.sendStatus(404);
        }

        logger.debug('Failed to post data to SendInn');
        next(responseError);
      }
    } catch (err) {
      next(err);
    }
  },
};

export default sendInnUtfyltSoknad;
