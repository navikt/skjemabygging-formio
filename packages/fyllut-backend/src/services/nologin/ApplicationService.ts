import {
  ApplicationPdfService,
  renderApplicationPdf,
  translationUtil,
} from '@navikt/skjemadigitalisering-shared-backend';
import {
  Form,
  FormsApiTranslationMap,
  ReceiptSummary,
  Submission,
  SubmissionMethod,
  TranslationLang,
  UploadedFile,
} from '@navikt/skjemadigitalisering-shared-domain';
import { FyllutBackendConfig } from '../../config/types';
import ApplicationClient, {
  ApplicationClientType,
  DownloadedAttachment,
} from '../../external/innsending-api/ApplicationClient';
import { assembleSubmitApplicationRequest } from '../../routers/api/helpers/applicationUtils';
import { LogMetadata } from '../../types/log';
import { base64Decode } from '../../utils/base64';
import { mapToReceiptSummary } from './receiptMapper';

class ApplicationService {
  private readonly applicationPdfService: ApplicationPdfService;
  private readonly clients: Record<'nologin' | 'digital', ApplicationClientType>;

  constructor(config: FyllutBackendConfig, applicationPdfService: ApplicationPdfService) {
    this.applicationPdfService = applicationPdfService;
    this.clients = {
      nologin: ApplicationClient(config, 'nologin'),
      digital: ApplicationClient(config, 'digital'),
    };
  }

  public async uploadFile(
    file: Express.Multer.File,
    accessToken: string,
    attachmentId: string,
    innsendingsId: string,
    type: 'nologin' | 'digital' = 'nologin',
  ): Promise<UploadedFile> {
    return this.clients[type].uploadFile(file, accessToken, attachmentId, innsendingsId);
  }

  public async deleteFile(
    accessToken: string,
    innsendingsId: string,
    attachmentId?: string,
    fileId?: string,
    type: 'nologin' | 'digital' = 'nologin',
  ): Promise<void> {
    return this.clients[type].deleteFile(accessToken, innsendingsId, attachmentId, fileId);
  }

  public async downloadFile(
    accessToken: string,
    innsendingsId: string,
    attachmentId: string,
    fileId: string,
    type: 'nologin' | 'digital' = 'nologin',
  ): Promise<DownloadedAttachment> {
    return this.clients[type].downloadFile(accessToken, innsendingsId, attachmentId, fileId);
  }

  public async submit(
    pdfAccessToken: string,
    nologinM2MAccessToken: string,
    innsendingsId: string,
    form: Form,
    submission: Submission,
    translations: FormsApiTranslationMap,
    language: TranslationLang,
    submissionMethod: SubmissionMethod | undefined,
    logMeta: LogMetadata = {},
    type: 'nologin' | 'digital' = 'nologin',
  ): Promise<{ pdf: Uint8Array; receipt: ReceiptSummary }> {
    const translate = translationUtil.createTranslate(translations, language);
    const pdfFormData = renderApplicationPdf({
      form,
      submission,
      language,
      translations,
      submissionMethod,
      appConfig: { config: { gitVersion: this.config.gitVersion } },
    });
    const applicationPdfBase64 = await this.applicationPdfService.createPdf({
      accessToken: pdfAccessToken,
      pdfFormData,
    });
    const applicationPdf = base64Decode(applicationPdfBase64);
    if (!applicationPdf) {
      throw new Error('Generering av søknads PDF feilet');
    }

    const pdfByteArray = Array.from(applicationPdf);
    const nologinApplication = assembleSubmitApplicationRequest(
      innsendingsId,
      form,
      submission,
      language,
      pdfByteArray,
      translate,
    );

    const submitResponse = await this.clients[type].submitApplication(
      innsendingsId,
      nologinApplication,
      logMeta,
      nologinM2MAccessToken,
    );
    const receipt = mapToReceiptSummary(submitResponse);
    return { pdf: applicationPdf, receipt };
  }
}

export default ApplicationService;
