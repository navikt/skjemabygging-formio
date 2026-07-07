import { UploadedFile, getStatusFromErrorCode, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import type { LogMetadata } from '../../shared';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';
import {
  createHeaders,
  createSubmitApplicationError,
  createUploadAttachmentError,
  createUploadedFile,
  getApplicationUrl,
  getAttachmentsUrl,
  getDraftUrl,
  getSubmittedDraftUrl,
  normalizeApplicationError,
} from './applicationClientUtils';
import type {
  ApplicationType,
  DownloadedAttachment,
  DraftResponse,
  SubmitApplicationRequest,
  SubmitApplicationResponse,
  UploadAttachmentResponse,
} from './applicationTypes';

interface ApplicationBaseProps {
  baseUrl: string;
  accessToken: string;
  innsendingsId: string;
  correlationId?: string;
  logMeta?: LogMetadata;
}

interface DraftMutationProps extends ApplicationBaseProps {
  body: object;
}

interface CreateSoknadProps extends DraftMutationProps {
  force?: boolean;
  envQualifier?: string;
}

interface SubmitUtfyltSoknadProps extends DraftMutationProps {
  envQualifier?: string;
}

interface AttachmentBaseProps extends ApplicationBaseProps {
  attachmentId: string;
  type: ApplicationType;
}

interface UploadAttachmentProps extends AttachmentBaseProps {
  fileBlob: Blob;
  fileName: string;
}

interface DeleteAttachmentProps extends ApplicationBaseProps {
  attachmentId?: string;
  fileId?: string;
  type: ApplicationType;
}

interface DownloadAttachmentProps extends AttachmentBaseProps {
  fileId: string;
}

interface SubmitApplicationProps extends ApplicationBaseProps {
  body: SubmitApplicationRequest;
  type: ApplicationType;
}

const getSoknad = async <T>(props: ApplicationBaseProps): Promise<T> => {
  const { baseUrl, accessToken, innsendingsId, correlationId } = props;
  logger.info(`Getting soknad ${innsendingsId}`);

  try {
    return await http.get<T>(getDraftUrl(baseUrl, innsendingsId), {
      accessToken,
      accept: 'application/json',
      headers: createHeaders({ correlationId, innsendingsId }),
    });
  } catch (error) {
    throw normalizeApplicationError(error);
  }
};

const createSoknad = async <T>(props: CreateSoknadProps): Promise<DraftResponse<T>> => {
  const { baseUrl, accessToken, body, force, envQualifier, correlationId, innsendingsId } = props;
  const forceParam = force ? '?force=true' : '';
  logger.info('Creating soknad');

  const response = await http.post<T>(`${getDraftUrl(baseUrl)}${forceParam}`, body, {
    accessToken,
    responseType: 'metadata',
    headers: createHeaders({ correlationId, envQualifier, innsendingsId }),
  });

  return {
    status: response.status,
    body: response.body as T,
  };
};

const updateSoknad = async <T>(props: DraftMutationProps): Promise<T> => {
  const { baseUrl, accessToken, body, innsendingsId, correlationId } = props;
  logger.info(`Updating soknad ${innsendingsId}`);

  try {
    return await http.put<T>(getDraftUrl(baseUrl, innsendingsId), body, {
      accessToken,
      headers: createHeaders({ correlationId, innsendingsId }),
    });
  } catch (error) {
    throw normalizeApplicationError(error);
  }
};

const deleteSoknad = async <T>(props: ApplicationBaseProps): Promise<T> => {
  const { baseUrl, accessToken, innsendingsId, correlationId } = props;
  logger.info(`Deleting soknad ${innsendingsId}`);

  try {
    return await http.delete<T>(getDraftUrl(baseUrl, innsendingsId), undefined, {
      accessToken,
      headers: createHeaders({ correlationId, innsendingsId }),
    });
  } catch (error) {
    throw normalizeApplicationError(error);
  }
};

/**
 * @deprecated Use submitApplication instead. This function is kept for backward compatibility with older versions of the API.
 */
const submitUtfyltSoknad = async (props: SubmitUtfyltSoknadProps) => {
  const { baseUrl, accessToken, body, innsendingsId, envQualifier, correlationId } = props;
  logger.info(`Submitting utfylt soknad ${innsendingsId}`);

  let response;
  try {
    response = await http.put(getSubmittedDraftUrl(baseUrl, innsendingsId), body, {
      accessToken,
      redirect: 'manual',
      responseType: 'metadata',
      headers: createHeaders({ correlationId, envQualifier, innsendingsId }),
    });
  } catch (error) {
    throw normalizeApplicationError(error);
  }

  return {
    status: response.status,
    location: response.headers.location,
  };
};

const uploadAttachment = async (props: UploadAttachmentProps): Promise<UploadedFile> => {
  const {
    baseUrl,
    accessToken,
    innsendingsId,
    attachmentId,
    type,
    fileBlob,
    fileName,
    correlationId,
    logMeta = {},
  } = props;
  const targetUrl = getAttachmentsUrl({ baseUrl, innsendingsId, attachmentId, type });
  logger.info(`${innsendingsId}: Uploading attachment for ${type} application`, {
    ...logMeta,
    attachmentId,
    correlationId,
    targetUrl,
  });

  const formData = new FormData();
  formData.append('file', fileBlob, fileName);

  let response;
  try {
    response = await http.postMultipart<UploadAttachmentResponse>(targetUrl, formData, {
      accessToken,
      headers: createHeaders({ correlationId, innsendingsId }),
    });
  } catch (error) {
    const normalizedError = createUploadAttachmentError(normalizeApplicationError(error));
    logger.warn(`${innsendingsId}: Failed to upload attachment for ${type} application`, {
      ...logMeta,
      attachmentId,
      correlationId: normalizedError.correlationId ?? correlationId,
      errorCode: normalizedError.errorCode,
      errorMessage: normalizedError.message,
      httpResponseStatus: getStatusFromErrorCode(normalizedError.errorCode),
      targetUrl,
    });
    throw normalizedError;
  }

  logger.info(`${innsendingsId}: Successfully uploaded attachment for ${type} application`, {
    ...logMeta,
    attachmentId,
    correlationId,
    targetUrl,
  });

  return createUploadedFile(response, innsendingsId, attachmentId);
};

const deleteAttachment = async (props: DeleteAttachmentProps): Promise<void> => {
  const { baseUrl, accessToken, innsendingsId, attachmentId, type, fileId, correlationId, logMeta = {} } = props;
  if (fileId && !validatorUtils.isValidUuid(fileId)) {
    throw new Error('Invalid fileId provided for deletion');
  }

  const targetUrl = getAttachmentsUrl({ baseUrl, innsendingsId, attachmentId, type, fileId });
  logger.info(`${innsendingsId}: Deleting attachment for ${type} application`, {
    ...logMeta,
    attachmentId,
    correlationId,
    fileId,
    targetUrl,
  });

  try {
    await http.delete(targetUrl, undefined, {
      accessToken,
      headers: createHeaders({ correlationId, innsendingsId }),
    });
  } catch (error) {
    const normalizedError = normalizeApplicationError(error);
    logger.warn(`${innsendingsId}: Failed to delete attachment for ${type} application`, {
      ...logMeta,
      attachmentId,
      correlationId: normalizedError.correlationId ?? correlationId,
      errorCode: normalizedError.errorCode,
      errorMessage: normalizedError.message,
      fileId,
      httpResponseStatus: getStatusFromErrorCode(normalizedError.errorCode),
      targetUrl,
    });
    throw normalizedError;
  }

  logger.info(`${innsendingsId}: Successfully deleted attachment for ${type} application`, {
    ...logMeta,
    attachmentId,
    correlationId,
    fileId,
    targetUrl,
  });
};

const downloadAttachment = async (props: DownloadAttachmentProps): Promise<DownloadedAttachment> => {
  const { baseUrl, accessToken, innsendingsId, attachmentId, type, fileId, correlationId, logMeta = {} } = props;
  if (!validatorUtils.isValidUuid(fileId)) {
    throw new Error('Invalid fileId provided for download');
  }

  const targetUrl = getAttachmentsUrl({ baseUrl, innsendingsId, attachmentId, type, fileId });
  logger.info(`${innsendingsId}: Downloading attachment for ${type} application`, {
    ...logMeta,
    attachmentId,
    correlationId,
    fileId,
    targetUrl,
  });
  let response;
  try {
    response = await http.get(targetUrl, {
      accessToken,
      responseType: 'stream',
      headers: createHeaders({ correlationId, innsendingsId }),
    });
  } catch (error) {
    const normalizedError = normalizeApplicationError(error);
    logger.warn(`${innsendingsId}: Failed to download attachment for ${type} application`, {
      ...logMeta,
      attachmentId,
      correlationId: normalizedError.correlationId ?? correlationId,
      errorCode: normalizedError.errorCode,
      errorMessage: normalizedError.message,
      fileId,
      httpResponseStatus: getStatusFromErrorCode(normalizedError.errorCode),
      targetUrl,
    });
    throw normalizedError;
  }

  if (!response.body) {
    logger.warn(`${innsendingsId}: Download response body missing for ${type} application`, {
      ...logMeta,
      attachmentId,
      correlationId,
      fileId,
      targetUrl,
    });
    throw new Error('Missing response body while downloading file');
  }

  logger.info(`${innsendingsId}: Successfully downloaded attachment for ${type} application`, {
    ...logMeta,
    attachmentId,
    contentLength: response.headers['content-length'],
    correlationId,
    fileId,
    targetUrl,
  });

  return {
    body: response.body,
    contentType: response.headers['content-type'] ?? 'application/octet-stream',
    contentDisposition: response.headers['content-disposition'],
    contentLength: response.headers['content-length'],
  };
};

const submitApplication = async (props: SubmitApplicationProps): Promise<SubmitApplicationResponse> => {
  const { baseUrl, accessToken, innsendingsId, type, body, correlationId, logMeta = {} } = props;
  const targetUrl = getApplicationUrl(baseUrl, type, innsendingsId);
  logger.info(`${innsendingsId}: Submitting ${type} application`, {
    ...logMeta,
    correlationId,
    targetUrl,
  });

  try {
    const response = await http.post<SubmitApplicationResponse>(targetUrl, body, {
      accessToken,
      headers: createHeaders({ correlationId, innsendingsId }),
    });
    logger.info(`${innsendingsId}: Successfully submitted ${type} application`, logMeta);
    return response;
  } catch (error) {
    const normalizedError = createSubmitApplicationError(normalizeApplicationError(error), type);
    logger.warn(`${innsendingsId}: Failed to submit ${type} application`, {
      ...logMeta,
      correlationId: normalizedError.correlationId ?? correlationId,
      errorCode: normalizedError.errorCode,
      errorMessage: normalizedError.message,
      httpResponseStatus: getStatusFromErrorCode(normalizedError.errorCode),
      targetUrl,
    });
    throw normalizedError;
  }
};

const applicationClient = {
  createSoknad,
  deleteAttachment,
  deleteSoknad,
  downloadAttachment,
  getSoknad,
  submitApplication,
  submitUtfyltSoknad,
  updateSoknad,
  uploadAttachment,
};

export default applicationClient;
