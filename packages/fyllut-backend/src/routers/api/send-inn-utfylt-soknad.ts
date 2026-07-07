import { renderApplicationPdf } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, Response } from 'express';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { getIdportenPid, getTokenxAccessToken } from '../../security/tokenHelper';
import { applicationPdfService, applicationService, formService, translationService } from '../../services';
import { LogMetadata } from '../../types/log';
import { requireBase64Decode } from '../../utils/base64';
import { getFyllutUrl } from '../../utils/url';
import { assembleSendInnSoknadBody, sanitizeInnsendingsId, validateInnsendingsId } from './helpers/sendInn';

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
      const applicationPdf = requireBase64Decode(applicationPdfBase64, 'Failed to decode generated application PDF');
      const pdfByteArray = Array.from(applicationPdf) ?? [];

      const body = assembleSendInnSoknadBody({ ...req.body, form, translations }, idportenPid, fyllutUrl, pdfByteArray);
      const response = await applicationService.submitUtfyltSoknad({
        accessToken: tokenxAccessToken,
        body,
        envQualifier,
        innsendingsId: sanitizedInnsendingsId,
      });

      if (response.status === 302 || (response.status >= 200 && response.status < 300)) {
        const { location } = response;
        logger.debug(`Successfylly posted data to SendInn (location: ${location})`);
        if (location) {
          res.header({
            'Access-Control-Expose-Headers': 'Location',
            Location: location,
          });
        }
        res.sendStatus(201);
      } else {
        next(new Error('Unexpected response from SendInn while submitting utfylt soknad'));
      }
    } catch (error) {
      next(error);
    }
  },
};

export default sendInnUtfyltSoknad;
