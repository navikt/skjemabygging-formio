import {
  I18nTranslationMap,
  I18nTranslationReplacements,
  NavFormType,
  Submission,
  translationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import FormData from 'form-data';
//import { readFileSync } from 'fs';
//import path from 'path';
import { config } from '../../../config/config';
import { logger } from '../../../logger';
import { appMetrics } from '../../../services';
import { callGotenberg } from './gotenbergService';
//import { synchronousResponseToError } from '../../../utils/errorHandling';
//import fetch from 'node-fetch';
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
  return await buildHtmlAndConvertToPdf(accessToken, form, submission, submissionMethod, translations, language);
};

export const buildHtmlAndCreatePdf = async (
  accessToken: string,
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translations: I18nTranslationMap,
  language: string,
) => {
  const pdf = await buildHtmlAndConvertToPdf(accessToken, form, submission, submissionMethod, translations, language);
  return Buffer.from(new Uint8Array(pdf));
};

/* Feiler ved deploy: Error: ENOENT: no such file or directory, open '/home/runner/work/skjemabygging-formio/skjemabygging-formio/packages/fyllut-backend/dist/src/routers/api/helpers/nav-icon.svg'
const filePath = path.join(process.cwd(), '/src/routers/api/helpers/nav-icon.svg');
const navIcon = readFileSync(filePath, { encoding: 'utf-8', flag: 'r' });
*/
const navIcon = undefined;

const buildHtmlAndConvertToPdf = async (
  accessToken: string,
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translations: I18nTranslationMap,
  language: string,
) => {
  // Build Html from submission
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

  // Build Footer
  const { fodselsnummerDNummerSoker } = submission.data;
  const footerHtml = generateFooterHtml(
    (fodselsnummerDNummerSoker as string | undefined) || '—',
    config.gitVersion,
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
  try {
    return await createPdfFromHtml(html, footerHtml, assets, options);
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

// Sette opp formdata med html og footer for å generere PDF v.hj.a Gotenberg.
const createPdfFromHtml = async (
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
  formData.append('pdfa', options.pdfa ? 'PDF/A-2b' : '');
  formData.append('pdfua', options.pdfua ? 'true' : '');
  formData.append('skipNetworkIdleEvent', 'false');

  return await callGotenberg('/forms/chromium/convert/html', formData);
};
