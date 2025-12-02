import { FileItem, FileObject } from '@navikt/ds-react';
import { Submission, SubmissionAttachment, TEXTS, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useContext, useState } from 'react';
import { submitCaptchaValue } from '../../api/captcha/captcha';
import useNologinFileUpload from '../../api/nologin-file-upload/nologinFileUpload';
import http from '../../api/util/http/http';
import { MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES } from '../../constants/fileUpload';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import { validateFileUpload, validateTotalFilesSize } from '../../util/form/attachment-validation/attachmentValidation';

type ErrorType = 'FILE' | 'VALUE' | 'TITLE';
type ActionStatus = 'ok' | 'error' | 'auth-error' | 'invalid' | 'unknown';
interface AttachmentUploadContextType {
  handleUploadFile: (attachmentId: string, file: FileObject) => Promise<{ status: ActionStatus }>;
  handleDeleteFile: (attachmentId: string, fileId: string, file: FileItem) => Promise<void>;
  handleDeleteAttachment: (attachmentId: string) => Promise<void>;
  handleDeleteAllFiles: () => Promise<void>;
  addError: (attachmentId: string, error: string, type: ErrorType) => void;
  setCaptchaValue: (value: Record<string, string>) => void;
  removeError: (attachmentId: string) => void;
  removeAllErrors: () => void;
  submissionAttachments: SubmissionAttachment[];
  changeAttachmentValue: (
    attachment: SubmissionAttachment,
    values?: Pick<SubmissionAttachment, 'value' | 'title' | 'additionalDocumentation'>,
    validator?: { validate: (label: string, attachment: SubmissionAttachment) => string | undefined },
  ) => void;
  errors: Record<string, Array<{ message: string; type: ErrorType }>>;
  uploadsInProgress: Record<string, Record<string, FileObject>>;
}

const initialContext: AttachmentUploadContextType = {
  handleUploadFile: async () => Promise.resolve({ status: 'unknown' }),
  handleDeleteFile: async () => {},
  handleDeleteAttachment: async () => {},
  handleDeleteAllFiles: async () => {},
  addError: () => {},
  setCaptchaValue: () => {},
  removeError: () => {},
  removeAllErrors: () => {},
  submissionAttachments: [],
  changeAttachmentValue: () => {},
  errors: {},
  uploadsInProgress: {},
};

const AttachmentUploadContext = createContext<AttachmentUploadContextType>(initialContext);

const AttachmentUploadProvider = ({ useCaptcha, children }: { useCaptcha?: boolean; children: React.ReactNode }) => {
  const config = useAppConfig();
  const { submission, setSubmission } = useForm();
  const { nologinToken, setNologinToken, handleSessionExpired } = useSendInn();
  const { deleteAllFiles, deleteAttachment, deleteFile, uploadFile } = useNologinFileUpload();
  const { translate } = useLanguages();
  const [captchaValue, setCaptchaValue] = useState<Record<string, string>>({});
  const [uploadsInProgress, setUploadsInProgress] = useState<Record<string, Record<string, FileObject>>>({});
  const [errors, setErrors] = useState<Record<string, Array<{ message: string; type: ErrorType }>>>({});

  const fileIdentifier = (file: FileObject) => `${file.file.name}-${file.file.size}`;

  const addFileToSubmission = (file: UploadedFile) => {
    setSubmission((current) => {
      const attachment = current?.attachments?.find((att) => att.attachmentId === file.attachmentId);
      if (!attachment) {
        throw new Error(`${file.attachmentId} not found`);
      }
      return {
        ...current,
        data: { ...current?.data },
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
    setErrors((prev) => {
      const existingErrorIndex = prev[attachmentId]?.findIndex((error) => error.type === type);
      if (existingErrorIndex !== undefined && existingErrorIndex >= 0) {
        const updatedErrors = [...(prev[attachmentId] ?? [])];
        updatedErrors[existingErrorIndex] = { message, type };
        return {
          ...prev,
          [attachmentId]: updatedErrors,
        };
      }
      return {
        ...prev,
        [attachmentId]: [...(prev[attachmentId] ?? []), { message, type }],
      };
    });
  };

  const removeError = (attachmentId: string) => {
    setErrors((prev) => {
      const { [attachmentId]: _, ...rest } = prev; // Remove the error for the specific attachmentId
      return rest;
    });
  };

  const removeAllErrors = () => {
    setErrors({});
  };

  const resolveCaptcha = async () => {
    if (!nologinToken && useCaptcha) {
      const response = await submitCaptchaValue(captchaValue, config);
      if (response?.access_token) {
        setNologinToken(response.access_token);
      }
      return response?.access_token;
    }
    return nologinToken;
  };

  const isAuthenticationError = (error: any) => {
    return error instanceof http.UnauthenticatedError;
  };

  const isTooManyPagesError = (error: any) => {
    return error instanceof http.TooManyPagesError;
  };

  const validateTotalAttachmentSize = (attachmentId: string, file: FileObject): string | undefined => {
    const attachment = submission?.attachments?.find((attachment) => attachment.attachmentId === attachmentId);
    return validateTotalFilesSize(
      MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES,
      [...(attachment?.files ?? []), file.file],
      config.logger,
    );
  };

  const addFileInProgress = (attachmentId: string, file: FileObject) => {
    setUploadsInProgress((current): Record<string, Record<string, FileObject>> => {
      const currentFiles = current?.[attachmentId] ?? {};
      const identifier = fileIdentifier(file);
      return { ...current, [attachmentId]: { ...currentFiles, [identifier]: file } };
    });
  };

  const removeAllFilesInProgress = (attachmentId: string, predicate?: (file: FileObject) => boolean) => {
    setUploadsInProgress((current) => {
      const { [attachmentId]: currentFiles, ...rest } = current;
      if (predicate) {
        const filteredFiles = Object.fromEntries(
          Object.entries(currentFiles ?? {}).filter(([_, file]) => !predicate(file)),
        );
        return { ...rest, [attachmentId]: filteredFiles };
      }
      return rest;
    });
  };

  const removeFileInProgress = (attachmentId: string, identifier: string) => {
    setUploadsInProgress((current) => {
      const currentFiles = current?.[attachmentId] ?? {};
      if (currentFiles[identifier]) {
        const { [identifier]: _, ...rest } = currentFiles;
        return { ...current, [attachmentId]: rest };
      }
      return current;
    });
  };

  const handleUploadFile = async (attachmentId: string, file: FileObject): Promise<{ status: ActionStatus }> => {
    try {
      addFileInProgress(attachmentId, file);
      removeError(attachmentId);
      if (validateFileUpload(file, config.logger)) {
        addFileInProgress(attachmentId, file);
        return Promise.resolve({ status: 'invalid' });
      }

      const invalidAttachmentSize = validateTotalAttachmentSize(attachmentId, file);
      if (invalidAttachmentSize) {
        removeFileInProgress(attachmentId, fileIdentifier(file));
        addError(attachmentId, invalidAttachmentSize, 'FILE');
        return Promise.resolve({ status: 'invalid' });
      }

      const token = await resolveCaptcha();
      const result = await uploadFile(file.file, attachmentId, token);
      if (result) {
        removeAllFilesInProgress(attachmentId, (inProgress) => inProgress.error);
        removeFileInProgress(attachmentId, fileIdentifier(file));
        addFileToSubmission(result);
        return Promise.resolve({ status: 'ok' });
      }
      return Promise.resolve({ status: 'unknown' });
    } catch (error: any) {
      addFileInProgress(attachmentId, { ...file, error: true, reasons: ['uploadHttpError'] });
      if (isAuthenticationError(error)) {
        handleSessionExpired();
        return Promise.resolve({ status: 'auth-error' });
      } else if (isTooManyPagesError(error)) {
        addError(attachmentId, translate(TEXTS.statiske.uploadFile.uploadFileToManyPagesError), 'FILE');
      } else {
        addError(attachmentId, translate(TEXTS.statiske.uploadFile.uploadFileError), 'FILE');
      }
      return Promise.resolve({ status: 'error' });
    }
  };

  const handleDeleteFile = async (attachmentId: string, fileId: string) => {
    try {
      removeError(attachmentId);
      await deleteFile(fileId, nologinToken);
      removeFileFromSubmission(attachmentId, fileId);
    } catch (error: any) {
      if (isAuthenticationError(error)) {
        handleSessionExpired();
      } else {
        addError(fileId, translate(TEXTS.statiske.uploadFile.deleteFileError), 'FILE');
      }
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      removeError(attachmentId);
      await deleteAttachment(attachmentId, nologinToken);
      removeFilesFromSubmission(attachmentId);
    } catch (error: any) {
      if (isAuthenticationError(error)) {
        handleSessionExpired();
      } else {
        addError(attachmentId, translate(TEXTS.statiske.uploadFile.deleteAttachmentError), 'FILE');
      }
    }
  };

  const handleDeleteAllFiles = async () => {
    try {
      setErrors({});
      await deleteAllFiles(nologinToken);
      setSubmission((current) => ({ ...current, attachments: [] }) as Submission);
    } catch (error: any) {
      if (isAuthenticationError(error)) {
        handleSessionExpired();
      } else {
        addError('allFiles', translate(TEXTS.statiske.uploadFile.deleteAllFilesError), 'FILE');
      }
      throw error;
    }
  };

  const changeAttachmentValue = (
    attachment: SubmissionAttachment,
    values?: Pick<SubmissionAttachment, 'value' | 'title' | 'additionalDocumentation'>,
    validator?: { validate: (label: string, attachment: SubmissionAttachment) => string | undefined },
  ) => {
    if (validator) {
      const error = validator.validate('', { ...attachment, ...values });
      if (!error) {
        removeError(attachment.attachmentId);
      }
    }

    setSubmission((current) => {
      const currentAttachment = current?.attachments?.find((att) => att.attachmentId === attachment.attachmentId);
      if (!currentAttachment) {
        return {
          ...current,
          attachments: [...(current?.attachments ?? []), { ...attachment, ...values, files: [] }],
        } as Submission;
      }
      const updatedAttachments = current?.attachments?.map((att) => {
        if (att.attachmentId !== attachment.attachmentId) {
          return att;
        }
        return {
          ...att,
          value: values?.value ?? att.value,
          title: values?.title ?? att.title,
          additionalDocumentation: values?.additionalDocumentation ?? att.additionalDocumentation,
        };
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
    removeAllErrors,
    changeAttachmentValue,
    submissionAttachments: submission?.attachments ?? [],
    errors,
    uploadsInProgress,
  };
  return <AttachmentUploadContext.Provider value={value}>{children}</AttachmentUploadContext.Provider>;
};

const useAttachmentUpload = () => useContext(AttachmentUploadContext);

export default AttachmentUploadProvider;
export { useAttachmentUpload };
