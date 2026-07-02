import {
  coverPageMapper,
  renderApplicationPdf,
  requestUtil,
  translationUtil,
} from '@navikt/skjemadigitalisering-shared-backend';
import { SubmissionMethod, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { RequestHandler } from 'express';
import { config } from '../../../config/config';
import { logger } from '../../../logger';
import {
  appMetrics,
  applicationPdfService,
  coverPageService,
  formService,
  mergeFileService,
  recipientService,
  translationService,
} from '../../../services';
import { requireBase64Decode } from '../../../utils/base64';

const getCoverPageTitle = (
  form: { title: string; properties: { skjemanummer: string } },
  translate: TranslateFunction,
) => {
  return `${form.properties.skjemanummer} ${translate(form.title)}`;
};

const application: RequestHandler = async (req, res, next) => {
  try {
    const { formPath, language, submissionMethod } = req.body;
    const submission = requestUtil.getBodyValue<string>(req, 'submission');
    const form = await formService.getForm({
      formPath,
      select: ['skjemanummer', 'title', 'path', 'properties', 'components'],
    });
    const submissionParsed = JSON.parse(submission);
    const translations = await translationService.getTranslations({ formPath, languageCodes: [language] });
    const pdfGeneratorToken = requestUtil.getPdfAccessToken(req);

    logger.info(`Create application pdf for ${form?.properties?.skjemanummer ?? 'unknown form'}`, {
      skjemanummer: form?.properties?.skjemanummer,
      language,
    });
    const pdfFormData = renderApplicationPdf({
      form,
      submission: submissionParsed,
      language,
      translations,
      submissionMethod: submissionMethod as SubmissionMethod | undefined,
      appConfig: { config: { gitVersion: config.gitVersion } },
    });

    const applicationPdfBase64 = await applicationPdfService.createPdf({
      accessToken: pdfGeneratorToken,
      pdfFormData,
    });
    const fileBuffer = requireBase64Decode(applicationPdfBase64, 'Failed to decode generated application PDF');
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
    const { formPath, language, enhetNummer, submissionMethod } = req.body;
    const submission = requestUtil.getBodyValue<string>(req, 'submission');
    const form = await formService.getForm({
      formPath,
      select: ['skjemanummer', 'title', 'path', 'properties', 'components'],
    });
    const submissionParsed = JSON.parse(submission);
    const translations = await translationService.getTranslations({ formPath, languageCodes: [language] });
    const translate = translationUtil.createTranslate(translations, language);
    const frontPageGeneratorToken = requestUtil.getAzureAccessToken(req);
    const pdfGeneratorToken = requestUtil.getPdfAccessToken(req);
    const mergePdfToken = requestUtil.getMergePdfToken(req);

    const pdfFormData = renderApplicationPdf({
      form,
      submission: submissionParsed,
      language,
      translations,
      submissionMethod: submissionMethod as SubmissionMethod | undefined,
      appConfig: { config: { gitVersion: config.gitVersion } },
    });

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
    const fileBuffer = requireBase64Decode(mergedPdfBase64, 'Failed to decode merged cover page and application PDF');
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
