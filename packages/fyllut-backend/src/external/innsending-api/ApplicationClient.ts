import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import { UploadedFile, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { openAsBlob } from 'node:fs';
import { ConfigType } from '../../config/types';
import { logger } from '../../logger';
import { appMetrics } from '../../services';
import { LogMetadata } from '../../types/log';
import { SubmitApplicationRequest, SubmitApplicationResponse } from '../../types/sendinn/sendinn';
import { responseToError } from '../../utils/errorHandling';

export interface DownloadedAttachment {
  fileStream: ReadableStream;
  contentType?: string;
  contentDisposition?: string;
  contentLength?: string;
}

const ApplicationClient = (config: ConfigType, type: 'nologin' | 'digital') => {
  const basePath = `${config.sendInnConfig.host}/v1/application-${type}`;

  const createFileBlob = async (file: Express.Multer.File): Promise<Blob> => {
    if (file.path) {
      return openAsBlob(file.path, { type: file.mimetype });
    }

    if (file.buffer) {
      const fileData = new Uint8Array(
        file.buffer.buffer as ArrayBuffer,
        file.buffer.byteOffset,
        file.buffer.byteLength,
      );
      return new Blob([fileData], { type: file.mimetype });
    }

    throw new Error('Uploaded file has neither path nor buffer');
  };

  const uploadAttachment = async (
    file: Express.Multer.File,
    accessToken: string,
    attachmentId: string,
    innsendingsId: string,
  ): Promise<UploadedFile> => {
    const correlationId = correlator.getId();
    const originalFileName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const logMeta = {
      innsendingsId,
      correlationId,
      attachmentId,
    };
    logger.info(`${innsendingsId}: Preparing file upload for ${type} application`, {
      storageMode: file.path ? 'disk' : 'memory',
      fileSize: file.size,
      fileType: file.mimetype,
      hasTempFile: Boolean(file.path),
      ...logMeta,
    });
    const fileBlob = await createFileBlob(file);

    const form = new FormData();
    form.append('file', fileBlob, originalFileName);

    const targetUrl = `${basePath}/${innsendingsId}/attachments/${attachmentId}`;
    logger.info(`${innsendingsId}: Uploading file for ${type} application`, {
      fileSize: fileBlob.size,
      fileType: fileBlob.type,
      targetUrl,
      ...logMeta,
    });
    const stopUploadDurationTimer = appMetrics.innsendingApiUploadDuration.startTimer({ type });
    let response: Response | undefined;
    let uploadError = false;
    try {
      response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          ...(correlationId && { 'x-correlation-id': correlationId }),
          ...(innsendingsId && { 'x-innsendingsid': innsendingsId }),
        },
        body: form,
      });
    } catch (error) {
      uploadError = true;
      throw error;
    } finally {
      const error = uploadError || !response?.ok;
      const errorLabel = String(error);
      appMetrics.innsendingApiUploadFileSize.observe({ type, error: errorLabel }, fileBlob.size);
      stopUploadDurationTimer({ error: errorLabel });
    }

    if (response?.ok) {
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

    if (!response) {
      throw new Error('Unexpected missing response after file upload');
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

  const downloadAttachment = async (
    accessToken: string,
    innsendingsId: string,
    attachmentId: string,
    fileId: string,
  ): Promise<DownloadedAttachment> => {
    const correlationId = correlator.getId();
    if (!validatorUtils.isValidUuid(fileId)) {
      throw new Error('Invalid fileId provided for download');
    }

    const targetUrl = `${basePath}/${innsendingsId}/attachments/${attachmentId}/${fileId}`;
    const logMeta = {
      innsendingsId,
      attachmentId,
      fileId,
      correlationId,
      targetUrl,
    };
    logger.info(`${innsendingsId}: Downloading file for ${type} application`, logMeta);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(correlationId && { 'x-correlation-id': correlationId }),
        ...(innsendingsId && { 'x-innsendingsid': innsendingsId }),
      },
    });

    if (!response.ok) {
      logger.warn(`${innsendingsId}: Failed to download file for ${type} application`, logMeta);
      throw await responseToError(response, `Feil ved nedlasting av fil`, true);
    }

    const fileStream = response.body;
    if (!fileStream) {
      logger.warn(`${innsendingsId}: Download response body missing for ${type} application`, logMeta);
      throw new Error('Missing response body while downloading file');
    }

    const contentLength = response.headers.get('content-length');
    logger.info(`${innsendingsId}: Successfully downloaded file for ${type} application`, {
      ...logMeta,
      contentLength,
    });
    const contentType = response.headers.get('content-type');
    const contentDisposition = response.headers.get('content-disposition');
    return {
      fileStream,
      contentType: contentType ?? undefined,
      contentDisposition: contentDisposition ?? undefined,
      contentLength: contentLength ?? undefined,
    };
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

  return {
    uploadFile: uploadAttachment,
    deleteFile: deleteAttachment,
    downloadFile: downloadAttachment,
    submitApplication,
  };
};

export type ApplicationClientType = ReturnType<typeof ApplicationClient>;

export default ApplicationClient;
