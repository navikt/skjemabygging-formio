import { renderApplicationPdf } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, Response } from 'express';
import fetch from 'node-fetch';
import { logger } from '../../logger';
import { getIdportenPid, getTokenxAccessToken } from '../../security/tokenHelper';
import { applicationPdfService, formService, translationService } from '../../services';
import { LogMetadata } from '../../types/log';
import { base64Decode } from '../../utils/base64';
import { responseToError } from '../../utils/errorHandling';
import { getFyllutUrl } from '../../utils/url';
import { assembleSendInnSoknadBody, isNotFound, sanitizeInnsendingsId, validateInnsendingsId } from './helpers/sendInn';

import { config } from '../../config/config';

const { sendInnConfig } = config;

const sendInnUtfyltSoknad = {
  put: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const idportenPid = getIdportenPid(req);
      const tokenxAccessToken = getTokenxAccessToken(req);
      const fyllutUrl = getFyllutUrl(req);
      const envQualifier = req.getEnvQualifier();

      const { formPath, submission, language, innsendingsId, submissionMethod } = req.body;
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

      const form = await formService.getForm({
        formPath,
        select: ['skjemanummer', 'title', 'path', 'properties', 'components'],
      });

      const logMeta: LogMetadata = {
        innsendingsId: sanitizedInnsendingsId,
        skjemanummer: form?.properties?.skjemanummer,
        language,
        fyllutRequestPath: req.path,
      };
      if (!['nb', 'nn', 'en'].includes(language)) {
        logger.warn(`Language code "${language}" is not supported. Language code will be defaulted to "nb".`, logMeta);
      }

      const translations = await translationService.getTranslations({ formPath, languageCodes: [language] });

      const pdfFormData = renderApplicationPdf({
        form,
        submission,
        language,
        translations,
        submissionMethod,
        appConfig: { config: { gitVersion: config.gitVersion } },
      });

      const applicationPdfBase64 = await applicationPdfService.createPdf({
        accessToken: req.headers.PdfAccessToken as string,
        pdfFormData,
      });
      const applicationPdf = base64Decode(applicationPdfBase64);
      if (!applicationPdf) {
        throw new Error('Generering av søknads PDF feilet');
      }
      const pdfByteArray = Array.from(applicationPdf) ?? [];

      const body = assembleSendInnSoknadBody({ ...req.body, form, translations }, idportenPid, fyllutUrl, pdfByteArray);

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
