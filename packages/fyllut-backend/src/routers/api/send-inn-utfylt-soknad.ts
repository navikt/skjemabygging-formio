import { applicationPdfService } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { getIdportenPid, getTokenxAccessToken } from '../../security/tokenHelper';
import { LogMetadata } from '../../types/log';
import { base64Decode } from '../../utils/base64';
import { responseToError } from '../../utils/errorHandling';
import { getFyllutUrl } from '../../utils/url';
import { assembleSendInnSoknadBody, isNotFound, sanitizeInnsendingsId, validateInnsendingsId } from './helpers/sendInn';

const { familiePdfGeneratorUrl, sendInnConfig } = config;

const sendInnUtfyltSoknad = {
  put: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);
      const fyllutUrl = getFyllutUrl(req);
      const envQualifier = req.getEnvQualifier();

      const { form, pdfFormData, language, innsendingsId } = req.body;
      if (!req.headers.PdfAccessToken) {
        logger.warn('Azure access token is missing. Will be unable to generate pdf');
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

      const logMeta: LogMetadata = {
        innsendingsId: sanitizedInnsendingsId,
        skjemanummer: form?.properties?.skjemanummer,
        language,
        fyllutRequestPath: req.path,
      };
      if (!['nb-NO', 'nn-NO', 'en'].includes(language)) {
        logger.warn(`Language code "${language}" is not supported. Language code will be defaulted to "nb".`, logMeta);
      }

      const applicationPdfBase64 = await applicationPdfService.createPdf({
        baseUrl: familiePdfGeneratorUrl,
        accessToken: req.headers.PdfAccessToken as string,
        pdfFormData,
      });
      const applicationPdf = base64Decode(applicationPdfBase64);
      if (!applicationPdf) {
        throw new Error('Generering av søknads PDF feilet');
      }
      const pdfByteArray = Array.from(applicationPdf) ?? [];

      const body = assembleSendInnSoknadBody(req.body, idportenPid, fyllutUrl, pdfByteArray);

      const sendInnResponse = await fetch(
        `${sendInnConfig.host}${sendInnConfig.paths.utfyltSoknad}/${sanitizedInnsendingsId}`,
        {
          method: 'PUT',
          redirect: 'manual',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenxAccessToken}`,
            ...(envQualifier && { 'Nav-Env-Qualifier': envQualifier }),
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
          logger.info(`${sanitizedInnsendingsId}: Not found. Failed to submit`, responseError);
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
