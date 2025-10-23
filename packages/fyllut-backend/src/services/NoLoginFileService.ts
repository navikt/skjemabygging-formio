import {
  I18nTranslationMap,
  localizationUtils,
  NavFormType,
  Receipt,
  Submission,
  translationUtils,
  UploadedFile,
  validatorUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import correlator from 'express-correlation-id';
import { ConfigType } from '../config/types';
import { logger } from '../logger';
import { createFeltMapFromSubmission } from '../routers/api/helpers/feltMapBuilder';
import { assembleNologinSoknadBody } from '../routers/api/helpers/nologin';
import { stringifyPdf } from '../routers/api/helpers/pdfUtils';
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
    innsendingsId?: string,
  ): Promise<UploadedFile> {
    const correlationId = correlator.getId();
    const { sendInnConfig } = this._config;

    const fileBlob = new Blob([Uint8Array.from(file.buffer)], { type: file.mimetype });
    const originalFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    const form = new FormData();
    form.append('filinnhold', fileBlob, originalFileName);

    const targetUrl = `${sendInnConfig.host}${sendInnConfig.paths.nologinFile}?vedleggId=${attachmentId}${innsendingsId ? `&innsendingId=${innsendingsId}` : ''}`;
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(correlationId && { 'x-correlation-id': correlationId }),
        ...(innsendingsId && { 'x-innsendingsid': innsendingsId }),
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
    const correlationId = correlator.getId();
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
        ...(correlationId && { 'x-correlation-id': correlationId }),
        ...(innsendingsId && { 'x-innsendingsid': innsendingsId }),
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
    innsendingsId: string,
    form: NavFormType,
    submission: Submission,
    submissionMethod: string,
    translation: I18nTranslationMap = {},
    language: string,
    pdfFormData?: any,
  ): Promise<{ pdf: Uint8Array; receipt: Receipt }> {
    const correlationId = correlator.getId();
    const lang = localizationUtils.getLanguageCodeAsIso639_1(language);
    const translate = translationUtils.createTranslate(translation, language);
    const applicationPdf = await applicationService.createFormPdf(
      pdfAccessToken,
      pdfFormData
        ? stringifyPdf(pdfFormData)
        : createFeltMapFromSubmission(form, submission, submissionMethod, translate, lang),
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

    const { host, paths } = this._config.sendInnConfig;
    const logMeta = {
      innsendingsId,
      correlationId,
      skjemanummer: form.properties.skjemanummer,
      formPath: form.path,
    };
    const nologinSubmitUrl = `${host}${paths.nologinSubmit}`;
    logger.info(`${innsendingsId}: Submitting nologin application to ${nologinSubmitUrl}`, logMeta);
    const response = await fetch(nologinSubmitUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${nologinM2MAccessToken}`,
        'Content-Type': 'application/json',
        ...(correlationId && { 'x-correlation-id': correlationId }),
        'x-innsendingsid': innsendingsId,
      },
      body: JSON.stringify(nologinApplication),
    });

    if (response.ok) {
      const receipt: Receipt = await response.json();
      logger.info(`${innsendingsId}: Successfully submitted nologin application`, logMeta);
      return { pdf: applicationPdf, receipt };
    }

    logger.error(`${innsendingsId}: Failed to submit nologin application`, {
      ...logMeta,
      innsendingsId,
      status: response.status,
      statusText: response.statusText,
    });
    throw await responseToError(response, 'Feil ved innsending av søknad', true);
  }
}

export default NoLoginFileService;
