import { FileObject } from '@navikt/ds-react';
import { Submission, TEXTS, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useState } from 'react';
import { submitCaptchaValue } from '../../api/captcha/captcha';
import {
  deleteAllFiles,
  deleteAttachment,
  deleteFile,
  uploadFile,
} from '../../api/nologin-file-upload/nologinFileUpload';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';

interface AttachmentUploadContextType {
  handleUploadFile: (attachmentId: string, file: FileObject) => Promise<void>;
  handleDeleteFile: (attachmentId: string, fileId: string) => Promise<void>;
  handleDeleteAttachment: (attachmentId: string) => Promise<void>;
  handleDeleteAllFiles: () => Promise<void>;
  addError: (attachmentId: string, error: string) => void;
  setCaptchaValue: (value: Record<string, string>) => void;
  uploadedFiles: UploadedFile[];
  errors: Record<string, string | undefined>;
}

const initialContext: AttachmentUploadContextType = {
  handleUploadFile: async () => {},
  handleDeleteFile: async () => {},
  handleDeleteAttachment: async () => {},
  handleDeleteAllFiles: async () => {},
  addError: () => {},
  setCaptchaValue: () => {},
  uploadedFiles: [],
  errors: {},
};

const AttachmentUploadContext = createContext<AttachmentUploadContextType>(initialContext);

const AttachmentUploadProvider = ({ children }: { children: React.ReactNode }) => {
  const config = useAppConfig();
  const { setInnsendingsId } = useSendInn();
  const { submission, setSubmission } = useForm();
  const { translate } = useLanguages();
  const [captchaValue, setCaptchaValue] = useState<Record<string, string>>({});
  const [nologinToken, setNologinToken] = useState<string | undefined>(undefined);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const uploadedFiles = submission?.uploadedFiles ?? [];

  const addToSubmission = (file: UploadedFile) => {
    setSubmission(
      (current) => ({ ...current, uploadedFiles: [...(current?.uploadedFiles ?? []), file] }) as Submission,
    );
  };
  const removeFileFromSubmission = (fileId: string) => {
    setSubmission(
      (current) =>
        ({
          ...current,
          uploadedFiles: (current?.uploadedFiles ?? []).filter((file) => file.fileId !== fileId),
        }) as Submission,
    );
  };

  const removeFilesFromSubmission = (attachmentId: string) => {
    setSubmission(
      (current) =>
        ({
          ...current,
          uploadedFiles: (current?.uploadedFiles ?? []).filter((file) => file.attachmentId !== attachmentId),
        }) as Submission,
    );
  };

  const addError = (attachmentId: string, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [attachmentId]: error,
    }));
  };

  const removeError = (attachmentId: string) => {
    setErrors((prev) => {
      const { [attachmentId]: _, ...rest } = prev; // Remove the error for the specific attachmentId
      return rest;
    });
  };

  const getNologinToken = async () => {
    if (!nologinToken) {
      const { access_token: token } = await submitCaptchaValue(captchaValue, config);
      setNologinToken(token);
      return token;
    }
    return nologinToken;
  };

  const handleUploadFile = async (attachmentId: string, file: FileObject) => {
    try {
      removeError(attachmentId);
      const token = await getNologinToken();
      const result = await uploadFile(file.file, attachmentId, token);
      if (result) {
        addToSubmission(result);
        setInnsendingsId(result.innsendingId);
      }
    } catch (_e) {
      addError(attachmentId, translate(TEXTS.statiske.uploadId.uploadFileError));
    }
  };

  const handleDeleteFile = async (attachmentId: string, fileId: string) => {
    try {
      console.log('token', nologinToken);
      removeError(attachmentId);
      await deleteFile(fileId, nologinToken);
      removeFileFromSubmission(fileId);
    } catch (_e) {
      addError(attachmentId, translate(TEXTS.statiske.uploadId.deleteFileError));
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      console.log('token', nologinToken);
      removeError(attachmentId);
      await deleteAttachment(attachmentId, nologinToken);
      removeFilesFromSubmission(attachmentId);
    } catch (_e) {
      addError(attachmentId, translate(TEXTS.statiske.uploadId.deleteAttachmentError));
    }
  };

  const handleDeleteAllFiles = async () => {
    try {
      console.log('token', nologinToken);
      setErrors({});
      await deleteAllFiles(nologinToken);
      setSubmission((current) => ({ ...current, uploadedFiles: [] }) as Submission);
    } catch (e) {
      addError('allFiles', translate(TEXTS.statiske.uploadId.deleteAllFilesError));
      throw e;
    }
  };

  const value = {
    handleUploadFile,
    handleDeleteFile,
    handleDeleteAttachment,
    handleDeleteAllFiles,
    addError,
    setCaptchaValue,
    uploadedFiles,
    errors,
  };
  return <AttachmentUploadContext.Provider value={value}>{children}</AttachmentUploadContext.Provider>;
};

const useAttachmentUpload = () => useContext(AttachmentUploadContext);

export default AttachmentUploadProvider;
export { useAttachmentUpload };
