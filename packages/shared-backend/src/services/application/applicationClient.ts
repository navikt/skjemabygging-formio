import { UploadedFile, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';
import type {
  ApplicationPaths,
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
}

interface DraftBaseProps extends ApplicationBaseProps {
  paths: ApplicationPaths;
}

interface DraftMutationProps extends DraftBaseProps {
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

const getSoknad = async <T>(props: DraftBaseProps): Promise<T> => {
  const { baseUrl, paths, accessToken, innsendingsId, correlationId } = props;
  logger.info(`Getting soknad ${innsendingsId}`);

  return await http.get<T>(getDraftUrl(baseUrl, paths.soknad, innsendingsId), {
    accessToken,
    accept: 'application/json',
    headers: createHeaders({ correlationId, innsendingsId }),
  });
};

const createSoknad = async <T>(props: CreateSoknadProps): Promise<DraftResponse<T>> => {
  const { baseUrl, paths, accessToken, body, force, envQualifier, correlationId, innsendingsId } = props;
  const forceParam = force ? '?force=true' : '';
  logger.info('Creating soknad');

  const response = await http.post<T>(`${getDraftUrl(baseUrl, paths.soknad)}${forceParam}`, body, {
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
  const { baseUrl, paths, accessToken, body, innsendingsId, correlationId } = props;
  logger.info(`Updating soknad ${innsendingsId}`);

  return await http.put<T>(getDraftUrl(baseUrl, paths.soknad, innsendingsId), body, {
    accessToken,
    headers: createHeaders({ correlationId, innsendingsId }),
  });
};

const deleteSoknad = async <T>(props: DraftBaseProps): Promise<T> => {
  const { baseUrl, paths, accessToken, innsendingsId, correlationId } = props;
  logger.info(`Deleting soknad ${innsendingsId}`);

  return await http.delete<T>(getDraftUrl(baseUrl, paths.soknad, innsendingsId), undefined, {
    accessToken,
    headers: createHeaders({ correlationId, innsendingsId }),
  });
};

const submitUtfyltSoknad = async (props: SubmitUtfyltSoknadProps) => {
  const { baseUrl, paths, accessToken, body, innsendingsId, envQualifier, correlationId } = props;
  logger.info(`Submitting utfylt soknad ${innsendingsId}`);

  const response = await http.put(getDraftUrl(baseUrl, paths.utfyltSoknad, innsendingsId), body, {
    accessToken,
    redirect: 'manual',
    responseType: 'metadata',
    headers: createHeaders({ correlationId, envQualifier, innsendingsId }),
  });

  return {
    status: response.status,
    location: response.headers.location,
  };
};

const uploadAttachment = async (props: UploadAttachmentProps): Promise<UploadedFile> => {
  const { baseUrl, accessToken, innsendingsId, attachmentId, type, fileBlob, fileName, correlationId } = props;
  logger.info(`${innsendingsId}: Uploading attachment for ${type} application`);

  const formData = new FormData();
  formData.append('file', fileBlob, fileName);

  const response = await http.postMultipart<UploadAttachmentResponse>(
    getAttachmentsUrl({ baseUrl, innsendingsId, attachmentId, type }),
    formData,
    {
      accessToken,
      headers: createHeaders({ correlationId, innsendingsId }),
    },
  );

  return createUploadedFile(response, innsendingsId, attachmentId);
};

const deleteAttachment = async (props: DeleteAttachmentProps): Promise<void> => {
  const { baseUrl, accessToken, innsendingsId, attachmentId, type, fileId, correlationId } = props;
  if (fileId && !validatorUtils.isValidUuid(fileId)) {
    throw new Error('Invalid fileId provided for deletion');
  }

  logger.info(`${innsendingsId}: Deleting attachment for ${type} application`);
  await http.delete(getAttachmentsUrl({ baseUrl, innsendingsId, attachmentId, type, fileId }), undefined, {
    accessToken,
    headers: createHeaders({ correlationId, innsendingsId }),
  });
};

const downloadAttachment = async (props: DownloadAttachmentProps): Promise<DownloadedAttachment> => {
  const { baseUrl, accessToken, innsendingsId, attachmentId, type, fileId, correlationId } = props;
  if (!validatorUtils.isValidUuid(fileId)) {
    throw new Error('Invalid fileId provided for download');
  }

  logger.info(`${innsendingsId}: Downloading attachment for ${type} application`);
  const response = await http.get(getAttachmentsUrl({ baseUrl, innsendingsId, attachmentId, type, fileId }), {
    accessToken,
    responseType: 'stream',
    headers: createHeaders({ correlationId, innsendingsId }),
  });

  if (!response.body) {
    throw new Error('Missing response body while downloading file');
  }

  return {
    body: response.body,
    contentType: response.headers['content-type'] ?? 'application/octet-stream',
    contentDisposition: response.headers['content-disposition'],
    contentLength: response.headers['content-length'],
  };
};

const submitApplication = async (props: SubmitApplicationProps): Promise<SubmitApplicationResponse> => {
  const { baseUrl, accessToken, innsendingsId, type, body, correlationId } = props;
  logger.info(`${innsendingsId}: Submitting ${type} application`);

  return await http.post<SubmitApplicationResponse>(getApplicationUrl(baseUrl, type, innsendingsId), body, {
    accessToken,
    headers: createHeaders({ correlationId, innsendingsId }),
  });
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
