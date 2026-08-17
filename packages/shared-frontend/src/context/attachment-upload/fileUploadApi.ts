import type { UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import type { FyllutHttp } from '../fyllut/FyllutAppConfigContext';
import { normalizeAttachmentDownloadBlob } from './attachmentUploadUtils';

type ApplicationType = 'nologin' | 'digital';

const getUrl = (type: ApplicationType, innsendingsId?: string) =>
  type === 'digital'
    ? `/fyllut/api/send-inn/digital-application/${innsendingsId ?? ''}`
    : '/fyllut/api/send-inn/nologin-application';

const getHeaders = (token?: string) => (token ? { NologinToken: token } : undefined);

const postFile = async (http: FyllutHttp, url: string, file: File, token?: string): Promise<UploadedFile> => {
  const formData = new FormData();
  formData.append('filinnhold', file);
  return http.postFile<UploadedFile>(url, formData, getHeaders(token));
};

const getFileUploadApi = (http: FyllutHttp | undefined, type: ApplicationType = 'nologin', innsendingsId?: string) => {
  if (!http) {
    throw new Error('Fyllut HTTP client is required for file uploads.');
  }
  const url = getUrl(type, innsendingsId);

  return {
    uploadFile: (file: File, attachmentId: string, token?: string) =>
      postFile(http, `${url}/attachments/${attachmentId}`, file, token),
    deleteFile: (attachmentId: string, fileId: string, token?: string) =>
      http.delete(`${url}/attachments/${attachmentId}/${fileId}`, undefined, getHeaders(token)),
    downloadFile: async (attachmentId: string, fileId: string, token?: string) =>
      normalizeAttachmentDownloadBlob(
        await http.get<Blob>(`${url}/attachments/${attachmentId}/${fileId}`, getHeaders(token)),
      ),
    deleteAllFilesForAttachment: (attachmentId: string, token?: string) =>
      http.delete(`${url}/attachments/${attachmentId}`, undefined, getHeaders(token)),
    deleteAllFiles: (token?: string) => http.delete(url, undefined, getHeaders(token)),
  };
};

const downloadBlob = (content: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;

  try {
    link.click();
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }
};

export { downloadBlob, getFileUploadApi };
