import {
  partyProjections,
  renderApplicationPdf,
  requestUtil,
  translationUtil,
} from '@navikt/skjemadigitalisering-shared-backend';
import {
  FormsApiTranslationMap,
  navFormPartyAdapter,
  partyUtils,
  ResponseError,
  Submission,
  SubmissionMethod,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { config } from '../../../../config/config';
import { applicationPdfService, applicationService, formService, translationService } from '../../../../services';
import { mapToReceiptSummary } from '../../../../services/nologin/receiptMapper';
import { LogMetadata } from '../../../../types/log';
import { requireBase64Decode } from '../../../../utils/base64';
import { assembleSubmitApplicationRequest } from '../../helpers/applicationUtils';

type SubmissionContext =
  | { applicationType: 'digital'; authenticatedIdentityNumber: string }
  | { applicationType: 'nologin' };

export const generatePdfAndSubmit = async (
  context: SubmissionContext,
  req: any,
  innsendingsId: string,
  accessToken: string,
) => {
  const { formPath, submission, language, submissionMethod } = req.body as {
    formPath: string;
    submission: Submission;
    language: TranslationLang;
    submissionMethod?: SubmissionMethod;
  };

  const form = await formService.getForm({
    formPath,
    select: ['skjemanummer', 'title', 'path', 'properties', 'components', 'revision'],
  });
  const partyInput = navFormPartyAdapter.getPartyInput(
    form,
    submission.data,
    context.applicationType === 'digital'
      ? { authenticatedIdentityNumber: context.authenticatedIdentityNumber }
      : {},
  );
  const partyResult = partyUtils.validateParty(partyInput);
  if (!partyResult.success) {
    throw new ResponseError('BAD_REQUEST', 'Invalid party data');
  }
  const parties = partyProjections.toSubmissionParties(partyResult.data);
  const translations: FormsApiTranslationMap = await translationService.getTranslations({
    formPath,
    languageCodes: [language],
  });
  const pdfAccessToken = requestUtil.getPdfAccessToken(req);
  const logMeta: LogMetadata = {
    innsendingsId,
    skjemanummer: form?.properties?.skjemanummer,
    language,
    fyllutRequestPath: req.path,
  };
  const pdfFormData = renderApplicationPdf({
    form,
    submission,
    language,
    translations,
    submissionMethod,
    appConfig: { config: { gitVersion: config.gitVersion, isDelingslenke: config.isDelingslenke } },
  });
  const applicationPdfBase64 = await applicationPdfService.createPdf({
    accessToken: pdfAccessToken,
    pdfFormData,
  });
  const applicationPdf = requireBase64Decode(applicationPdfBase64, 'Failed to decode generated application PDF');

  const translate = translationUtil.createTranslate(translations, language);
  const submitRequest = assembleSubmitApplicationRequest(
    innsendingsId,
    form,
    submission,
    language,
    Array.from(applicationPdf),
    translate,
    parties,
  );
  const submitResponse = await applicationService.submitApplication({
    accessToken,
    body: submitRequest,
    innsendingsId,
    logMeta,
    type: context.applicationType,
  });

  return {
    pdfBase64: Buffer.from(applicationPdf).toString('base64'),
    receipt: mapToReceiptSummary(submitResponse),
  };
};
