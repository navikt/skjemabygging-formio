import { UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { deleteFiles, postFile } from './fileUploader';

const url = '/fyllut/api/nologin-file';

const useNologinFileUpload = () => {
  const uploadFile = async (file: File, attachmentId: string, token?: string): Promise<UploadedFile> => {
    const searchParams = `?attachmentId=${attachmentId}`;
    return await postFile(`${url}${searchParams}`, file, token);
  };

  const deleteFile = async (fileId: string, token?: string): Promise<void> => {
    return deleteFiles(`${url}/${fileId}`, token);
  };

  const deleteAttachment = async (attachmentId: string, token?: string): Promise<void> => {
    return deleteFiles(`${url}?attachmentId=${attachmentId}`, token);
  };

  const deleteAllFiles = async (token?: string): Promise<void> => {
    return deleteFiles(url, token);
  };

  return { uploadFile, deleteFile, deleteAttachment, deleteAllFiles };
};

export default useNologinFileUpload;
