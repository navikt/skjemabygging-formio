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
import { config, defaultConfig } from '../../../config/config';
import { logger } from '../../../logger';
import { appMetrics } from '../../../services';
import { synchronousResponseToError } from '../../../utils/errorHandling';
//import fetch from 'node-fetch';
import fetchWithRetry from '../../../utils/fetchWithRetry';
import { generateFooterHtml } from './footerBuilder';
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

const filePath = path.join(process.cwd(), '', '/icons/nav-logo.svg');
//const filePath = '../../../../public/icons/nav-logo.svg';

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
  const { fodselsnummerDNummerSoker } = submission.data;
  const footerHtml = generateFooterHtml(
    (fodselsnummerDNummerSoker as string | undefined) || '—',
    defaultConfig.gitVersion,
    form.properties.skjemanummer,
    language,
    translate,
  );

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
    return await createPdfCallingGotenberg(accessToken, gotenbergUrl, html, footerHtml, assets, options);
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
  footer: string,
  assets: { [filename: string]: string },
  options: { pdfa: boolean; pdfua: boolean },
): Promise<any> => {
  const formData = new FormData();

  // Add the main HTML content
  formData.append('files', Buffer.from(html), 'index.html');
  formData.append('files', Buffer.from(footer), 'footer.html');
  if (navIcon != null) {
    formData.append('files', Buffer.from(navIcon), 'nav-logo.svg');
  }

  // Add optional assets like logos, footers, etc.
  for (const [filename, content] of Object.entries(assets)) {
    formData.append('files', Buffer.from(content), filename);
  }

  // Add Gotenberg-specific options
  formData.append('pdfa', options.pdfa ? 'PDF/A-1b' : '');
  formData.append('pdfua', options.pdfua ? 'true' : '');
  formData.append('skipNetworkIdleEvent', 'false');

  console.log(`${gotenbergUrl}/forms/chromium/convert/html`);

  try {
    // Send the request to Gotenberg
    const gotenbergResponse = await fetchWithRetry(`${gotenbergUrl}/forms/chromium/convert/html`, {
      retry: 3,
      headers: {
        ...formData.getHeaders(),
        //Authorization: `Bearer ${azureAccessToken}`,
        contentType: 'multipart/form-data',
        accept: 'application/pdf, text/plain',
      } as HeadersInit,
      method: 'POST',
      body: formData,
    });

    /*
    const gotenbergResponse = await fetch(`${gotenbergUrl}/forms/chromium/convert/html`, {
      method: 'POST',
      headers: {
        ...formData.getHeaders(),
        contentType: 'multipart/form-data',
        accept: 'application/pdf, text/plain',
      } as HeadersInit,
      body: formData,
    });
*/

    if (!gotenbergResponse.ok) {
      const errorText = await gotenbergResponse.text();
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
  } catch (e) {
    logger.error(`Request to gotenberg pdf service failed with  ${e}`);
    throw e;
  }
};
