import { Submission, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { Dispatch, SetStateAction } from 'react';

const useAttachmentUploadValues = ({
  setSubmission,
  removeError,
}: {
  setSubmission: Dispatch<SetStateAction<Submission | undefined>>;
  removeError: (attachmentId: string) => void;
}) => {
  const changeAttachmentValue = (
    attachment: SubmissionAttachment,
    values?: Pick<SubmissionAttachment, 'value' | 'title' | 'additionalDocumentation'>,
    validator?: { validate: (label: string, attachment: SubmissionAttachment) => string | undefined },
  ) => {
    const nextAttachment = { ...attachment, ...values };
    if (validator && !validator.validate('', nextAttachment)) {
      removeError(attachment.attachmentId);
    }

    setSubmission((current) => {
      const existing = current?.attachments?.find((entry) => entry.attachmentId === attachment.attachmentId);
      if (!existing) {
        return {
          ...current,
          attachments: [...(current?.attachments ?? []), { ...nextAttachment, files: [] }],
        } as Submission;
      }
      return {
        ...current,
        attachments: (current?.attachments ?? []).map((entry) =>
          entry.attachmentId === attachment.attachmentId
            ? {
                ...entry,
                value: values?.value,
                title: values?.title,
                additionalDocumentation: values?.additionalDocumentation,
              }
            : entry,
        ),
      } as Submission;
    });
  };

  return { changeAttachmentValue };
};

export { useAttachmentUploadValues };
