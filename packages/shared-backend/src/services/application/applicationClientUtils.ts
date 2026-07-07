import { HttpResponseError, ResponseError, TEXTS, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import type { ApplicationType, UploadAttachmentResponse } from './applicationTypes';

const createHeaders = ({
  correlationId,
  envQualifier,
  innsendingsId,
}: {
  correlationId?: string;
  envQualifier?: string;
  innsendingsId?: string;
}) => ({
  ...(correlationId && { 'x-correlation-id': correlationId }),
  ...(envQualifier && { 'Nav-Env-Qualifier': envQualifier }),
  ...(innsendingsId && { 'x-innsendingsid': innsendingsId }),
});

const getDraftUrl = (baseUrl: string, path: string, innsendingsId?: string) =>
  innsendingsId ? `${baseUrl}${path}/${innsendingsId}` : `${baseUrl}${path}`;

const getApplicationUrl = (baseUrl: string, type: ApplicationType, innsendingsId: string) =>
  `${baseUrl}/v1/application-${type}/${innsendingsId}`;

const getAttachmentsUrl = ({
  baseUrl,
  innsendingsId,
  attachmentId,
  type,
  fileId,
}: {
  baseUrl: string;
  innsendingsId: string;
  attachmentId?: string;
  type: ApplicationType;
  fileId?: string;
}) => `${getApplicationUrl(baseUrl, type, innsendingsId)}/attachments/${attachmentId}${fileId ? `/${fileId}` : ''}`;

const createUploadedFile = (
  response: UploadAttachmentResponse,
  innsendingsId: string,
  attachmentId: string,
): UploadedFile => ({
  fileId: response.id,
  attachmentId,
  innsendingId: innsendingsId,
  fileName: response.name,
  size: response.size,
});

const getUpstreamErrorCode = (error: unknown): string | undefined => {
  if (!(error instanceof HttpResponseError)) {
    return undefined;
  }

  const errorCode = error.body?.errorCode;
  return typeof errorCode === 'string' ? errorCode : undefined;
};

const normalizeApplicationError = (error: unknown): ResponseError => {
  const correlationId = error instanceof ResponseError ? error.correlationId : undefined;

  switch (getUpstreamErrorCode(error)) {
    case 'illegalAction.applicationSentInOrDeleted':
      return new ResponseError('NOT_FOUND', error instanceof Error ? error.message : 'Not Found', correlationId);
    case 'illegalAction.fileWithTooManyPages':
      return new ResponseError(
        'FILE_TOO_MANY_PAGES',
        error instanceof Error ? error.message : 'Bad Request',
        correlationId,
      );
    case 'temporarilyUnavailable':
      return new ResponseError(
        'SERVICE_UNAVAILABLE',
        error instanceof Error ? error.message : 'Service Unavailable',
        correlationId,
      );
    default:
      if (error instanceof ResponseError) {
        return error;
      }

      return new ResponseError('INTERNAL_SERVER_ERROR', 'Internal Server Error', correlationId);
  }
};

const createUploadAttachmentError = (error: ResponseError): ResponseError => {
  if (error.errorCode === 'FORBIDDEN') {
    return new ResponseError(
      'FORBIDDEN',
      'Upload failed because authorization failed',
      error.correlationId,
      TEXTS.statiske.uploadFile.uploadFileError,
    );
  }

  if (error.errorCode === 'FILE_TOO_MANY_PAGES') {
    return new ResponseError(
      'FILE_TOO_MANY_PAGES',
      'Upload failed because file has too many pages',
      error.correlationId,
      TEXTS.statiske.uploadFile.uploadFileToManyPagesError,
    );
  }

  if (error.errorCode === 'SERVICE_UNAVAILABLE') {
    return new ResponseError(
      'SERVICE_UNAVAILABLE',
      error.message,
      error.correlationId,
      TEXTS.statiske.nologin.temporarilyUnavailable,
    );
  }

  return new ResponseError(
    error.errorCode,
    error.message,
    error.correlationId,
    TEXTS.statiske.uploadFile.uploadFileError,
  );
};

const createSubmitApplicationError = (error: ResponseError, type: ApplicationType): ResponseError => {
  if (type === 'nologin' && error.errorCode === 'SERVICE_UNAVAILABLE') {
    return new ResponseError(
      error.errorCode,
      error.message,
      error.correlationId,
      TEXTS.statiske.nologin.temporarilyUnavailable,
    );
  }

  return error;
};

export {
  createHeaders,
  createSubmitApplicationError,
  createUploadAttachmentError,
  createUploadedFile,
  getApplicationUrl,
  getAttachmentsUrl,
  getDraftUrl,
  normalizeApplicationError,
};
