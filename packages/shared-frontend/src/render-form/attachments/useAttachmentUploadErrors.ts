import { useState } from 'react';

type AttachmentErrorType = 'FILE' | 'VALUE' | 'TITLE';
type AttachmentError = { message: string; type: AttachmentErrorType };

const useAttachmentUploadErrors = () => {
  const [errors, setErrors] = useState<Record<string, AttachmentError[]>>({});

  const addError = (attachmentId: string, message: string, type: AttachmentErrorType) => {
    setErrors((current) => {
      const currentErrors = current[attachmentId] ?? [];
      const index = currentErrors.findIndex((error) => error.type === type);
      const nextErrors =
        index < 0
          ? [...currentErrors, { message, type }]
          : currentErrors.map((error, errorIndex) => (errorIndex === index ? { message, type } : error));
      return { ...current, [attachmentId]: nextErrors };
    });
  };

  const removeError = (attachmentId: string) => {
    setErrors((current) => {
      const { [attachmentId]: _removed, ...remaining } = current;
      return remaining;
    });
  };

  return { addError, errors, removeAllErrors: () => setErrors({}), removeError };
};

export { useAttachmentUploadErrors };
export type { AttachmentError, AttachmentErrorType };
