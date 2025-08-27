import { FileObject } from '@navikt/ds-react';
import { Submission, SubmissionAttachment, TEXTS, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useState } from 'react';
import { submitCaptchaValue } from '../../api/captcha/captcha';
import useNologinFileUpload from '../../api/nologin-file-upload/nologinFileUpload';
import http from '../../api/util/http/http';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';

type ErrorType = 'FILE' | 'INPUT';
interface AttachmentUploadContextType {
  handleUploadFile: (attachmentId: string, file: FileObject) => Promise<void>;
  handleDeleteFile: (attachmentId: string, fileId: string) => Promise<void>;
  handleDeleteAttachment: (attachmentId: string) => Promise<void>;
  handleDeleteAllFiles: () => Promise<void>;
  addError: (attachmentId: string, error: string, type: ErrorType) => void;
  setCaptchaValue: (value: Record<string, string>) => void;
  removeError: (attachmentId: string) => void;
  submissionAttachments: SubmissionAttachment[];
  changeAttachmentValue: (attachmentId: string, value?: string, description?: string) => void;
  errors: Record<string, { message: string; type: ErrorType } | undefined>;
}

const initialContext: AttachmentUploadContextType = {
  handleUploadFile: async () => {},
  handleDeleteFile: async () => {},
  handleDeleteAttachment: async () => {},
  handleDeleteAllFiles: async () => {},
  addError: () => {},
  setCaptchaValue: () => {},
  removeError: () => {},
  submissionAttachments: [],
  changeAttachmentValue: () => {},
  errors: {},
};

const AttachmentUploadContext = createContext<AttachmentUploadContextType>(initialContext);

const AttachmentUploadProvider = ({ children }: { children: React.ReactNode }) => {
  const config = useAppConfig();
  const { submission, setSubmission } = useForm();
  const { nologinToken, setNologinToken } = useSendInn();
  const { deleteAllFiles, deleteAttachment, deleteFile, uploadFile } = useNologinFileUpload();
  const { translate } = useLanguages();
  const [captchaValue, setCaptchaValue] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, { message: string; type: ErrorType } | undefined>>({});

  const addFileToSubmission = (file: UploadedFile) => {
    setSubmission((current) => {
      const attachment = current?.attachments?.find((att) => att.attachmentId === file.attachmentId);
      if (!attachment) {
        throw new Error(`${file.attachmentId} not found`);
      }
      return {
        ...current,
        attachments: (current?.attachments ?? []).map((att) => {
          if (att.attachmentId === file.attachmentId) {
            return { ...att, files: [...(att.files ?? []), file] };
          }
          return att;
        }),
      } as Submission;
    });
  };

  const removeFileFromSubmission = (attachmentId: string, fileId: string) => {
    setSubmission(
      (current) =>
        ({
          ...current,
          attachments: (current?.attachments ?? []).map((att) => {
            if (att.attachmentId === attachmentId) {
              return { ...att, files: (att.files ?? []).filter((file) => file.fileId !== fileId) };
            }
            return att;
          }),
        }) as Submission,
    );
  };

  const removeFilesFromSubmission = (attachmentId: string) => {
    setSubmission(
      (current) =>
        ({
          ...current,
          attachments: (current?.attachments ?? []).map((att) => {
            if (att.attachmentId === attachmentId) {
              return { ...att, files: [] };
            }
            return att;
          }),
        }) as Submission,
    );
  };

  const addError = (attachmentId: string, message: string, type: ErrorType) => {
    setErrors((prev) => ({
      ...prev,
      [attachmentId]: { message, type },
    }));
  };

  const removeError = (attachmentId: string) => {
    setErrors((prev) => {
      const { [attachmentId]: _, ...rest } = prev; // Remove the error for the specific attachmentId
      return rest;
    });
  };

  const resolveCaptcha = async () => {
    if (!nologinToken) {
      const response = await submitCaptchaValue(captchaValue, config);
      if (response?.access_token) {
        setNologinToken(response.access_token);
      }
      return response?.access_token;
    }
    return nologinToken;
  };

  const handleApiError = (attachmentId: string, error: any, message: string) => {
    if (error instanceof http.HttpError && error.status === 401) {
      addError(attachmentId, translate(TEXTS.statiske.uploadId.tokenExpiredError), 'FILE');
    } else {
      addError(attachmentId, message, 'FILE');
    }
  };

  const handleUploadFile = async (attachmentId: string, file: FileObject) => {
    try {
      removeError(attachmentId);
      const token = await resolveCaptcha();
      const result = await uploadFile(file.file, attachmentId, token);
      if (result) {
        addFileToSubmission(result);
      }
    } catch (error: any) {
      setNologinToken(undefined);
      handleApiError(attachmentId, error, translate(TEXTS.statiske.uploadId.uploadFileError));
    }
  };

  const handleDeleteFile = async (attachmentId: string, fileId: string) => {
    try {
      removeError(attachmentId);
      await deleteFile(fileId, nologinToken);
      removeFileFromSubmission(attachmentId, fileId);
    } catch (error: any) {
      handleApiError(attachmentId, error, translate(TEXTS.statiske.uploadId.deleteFileError));
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      removeError(attachmentId);
      await deleteAttachment(attachmentId, nologinToken);
      removeFilesFromSubmission(attachmentId);
    } catch (error: any) {
      handleApiError(attachmentId, error, translate(TEXTS.statiske.uploadId.deleteAttachmentError));
    }
  };

  const handleDeleteAllFiles = async () => {
    try {
      setErrors({});
      await deleteAllFiles(nologinToken);
      setSubmission((current) => ({ ...current, attachments: [] }) as Submission);
    } catch (error: any) {
      handleApiError('allFiles', error, translate(TEXTS.statiske.uploadId.deleteAllFilesError));
      throw error;
    }
  };

  const changeAttachmentValue = (attachmentId: string, value?: string, description?: string) => {
    // TODO: consider reducer or help functions
    setSubmission((current) => {
      const currentAttachment = current?.attachments?.find((att) => att.attachmentId === attachmentId);
      if (!currentAttachment) {
        return {
          ...current,
          attachments: [...(current?.attachments ?? []), { attachmentId, value, files: [] }],
        } as Submission;
      }
      const updatedAttachments = current?.attachments?.map((att) => {
        if (att.attachmentId !== attachmentId) {
          return att;
        }
        return { ...att, value: value ?? att.value, description: description ?? att.description };
      });
      return { ...current, attachments: updatedAttachments } as Submission;
    });
  };

  const value = {
    handleUploadFile,
    handleDeleteFile,
    handleDeleteAttachment,
    handleDeleteAllFiles,
    addError,
    setCaptchaValue,
    removeError,
    changeAttachmentValue,
    submissionAttachments: submission?.attachments ?? [],
    errors,
  };
  return <AttachmentUploadContext.Provider value={value}>{children}</AttachmentUploadContext.Provider>;
};

const useAttachmentUpload = () => useContext(AttachmentUploadContext);

export default AttachmentUploadProvider;
export { useAttachmentUpload };
