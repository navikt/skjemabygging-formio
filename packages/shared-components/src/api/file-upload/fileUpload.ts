import { UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { normalizeAttachmentDownloadBlob } from '../../components/attachment/utils/attachmentUploadUtils';
import { deleteFiles, getFile, postFile } from './fileUploader';

type ApplicationType = 'nologin' | 'digital';

const getUrl = (type: ApplicationType, innsendingsId?: string) =>
  `/fyllut/api/send-inn/${type}-application${innsendingsId ? `/${innsendingsId}` : ''}`;

const useFileUpload = (type: ApplicationType = 'nologin', innsendingsId?: string) => {
  const url = getUrl(type, innsendingsId);

  const uploadFile = async (file: File, attachmentId: string, token?: string): Promise<UploadedFile> => {
    return await postFile(`${url}/attachments/${attachmentId}`, file, token);
  };

  const deleteFile = async (attachmentId: string, fileId: string, token?: string): Promise<void> => {
    return deleteFiles(`${url}/attachments/${attachmentId}/${fileId}`, token);
  };

  const downloadFile = async (attachmentId: string, fileId: string, token?: string): Promise<Blob> => {
    const blob = await getFile(`${url}/attachments/${attachmentId}/${fileId}`, token);
    return normalizeAttachmentDownloadBlob(blob);
  };

  const deleteAllFilesForAttachment = async (attachmentId: string, token?: string): Promise<void> => {
    return deleteFiles(`${url}/attachments/${attachmentId}`, token);
  };

  const deleteAllFiles = async (token?: string): Promise<void> => {
    return deleteFiles(url, token);
  };

  return { uploadFile, downloadFile, deleteFile, deleteAllFilesForAttachment, deleteAllFiles };
};

export default useFileUpload;
