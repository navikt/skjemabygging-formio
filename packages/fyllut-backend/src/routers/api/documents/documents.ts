import {
  coverPageMapper,
  coverPageService,
  mergeFileService,
  recipientService,
} from '@navikt/skjemadigitalisering-shared-backend';
import {
  I18nTranslationMap,
  SubmissionMethod,
  TranslateFunction,
  translationUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { RequestHandler } from 'express';
import { config } from '../../../config/config';
import { logger } from '../../../logger';
import { appMetrics, applicationPdfService } from '../../../services';
import { base64Decode } from '../../../utils/base64';

const { familiePdfGeneratorUrl, formsApiUrl, sendInnConfig, skjemabyggingProxyUrl } = config;

const assertPdfFormData = (pdfFormData: unknown) => {
  if (!pdfFormData || typeof pdfFormData !== 'object') {
    throw new Error('Missing pdfFormData to generate PDF');
  }
};

const createTranslate = (translations: I18nTranslationMap, language: string): TranslateFunction => {
  const translate = translationUtils.createTranslate(translations, language);

  return (text, textReplacements) => (text ? `${translate(text, textReplacements)}` : '');
};

const getCoverPageTitle = (
  form: { title: string; properties: { skjemanummer: string } },
  translate: TranslateFunction,
) => {
  return `${form.properties.skjemanummer} ${translate(form.title)}`;
};

const toPdfBuffer = (pdfBase64: string | null | undefined, errorMessage: string) => {
  const pdfBuffer = base64Decode(pdfBase64 ?? null);
  if (!pdfBuffer) {
    throw new Error(errorMessage);
  }

  return pdfBuffer;
};

const application: RequestHandler = async (req, res, next) => {
  try {
    const { form, pdfFormData, submission, language } = req.body;
    if (!submission) {
      throw new Error('Missing submission data to generate PDF');
    }
    assertPdfFormData(pdfFormData);
    const formParsed = JSON.parse(form);
    const pdfGeneratorToken = req.headers.PdfAccessToken as string;

    logger.info(`Create application pdf for ${formParsed?.properties?.skjemanummer ?? 'unknown form'}`, {
      skjemanummer: formParsed?.properties?.skjemanummer,
      language,
    });

    if (!pdfGeneratorToken) {
      throw new Error('Azure PDF generator token is missing. Unable to generate PDF');
    }

    const applicationPdfBase64 = await applicationPdfService.createPdf({
      baseUrl: familiePdfGeneratorUrl,
      accessToken: pdfGeneratorToken,
      pdfFormData,
    });
    const fileBuffer = toPdfBuffer(applicationPdfBase64, 'Generering av søknads PDF feilet');
    appMetrics.paperSubmissionsCounter.inc({ source: 'ingen' });
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(`${formParsed.path}.pdf`)}`);
    res.send(fileBuffer);
  } catch (e) {
    next(e);
  }
};

const coverPageAndApplication: RequestHandler = async (req, res, next) => {
  try {
    const { form, submission, language, enhetNummer, translations, pdfFormData, submissionMethod } = req.body;
    if (!submission) {
      throw new Error('Missing submission data to generate PDF');
    }
    assertPdfFormData(pdfFormData);
    const formParsed = JSON.parse(form);
    const submissionParsed = JSON.parse(submission);
    const translationsParsed = JSON.parse(translations);
    const translate = createTranslate(translationsParsed, language);
    const frontPageGeneratorToken = req.headers.AzureAccessToken as string;
    const pdfGeneratorToken = req.headers.PdfAccessToken as string;
    const mergePdfToken = req.headers.MergePdfToken as string;

    if (!frontPageGeneratorToken) {
      throw new Error('Azure access token is missing. Unable to generate PDF');
    }

    if (!pdfGeneratorToken) {
      throw new Error('PDF generator token is missing. Unable to generate PDF');
    }

    if (!mergePdfToken) {
      throw new Error('MergePDF generator token is missing. Unable to merge front page and application PDFs');
    }
    const recipient = await recipientService.getRecipient({
      baseUrl: formsApiUrl,
      recipientId: formParsed?.properties?.mottaksadresseId,
    });
    const coverPageData = coverPageMapper.createDownloadDataFromSubmission(
      formParsed,
      submissionParsed,
      language,
      recipient,
      enhetNummer,
      translate,
      submissionMethod as SubmissionMethod | undefined,
    );
    const coverPageTitle = getCoverPageTitle(formParsed, translate);
    const [coverPagePdfBase64, applicationPdfBase64] = await Promise.all([
      coverPageService.downloadCoverPage({
        baseUrl: skjemabyggingProxyUrl,
        accessToken: frontPageGeneratorToken,
        data: coverPageData,
        languageCode: language,
        translate,
      }),
      applicationPdfService.createPdf({
        baseUrl: familiePdfGeneratorUrl,
        accessToken: pdfGeneratorToken,
        pdfFormData,
      }),
    ]);
    const mergedPdfBase64 = await mergeFileService.mergeFiles({
      baseUrl: `${sendInnConfig.host}${sendInnConfig.paths.mergeFiles}`,
      accessToken: mergePdfToken,
      body: {
        title: coverPageTitle,
        language,
        files: [coverPagePdfBase64, applicationPdfBase64],
      },
    });
    const fileBuffer = toPdfBuffer(mergedPdfBase64, 'Sammenslåing av forside og søknad feilet');
    appMetrics.paperSubmissionsCounter.inc({ source: 'fyllUt' });
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(`${formParsed.path}.pdf`)}`);
    res.send(fileBuffer);
  } catch (e) {
    next(e);
  }
};

const documents = {
  application,
  coverPageAndApplication,
};

export default documents;
