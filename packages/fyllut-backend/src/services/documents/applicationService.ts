import {
  I18nTranslationReplacements,
  NavFormType,
  Submission,
  yourInformationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import correlator from 'express-correlation-id';
import { Response } from 'node-fetch';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { createFeltMapFromSubmission } from '../../routers/api/helpers/feltMapBuilder';
import { synchronousResponseToError } from '../../utils/errorHandling';
import fetchWithRetry, { HeadersInit } from '../../utils/fetchWithRetry';
import { appMetrics } from '../index';

const { familiePdfGeneratorUrl } = config;

const createPdfFromFieldMap = async (
  accessToken: string,
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translate: (text: string, textReplacements?: I18nTranslationReplacements) => string,
  language: string,
) => {
  const yourInformation = yourInformationUtils.getYourInformation(form, submission.data);

  let identityNumber: string;
  if (yourInformation?.identitet?.identitetsnummer) {
    identityNumber = yourInformation.identitet.identitetsnummer;
  } else if (submission.data.fodselsnummerDNummerSoker) {
    // This is the old format of the object, which is still used in some forms.
    identityNumber = submission.data.fodselsnummerDNummerSoker as string;
  } else {
    identityNumber = '—';
  }

  logger.info(`Creating PDF from field map, calling ${familiePdfGeneratorUrl}/api/pdf/v3/opprett-pdf`);

  appMetrics.familiePdfRequestsCounter.inc();
  let errorOccurred = false;
  const stopMetricRequestDuration = appMetrics.outgoingRequestDuration.startTimer({
    service: 'familiepdf',
    method: 'createPdf',
  });
  let response: Response | undefined;
  try {
    response = await fetchWithRetry(`${familiePdfGeneratorUrl}/api/pdf/v3/opprett-pdf`, {
      retry: 3,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'x-correlation-id': correlator.getId(),
        'Content-Type': 'application/json',
        accept: '*/*',
      } as HeadersInit,
      method: 'POST',
      body: createFeltMapFromSubmission(form, submission, submissionMethod, translate, language, identityNumber),
    });
  } catch (e) {
    errorOccurred = true;
    appMetrics.familiePdfFailuresCounter.inc();
    throw e;
  } finally {
    const error = errorOccurred || !response?.ok;
    const durationSeconds = stopMetricRequestDuration({ error: String(error) });
    logger.info(`Request to familie pdf service completed after ${durationSeconds} seconds`, {
      error,
      durationSeconds,
    });
  }

  if (response?.ok) {
    return Buffer.from(await response.arrayBuffer());
  }

  appMetrics.familiePdfFailuresCounter.inc();
  logger.error('Request to familie pdf service failed', {});

  throw synchronousResponseToError('Feil ved generering av PDF via feltMap', {}, response?.status, response?.url, true);
};

const applicationService = {
  createPdfFromFieldMap,
};

export default applicationService;
