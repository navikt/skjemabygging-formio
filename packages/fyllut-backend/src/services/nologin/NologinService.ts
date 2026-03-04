import {
  I18nTranslationMap,
  localizationUtils,
  NavFormType,
  ReceiptSummary,
  Submission,
  translationUtils,
  UploadedFile,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ConfigType } from '../../config/types';
import ApplicationClient, { ApplicationClientType } from '../../external/innsending-api/ApplicationClient';
import { assembleNologinSoknadBody } from '../../routers/api/helpers/nologin';
import { stringifyPdf } from '../../routers/api/helpers/pdfUtils';
import { LogMetadata } from '../../types/log';
import applicationService from '../documents/applicationService';
import { mapToReceiptSummary } from './receiptMapper';

class NologinService {
  private readonly applicationClient: ApplicationClientType;

  constructor(config: ConfigType) {
    this.applicationClient = ApplicationClient(config, 'nologin');
  }

  public async postFile(
    file: Express.Multer.File,
    accessToken: string,
    attachmentId: string,
    innsendingsId: string,
  ): Promise<UploadedFile> {
    return this.applicationClient.uploadFile(file, accessToken, attachmentId, innsendingsId);
  }

  public async delete(
    accessToken: string,
    innsendingsId: string,
    attachmentId?: string,
    fileId?: string,
  ): Promise<void> {
    return this.applicationClient.deleteFile(accessToken, innsendingsId, attachmentId, fileId);
  }

  public async submit(
    pdfAccessToken: string,
    nologinM2MAccessToken: string,
    innsendingsId: string,
    form: NavFormType,
    submission: Submission,
    translation: I18nTranslationMap = {},
    language: string,
    pdfFormData?: any,
    logMeta: LogMetadata = {},
  ): Promise<{ pdf: Uint8Array; receipt: ReceiptSummary }> {
    const lang = localizationUtils.getLanguageCodeAsIso639_1(language);
    const translate = translationUtils.createTranslate(translation, language);
    const applicationPdf = await applicationService.createFormPdf(pdfAccessToken, stringifyPdf(pdfFormData), logMeta);

    const pdfByteArray = Array.from(applicationPdf);
    const nologinApplication = assembleNologinSoknadBody(
      innsendingsId,
      form,
      submission,
      lang,
      pdfByteArray,
      translate,
    );

    const submitResponse = await this.applicationClient.submitApplication(
      innsendingsId,
      nologinApplication,
      logMeta,
      nologinM2MAccessToken,
    );
    const receipt = mapToReceiptSummary(submitResponse);
    return { pdf: applicationPdf, receipt };
  }
}

export default NologinService;
