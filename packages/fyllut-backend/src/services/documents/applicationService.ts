import {
  I18nTranslationReplacements,
  localizationUtils,
  NavFormType,
  Submission,
  yourInformationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import correlator from 'express-correlation-id';
import { config } from '../../config/config';
import { logger } from '../../logger';
import { createFeltMapFromSubmission } from '../../routers/api/helpers/feltMapBuilder';
import { createHtmlFromSubmission } from '../../routers/api/helpers/htmlBuilder';
import { base64Decode, base64Encode } from '../../utils/base64';
import { responseToError, synchronousResponseToError } from '../../utils/errorHandling';
import fetchWithRetry, { HeadersInit } from '../../utils/fetchWithRetry';
import { appMetrics } from '../index';
//import {writeFileSync} from "node:fs";
//import path from "path";

const { skjemabyggingProxyUrl, gitVersion, familiePdfGenerator } = config;

const createPdfAsByteArray = async (
  accessToken: string,
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translate: (text: string, textReplacements?: I18nTranslationReplacements) => string,
  language: string,
) => {
  const pdf = await createPdf(accessToken, form, submission, submissionMethod, translate, language);
  return Array.from(base64Decode(pdf.data) ?? []);
};

const createPdf = async (
  accessToken: string,
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translate: (text: string, textReplacements?: I18nTranslationReplacements) => string,
  language: string,
) => {
  if (!['nb-NO', 'nn-NO', 'en'].includes(language)) {
    logger.warn(`Language code "${language}" is not supported. Language code will be defaulted to "nb".`);
  }

  const html = createHtmlFromSubmission(form, submission, submissionMethod, translate, language);
  if (!html || Object.keys(html).length === 0) {
    throw Error('Missing HTML for generating PDF.');
  }

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

  appMetrics.exstreamPdfRequestsCounter.inc();
  let errorOccurred = false;
  const stopMetricRequestDuration = appMetrics.outgoingRequestDuration.startTimer({
    service: 'exstream',
    method: 'createPdf',
  });
  try {
    return await createPdfFromHtml(
      accessToken,
      translate(form.title),
      form.properties.skjemanummer,
      language,
      html,
      identityNumber,
    );
  } catch (e) {
    errorOccurred = true;
    appMetrics.exstreamPdfFailuresCounter.inc();
    throw e;
  } finally {
    const durationSeconds = stopMetricRequestDuration({ error: String(errorOccurred) });
    logger.info(`Request to exstream pdf service completed after ${durationSeconds} seconds`, {
      error: errorOccurred,
      durationSeconds,
    });
  }
};

const createPdfFromHtml = async (
  azureAccessToken: string,
  title: string,
  skjemanummer: string,
  language: string,
  html: string,
  pid: string,
) => {
  const languageCode = localizationUtils.getLanguageCodeAsIso639_1(language);

  logger.debug('Create pdf with exstream', {
    dokumentTittel: title,
    spraakkode: languageCode,
    blankettnr: skjemanummer,
    skjemaversjon: gitVersion,
  });

  const response = await fetchWithRetry(`${skjemabyggingProxyUrl}/exstream`, {
    retry: 3,
    headers: {
      Authorization: `Bearer ${azureAccessToken}`,
      'x-correlation-id': correlator.getId(),
      'Content-Type': 'application/json',
    } as HeadersInit,
    method: 'POST',
    body: JSON.stringify({
      content: {
        contentType: 'application/json',
        data: base64Encode(
          JSON.stringify({
            dokumentTittel: title,
            spraakkode: languageCode,
            blankettnr: skjemanummer,
            brukersFnr: pid,
            skjemaversjon: gitVersion,
            html: base64Encode(html),
          }),
        ),
        async: 'true',
      },
      RETURNFORMAT: 'PDF',
      RETURNDATA: 'TRUE',
    }),
  });

  if (response.ok) {
    const json: any = await response.json();
    if (!json.data?.result?.[0]?.content) {
      if (json.data?.id) {
        throw synchronousResponseToError(
          `Feil i responsdata fra Exstream på id "${json.data?.id}"`,
          json,
          response.status,
          response.url,
          true,
        );
      } else {
        throw synchronousResponseToError('Feil i responsdata fra Exstream', json, response.status, response.url, true);
      }
    }
    return json.data.result[0].content;
  }

  throw await responseToError(response, 'Feil ved generering av PDF hos Exstream', true);
};

const createPdfFromFieldMap = async (
  accessToken: string,
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translate: (text: string, textReplacements?: I18nTranslationReplacements) => string,
  language: string,
) => {
  if (!['nb-NO', 'nn-NO', 'en'].includes(language)) {
    logger.warn(`Language code "${language}" is not supported. Language code will be defaulted to "nb".`);
  }
  //const feltMapString = createFeltMapFromSubmission(form, submission, submissionMethod, translate, language );

  const response = await fetchWithRetry(`${familiePdfGenerator}/api/v1/pdf/opprett-pdf`, {
    retry: 3,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-correlation-id': correlator.getId(),
      'Content-Type': 'application/json',
      accept: '*/*',
    } as HeadersInit,
    method: 'POST',
    body: createFeltMapFromSubmission(form, submission, submissionMethod, translate, language),
  });

  if (response.ok) {
    logger.info(`Request to familie pdf service completed`, {});

    /*
    const filePath = path.join(process.cwd(), `/src/${form.properties.skjemanummer}.pdf`);
    writeFileSync(filePath, Buffer.from(await response.arrayBuffer()), {
      flag: "w"
    });
*/

    return Buffer.from(await response.arrayBuffer());
  }

  logger.error(`Request to familie pdf service failed`, {});

  throw synchronousResponseToError('Feil ved generering av PDF via feltMap', {}, response.status, response.url, true);
};

const applicationService = {
  createPdf,
  createPdfAsByteArray,
  createPdfFromFieldMap,
};

export default applicationService;
