import {
  I18nTranslationMap,
  localizationUtils,
  NavFormType,
  Submission,
  translationUtils,
  UploadedFile,
  validatorUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ConfigType } from '../config/types';
import { logger } from '../logger';
import { createFeltMapFromSubmission } from '../routers/api/helpers/feltMapBuilder';
import { assembleNologinSoknadBody } from '../routers/api/helpers/nologin';
import { responseToError } from '../utils/errorHandling';
import applicationService from './documents/applicationService';

class NoLoginFileService {
  private readonly _config: ConfigType;

  constructor(config: ConfigType) {
    this._config = config;
  }

  public async postFile(
    file: Express.Multer.File,
    accessToken: string,
    attachmentId: string,
    innsendingId?: string,
  ): Promise<UploadedFile> {
    const { sendInnConfig } = this._config;

    const fileBlob = new Blob([Uint8Array.from(file.buffer)], { type: file.mimetype });
    const originalFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    const form = new FormData();
    form.append('filinnhold', fileBlob, originalFileName);

    const targetUrl = `${sendInnConfig.host}${sendInnConfig.paths.nologinFile}?vedleggId=${attachmentId}${innsendingId ? `&innsendingId=${innsendingId}` : ''}`;
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    });
    if (response.ok) {
      const { filId, vedleggId, innsendingId, filnavn, storrelse } = await response.json();
      return {
        fileId: filId,
        attachmentId: vedleggId,
        innsendingId,
        fileName: filnavn,
        size: storrelse,
      };
    } else {
      logger.debug('Failed to upload file for user with no login');
      throw await responseToError(response, 'Feil ved opplasting av fil for uinnlogget søknad', true);
    }
  }

  public async delete(
    accessToken: string,
    innsendingsId?: string,
    attachmentId?: string,
    fileId?: string,
  ): Promise<void> {
    const { sendInnConfig } = this._config;
    if (!fileId && !attachmentId && !innsendingsId) {
      logger.debug('Frontend must provide either fileId, attachmentId or innsendingId to delete files');
      throw new Error('Ingen fileId, attachmentId, eller innsendingId angitt');
    }

    const queryParams = attachmentId
      ? `?vedleggId=${attachmentId}&innsendingId=${innsendingsId}`
      : `?innsendingId=${innsendingsId}`;
    const targetUrl =
      fileId && validatorUtils.isValidUuid(fileId)
        ? `${sendInnConfig.host}${sendInnConfig.paths.nologinFile}/${fileId}${queryParams}`
        : `${sendInnConfig.host}${sendInnConfig.paths.nologinFile}${queryParams}`;

    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      logger.debug('Failed to delete file(s) for user with no login');
      throw await responseToError(response, 'Feil ved sletting av fil(er) for uinnlogget søknad', true);
    }
  }

  public async submit(
    pdfAccessToken: string,
    nologinM2MAccessToken: string,
    innsendingId: string,
    form: NavFormType,
    submission: Submission,
    submissionMethod: string,
    translation: I18nTranslationMap = {},
    language: string,
    pdfFormData?: any,
  ) {
    const lang = localizationUtils.getLanguageCodeAsIso639_1(language);
    const translate = translationUtils.createTranslate(translation, language);
    const applicationPdf = await applicationService.createFormPdf(
      pdfAccessToken,
      pdfFormData
        ? JSON.stringify(pdfFormData)
        : createFeltMapFromSubmission(form, submission, submissionMethod, translate, lang),
    );

    const pdfByteArray = Array.from(applicationPdf);
    const nologinApplication = assembleNologinSoknadBody(innsendingId, form, submission, lang, pdfByteArray, translate);

    const { host, paths } = this._config.sendInnConfig;
    const logMeta = {
      innsendingId,
      skjemanummer: form.properties.skjemanummer,
      formPath: form.path,
    };
    const nologinSubmitUrl = `${host}${paths.nologinSubmit}`;
    logger.info(`${innsendingId}: Submitting nologin application to ${nologinSubmitUrl}`, logMeta);
    const response = await fetch(nologinSubmitUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${nologinM2MAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nologinApplication),
    });

    if (response.ok) {
      const kvittering = await response.json();
      logger.info(`${innsendingId}: Successfully submitted nologin application`, logMeta);
      return { innsendingId, pdf: applicationPdf, kvittering };
    }

    logger.error(`${innsendingId}: Failed to submit nologin application`, {
      ...logMeta,
      status: response.status,
      statusText: response.statusText,
    });
    throw await responseToError(response, 'Feil ved innsending av søknad', true);
  }
}

export default NoLoginFileService;
