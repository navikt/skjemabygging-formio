import { coverPageMapper, renderApplicationPdf, translationUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { PdfFormData, SubmissionMethod, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { RequestHandler } from 'express';
import { config } from '../../../config/config';
import { logger } from '../../../logger';
import {
  appMetrics,
  applicationPdfService,
  coverPageService,
  mergeFileService,
  recipientService,
  sharedFormService,
  translationService,
} from '../../../services';
import { base64Decode } from '../../../utils/base64';

const assertPdfFormData = (pdfFormData: PdfFormData | undefined) => {
  if (!pdfFormData || typeof pdfFormData !== 'object') {
    throw new Error('Missing pdfFormData to generate PDF');
  }
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
    const { formPath, submission, language, submissionMethod } = req.body;
    if (!submission) {
      throw new Error('Missing submission data to generate PDF');
    }
    const form = await sharedFormService.getForm({
      formPath,
      select: ['skjemanummer', 'title', 'path', 'properties', 'components'],
    });
    const submissionParsed = JSON.parse(submission);
    const translations = await translationService.getTranslations({ formPath, languageCodes: [language] });
    const pdfGeneratorToken = req.headers.PdfAccessToken as string;

    logger.info(`Create application pdf for ${form?.properties?.skjemanummer ?? 'unknown form'}`, {
      skjemanummer: form?.properties?.skjemanummer,
      language,
    });

    if (!pdfGeneratorToken) {
      throw new Error('Azure PDF generator token is missing. Unable to generate PDF');
    }

    const pdfFormData = renderApplicationPdf({
      form,
      submission: submissionParsed,
      language,
      translations,
      submissionMethod: submissionMethod as SubmissionMethod | undefined,
      appConfig: { config: { gitVersion: config.gitVersion } },
    });
    assertPdfFormData(pdfFormData);

    const applicationPdfBase64 = await applicationPdfService.createPdf({
      accessToken: pdfGeneratorToken,
      pdfFormData,
    });
    const fileBuffer = toPdfBuffer(applicationPdfBase64, 'Generering av søknads PDF feilet');
    appMetrics.paperSubmissionsCounter.inc({ source: 'ingen' });
    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(`${form.path}.pdf`)}`);
    res.send(fileBuffer);
  } catch (e) {
    next(e);
  }
};

const coverPageAndApplication: RequestHandler = async (req, res, next) => {
  try {
    const { formPath, submission, language, enhetNummer, submissionMethod } = req.body;
    if (!submission) {
      throw new Error('Missing submission data to generate PDF');
    }
    const form = await sharedFormService.getForm({
      formPath,
      select: ['skjemanummer', 'title', 'path', 'properties', 'components'],
    });
    const submissionParsed = JSON.parse(submission);
    const translations = await translationService.getTranslations({ formPath, languageCodes: [language] });
    const translate = translationUtil.createTranslate(translations, language);
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

    const pdfFormData = renderApplicationPdf({
      form,
      submission: submissionParsed,
      language,
      translations,
      submissionMethod: submissionMethod as SubmissionMethod | undefined,
      appConfig: { config: { gitVersion: config.gitVersion } },
    });
    assertPdfFormData(pdfFormData);

    const recipient = await recipientService.getRecipient({
      recipientId: form?.properties?.mottaksadresseId,
    });
    const coverPageData = coverPageMapper.createDownloadDataFromSubmission(
      form,
      submissionParsed,
      language,
      recipient,
      enhetNummer,
      translate,
      submissionMethod as SubmissionMethod | undefined,
    );
    const coverPageTitle = getCoverPageTitle(form, translate);
    const [coverPagePdfBase64, applicationPdfBase64] = await Promise.all([
      coverPageService.downloadCoverPage({
        accessToken: frontPageGeneratorToken,
        data: coverPageData,
        languageCode: language,
        translate,
      }),
      applicationPdfService.createPdf({
        accessToken: pdfGeneratorToken,
        pdfFormData,
      }),
    ]);
    const mergedPdfBase64 = await mergeFileService.mergeFiles({
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
    res.setHeader('Content-Disposition', `inline; filename=${encodeURIComponent(`${form.path}.pdf`)}`);
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
