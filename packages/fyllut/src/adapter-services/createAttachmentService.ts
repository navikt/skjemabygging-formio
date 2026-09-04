import { UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import {
  AttachmentApplication,
  AttachmentService,
  FyllutHttp,
  FyllutHttpHeaders,
} from '@navikt/skjemadigitalisering-shared-frontend';

interface Props {
  http: FyllutHttp;
  backendBaseUrl: string;
}

const getApplicationUrl = (backendBaseUrl: string, application: AttachmentApplication) =>
  application.type === 'draft'
    ? `${backendBaseUrl}/api/send-inn/digital-application/${application.id ?? ''}`
    : `${backendBaseUrl}/api/send-inn/nologin-application`;

const getHeaders = (application: AttachmentApplication): FyllutHttpHeaders | undefined =>
  application.type === 'noLogin' && application.token ? { NologinToken: application.token } : undefined;

const createAttachmentService = ({ http, backendBaseUrl }: Props): AttachmentService => ({
  uploadFile: ({ application, attachmentId, file }) => {
    const formData = new FormData();
    formData.append('filinnhold', file);
    return http.postFile<UploadedFile>(
      `${getApplicationUrl(backendBaseUrl, application)}/attachments/${attachmentId}`,
      formData,
      getHeaders(application),
    );
  },
  deleteFile: async ({ application, attachmentId, fileId }) => {
    await http.delete(
      `${getApplicationUrl(backendBaseUrl, application)}/attachments/${attachmentId}/${fileId}`,
      undefined,
      getHeaders(application),
    );
  },
  downloadFile: ({ application, attachmentId, fileId }) =>
    http.get<Blob>(
      `${getApplicationUrl(backendBaseUrl, application)}/attachments/${attachmentId}/${fileId}`,
      getHeaders(application),
    ),
  deleteAllFilesForAttachment: async ({ application, attachmentId }) => {
    await http.delete(
      `${getApplicationUrl(backendBaseUrl, application)}/attachments/${attachmentId}`,
      undefined,
      getHeaders(application),
    );
  },
  deleteAllFiles: async (application) => {
    await http.delete(getApplicationUrl(backendBaseUrl, application), undefined, getHeaders(application));
  },
});

export default createAttachmentService;
