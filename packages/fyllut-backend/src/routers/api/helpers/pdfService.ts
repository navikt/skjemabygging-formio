import { I18nTranslationMap, NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import correlator from 'express-correlation-id';
import { config } from '../../../config/config';
import { logger } from '../../../logger';
import { appMetrics } from '../../../services';
import { base64Decode, base64Encode } from '../../../utils/base64';
import { responseToError, synchronousResponseToError } from '../../../utils/errorHandling';
import fetchWithRetry, { HeadersInit } from '../../../utils/fetchWithRetry';
import { createHtmlFromSubmission } from './htmlBuilder';

const { skjemabyggingProxyUrl, gitVersion } = config;

export const createPdfAsByteArray = async (
  accessToken: string,
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translations: I18nTranslationMap,
  language: string,
) => {
  const pdf = await createPdf(accessToken, form, submission, submissionMethod, translations, language);
  return Array.from(base64Decode(pdf.data) ?? []);
};

export const createPdf = async (
  accessToken: string,
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translations: I18nTranslationMap,
  language: string,
) => {
  const translate = (text: string): string => translations[text] || text;
  const html = createHtmlFromSubmission(form, submission, submissionMethod, translate, language);
  if (!html || Object.keys(html).length === 0) {
    throw Error('Missing HTML for generating PDF.');
  }
  const { fodselsnummerDNummerSoker } = submission.data;
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
      (fodselsnummerDNummerSoker as string | undefined) || '—',
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

export const createPdfFromHtml = async (
  azureAccessToken: string,
  title: string,
  skjemanummer: string,
  language: string,
  html: string,
  pid: string,
) => {
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
            spraakkode: language,
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
      throw synchronousResponseToError('Feil i responsdata fra Exstream', json, response.status, response.url, true);
    }
    return json.data.result[0].content;
  }

  throw await responseToError(response, 'Feil ved generering av PDF hos Exstream', true);
};
