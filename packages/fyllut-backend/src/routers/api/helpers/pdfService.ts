import {
  I18nTranslationMap,
  I18nTranslationReplacements,
  NavFormType,
  Submission,
  translationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import correlator from 'express-correlation-id';
import FormData from 'form-data';
import { readFileSync } from 'fs';
import path from 'path';
import { config } from '../../../config/config';
import { logger } from '../../../logger';
import { appMetrics } from '../../../services';
import { synchronousResponseToError } from '../../../utils/errorHandling';
import fetchWithRetry, { HeadersInit } from '../../../utils/fetchWithRetry';
import { createHtmlFromSubmission } from './htmlBuilder';

export const createPdfAsByteArray = async (
  accessToken: string,
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translations: I18nTranslationMap,
  language: string,
) => {
  return await createPdfFromGotenberg(accessToken, form, submission, submissionMethod, translations, language);
};

export const createPdf = async (
  accessToken: string,
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translations: I18nTranslationMap,
  language: string,
) => {
  const pdf = await createPdfFromGotenberg(accessToken, form, submission, submissionMethod, translations, language);
  return Buffer.from(new Uint8Array(pdf));
};

const footer: string =
  '<html>\n' +
  '<head>\n' +
  '    <style>\n' +
  '    body {\n' +
  '        font-size: 9px;\n' +
  '\t    margin-top: 24px;\n' +
  '\t\tmargin-left: 0px;\n' +
  '    }\n' +
  '\t.left {\n' +
  '\t\ttext-align: left;\n' +
  '\t\tfloat:left;\n' +
  '\t}\n' +
  '\t.right {\n' +
  '\t\ttext-align: right;\n' +
  '\t\tfloat: right;\n' +
  '\t}\n' +
  '    </style>\n' +
  '</head>\n' +
  '<body>\n' +
  '<p class="left"><span>Generert 16. Nov 2024 kl 14:30: </span></p>\n' +
  '<p class="right"><span class="pageNumber"></span> av <span class="totalPages"></span></p>\n' +
  '</body>\n' +
  '</html>';

const filePath = path.join(process.cwd(), '/icons/nav-logo.svg');

const navIcon = readFileSync(filePath, { encoding: 'utf-8', flag: 'r' });

export const createPdfFromGotenberg = async (
  accessToken: string,
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translations: I18nTranslationMap,
  language: string,
) => {
  const translate = (text: string, textReplacements?: I18nTranslationReplacements) =>
    translationUtils.translateWithTextReplacements({
      translations,
      originalText: text,
      params: textReplacements,
      currentLanguage: language,
    });

  const html = createHtmlFromSubmission(form, submission, submissionMethod, translate, language);
  if (!html || Object.keys(html).length === 0) {
    throw Error('Missing HTML for generating PDF.');
  }
  //const { fodselsnummerDNummerSoker } = submission.data;
  appMetrics.exstreamPdfRequestsCounter.inc();
  let errorOccurred = false;
  const stopMetricRequestDuration = appMetrics.outgoingRequestDuration.startTimer({
    service: 'gotenberg',
    method: 'createPdfFromGotenberg',
  });
  const assets = {};
  const options = { pdfa: true, pdfua: true };
  const gotenbergUrl = config.gotenbergUrl;
  try {
    return await createPdfCallingGotenberg(accessToken, gotenbergUrl, html, assets, options);
  } catch (e) {
    errorOccurred = true;
    appMetrics.exstreamPdfFailuresCounter.inc();
    throw e;
  } finally {
    const durationSeconds = stopMetricRequestDuration({ error: String(errorOccurred) });
    logger.info(`Request to gotenberg pdf service completed after ${durationSeconds} seconds`, {
      error: errorOccurred,
      durationSeconds,
    });
  }
};

const createPdfCallingGotenberg = async (
  azureAccessToken: string,
  gotenbergUrl: string,
  html: string,
  assets: { [filename: string]: string },
  options: { pdfa: boolean; pdfua: boolean },
): Promise<any> => {
  const formData = new FormData();

  // Add the main HTML content
  formData.append('files', Buffer.from(html), 'index.html');
  formData.append('files', Buffer.from(footer), 'footer.html');
  if (navIcon != null) {
    formData.append('files', Buffer.from(navIcon), 'Nav-logo.svg');
  }

  // Add optional assets like logos, footers, etc.
  for (const [filename, content] of Object.entries(assets)) {
    formData.append('files', Buffer.from(content), filename);
  }

  // Add Gotenberg-specific options
  formData.append('pdfa', options.pdfa ? 'PDF/A-1b' : '');
  formData.append('pdfua', options.pdfua ? 'true' : '');
  formData.append('skipNetworkIdleEvent', 'false');

  // Send the request to Gotenberg
  const gotenbergResponse = await fetchWithRetry(`${gotenbergUrl}/forms/chromium/convert/html`, {
    retry: 3,
    headers: {
      ...formData.getHeaders(),
      //Authorization: `Bearer ${azureAccessToken}`,
      'x-correlation-id': correlator.getId(),
    } as HeadersInit,
    method: 'POST',
    body: formData,
  });

  if (!gotenbergResponse.ok) {
    const errorText = await gotenbergResponse.text();
    console.error('Gotenberg error response:', errorText);
    throw synchronousResponseToError(
      `Feil i responsdata fra Gotenberg på id "${correlator.getId()}"`,
      errorText,
      gotenbergResponse.status,
      gotenbergResponse.url,
      true,
    );
  }

  const pdfBuffer = gotenbergResponse.arrayBuffer();
  return pdfBuffer;
};
