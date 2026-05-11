import { ApplicationPdfService } from '@navikt/skjemadigitalisering-shared-backend';
import {
  I18nTranslationMap,
  localizationUtils,
  NavFormType,
  PdfFormData,
  ReceiptSummary,
  Submission,
  translationUtils,
  UploadedFile,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ConfigType } from '../../config/types';
import ApplicationClient, {
  ApplicationClientType,
  DownloadedAttachment,
} from '../../external/innsending-api/ApplicationClient';
import { assembleNologinSoknadBody } from '../../routers/api/helpers/nologin';
import { LogMetadata } from '../../types/log';
import { base64Decode } from '../../utils/base64';
import { mapToReceiptSummary } from './receiptMapper';

class ApplicationService {
  private readonly applicationPdfService: ApplicationPdfService;
  private readonly clients: Record<'nologin' | 'digital', ApplicationClientType>;
  private readonly config: ConfigType;

  constructor(config: ConfigType, applicationPdfService: ApplicationPdfService) {
    this.applicationPdfService = applicationPdfService;
    this.config = config;
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
    form: NavFormType,
    submission: Submission,
    translation: I18nTranslationMap = {},
    language: string,
    pdfFormData?: PdfFormData,
    logMeta: LogMetadata = {},
    type: 'nologin' | 'digital' = 'nologin',
  ): Promise<{ pdf: Uint8Array; receipt: ReceiptSummary }> {
    const lang = localizationUtils.getLanguageCodeAsIso639_1(language);
    const translate = translationUtils.createTranslate(translation, language);
    const applicationPdfBase64 = await this.applicationPdfService.createPdf({
      baseUrl: this.config.familiePdfGeneratorUrl,
      accessToken: pdfAccessToken,
      pdfFormData,
    });
    const applicationPdf = base64Decode(applicationPdfBase64);
    if (!applicationPdf) {
      throw new Error('Generering av søknads PDF feilet');
    }

    const pdfByteArray = Array.from(applicationPdf);
    const nologinApplication = assembleNologinSoknadBody(
      innsendingsId,
      form,
      submission,
      lang,
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
