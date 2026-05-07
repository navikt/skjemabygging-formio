import { pdfFormDataService, translationService } from '@navikt/skjemadigitalisering-shared-backend';
import {
  localizationUtils,
  NavFormType,
  ReceiptSummary,
  Submission,
  UploadedFile,
} from '@navikt/skjemadigitalisering-shared-domain';
import { config } from '../../config/config';
import { ConfigType } from '../../config/types';
import ApplicationClient, {
  ApplicationClientType,
  DownloadedAttachment,
} from '../../external/innsending-api/ApplicationClient';
import { assembleNologinSoknadBody } from '../../routers/api/helpers/nologin';
import { stringifyPdf } from '../../routers/api/helpers/pdfUtils';
import { LogMetadata } from '../../types/log';
import applicationService from '../documents/applicationService';
import { mapToReceiptSummary } from './receiptMapper';

class ApplicationService {
  private readonly clients: Record<'nologin' | 'digital', ApplicationClientType>;

  constructor(config: ConfigType) {
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
    language: string,
    logMeta: LogMetadata = {},
    type: 'nologin' | 'digital' = 'nologin',
  ): Promise<{ pdf: Uint8Array; receipt: ReceiptSummary }> {
    const lang = localizationUtils.getLanguageCodeAsIso639_1(language);
    const translate = await translationService.createTranslate({
      baseUrl: config.formsApiUrl,
      formPath: form.path,
      languageCode: lang,
    });
    const applicationPdf = await applicationService.createFormPdf(
      pdfAccessToken,
      stringifyPdf(
        pdfFormDataService.createPdfFormDataFromSubmission({
          form,
          submission,
          submissionMethod: type,
          translate,
          language,
          gitVersion: config.gitVersion,
          isDelingslenke: config.isDelingslenke,
        }),
      ),
      logMeta,
    );

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
