import { UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { useAppConfig } from '../../context/config/configContext';
import { deleteFiles, postFile } from './fileUploader';

const url = '/fyllut/api/nologin-file';

const useNologinFileUpload = () => {
  const config = useAppConfig();

  const uploadFile = async (file: File, attachmentId: string, token?: string): Promise<UploadedFile> => {
    const searchParams = `?attachmentId=${attachmentId}`;
    return await postFile(`${url}${searchParams}`, file, config, token);
  };

  const deleteFile = async (fileId: string, token?: string): Promise<void> => {
    return deleteFiles(`${url}/${fileId}`, config, token);
  };

  const deleteAllFilesForAttachment = async (attachmentId: string, token?: string): Promise<void> => {
    return deleteFiles(`${url}?attachmentId=${attachmentId}`, config, token);
  };

  const deleteAllFiles = async (token?: string): Promise<void> => {
    return deleteFiles(url, config, token);
  };

  return { uploadFile, deleteFile, deleteAllFilesForAttachment, deleteAllFiles };
};

export default useNologinFileUpload;
