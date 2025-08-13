import { UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { ConfigType } from '../config/types';
import { logger } from '../logger';
import { responseToError } from '../utils/errorHandling';

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

    const fileBlob = new Blob([file.buffer], { type: file.mimetype });

    const form = new FormData();
    form.append('filinnhold', fileBlob, file.originalname);

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
    innsendingId: string,
    attachmentId?: string,
    fileId?: string,
  ): Promise<void> {
    const { sendInnConfig } = this._config;

    if (!fileId && !attachmentId && !innsendingId) {
      logger.debug('Frontend must provide either fileId, attachmentId or innsendingId to delete files');
      throw new Error('Ingen fileId, attachmentId, eller innsendingId angitt');
    }

    const queryParams = attachmentId
      ? `?vedleggId=${attachmentId}&innsendingId=${innsendingId}`
      : `?innsendingId=${innsendingId}`;
    const targetUrl = fileId
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
}

export default NoLoginFileService;
