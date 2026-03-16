import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import { UploadedFile, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ConfigType } from '../../config/types';
import { logger } from '../../logger';
import { LogMetadata } from '../../types/log';
import { SubmitApplicationRequest, SubmitApplicationResponse } from '../../types/sendinn/sendinn';
import { responseToError } from '../../utils/errorHandling';

const ApplicationClient = (config: ConfigType, type: 'nologin' | 'digital') => {
  const basePath = `${config.sendInnConfig.host}/v1/application-${type}`;

  const uploadAttachment = async (
    file: Express.Multer.File,
    accessToken: string,
    attachmentId: string,
    innsendingsId: string,
  ): Promise<UploadedFile> => {
    const correlationId = correlator.getId();
    const fileBlob = new Blob(
      [new Uint8Array(file.buffer.buffer as ArrayBuffer, file.buffer.byteOffset, file.buffer.byteLength)],
      {
        type: file.mimetype,
      },
    );
    const originalFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    const form = new FormData();
    form.append('file', fileBlob, originalFileName);

    const targetUrl = `${basePath}/${innsendingsId}/attachments/${attachmentId}`;
    const logMeta = {
      innsendingsId,
      correlationId,
      attachmentId,
      targetUrl,
    };
    logger.info(`${innsendingsId}: Uploading file for ${type} application`, {
      fileSize: fileBlob.size,
      fileType: fileBlob.type,
      ...logMeta,
    });
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
      const { id, name, size } = await response.json();
      logger.info(`${innsendingsId}: File uploaded for ${type} application`, logMeta);
      return {
        fileId: id,
        attachmentId,
        innsendingId: innsendingsId,
        fileName: name,
        size,
      };
    }

    logger.warn(`${innsendingsId}: Failed to upload file for ${type} application`, logMeta);
    throw await responseToError(response, `Feil ved opplasting av fil`, true);
  };

  const deleteAttachment = async (
    accessToken: string,
    innsendingsId: string,
    attachmentId?: string,
    fileId?: string,
  ): Promise<void> => {
    const correlationId = correlator.getId();
    if (fileId && !validatorUtils.isValidUuid(fileId)) {
      throw new Error('Invalid fileId provided for deletion');
    }
    const fileIdPath = fileId ? `/${fileId}` : '';

    const targetUrl = `${basePath}/${innsendingsId}/attachments/${attachmentId}${fileIdPath}`;
    const logMeta = {
      innsendingsId,
      correlationId,
      targetUrl,
    };
    logger.info(`${innsendingsId}: Deleting file for ${type} application`, logMeta);
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(correlationId && { 'x-correlation-id': correlationId }),
        ...(innsendingsId && { 'x-innsendingsid': innsendingsId }),
      },
    });

    if (!response.ok) {
      logger.warn(`${innsendingsId}: Failed to delete file for ${type} application`, logMeta);
      throw await responseToError(response, `Feil ved sletting av fil`, true);
    }

    logger.info(`${innsendingsId}: Successfully deleted file for ${type} application`, logMeta);
  };

  const submitApplication = async (
    innsendingsId: string,
    request: SubmitApplicationRequest,
    logMeta: LogMetadata = {},
    accessToken: string,
  ): Promise<SubmitApplicationResponse> => {
    const correlationId = correlator.getId();
    const targetUrl = `${basePath}/${innsendingsId}`;
    logger.info(`${innsendingsId}: Submitting ${type} application`, {
      ...logMeta,
      correlationId,
      targetUrl,
    });
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(correlationId && { 'x-correlation-id': correlationId }),
        'x-innsendingsid': innsendingsId,
      },
      body: JSON.stringify(request),
    });
    if (response.ok) {
      const submitResponse: SubmitApplicationResponse = await response.json();
      logger.info(`${innsendingsId}: Successfully submitted ${type} application`, logMeta);
      return submitResponse;
    }
    logger.warn(`${innsendingsId}: Failed to submit ${type} application`, {
      ...logMeta,
      status: response.status,
      statusText: response.statusText,
    });
    throw await responseToError(response, 'Feil ved innsending av søknad', true);
  };

  return { uploadFile: uploadAttachment, deleteFile: deleteAttachment, submitApplication };
};

export type ApplicationClientType = ReturnType<typeof ApplicationClient>;

export default ApplicationClient;
