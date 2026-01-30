import { Alert, FileUpload, FormSummary, Label, VStack } from '@navikt/ds-react';
import { SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../../types';

const SummaryAttachmentUpload = (props: FormComponentProps) => {
  const { component, submission, translate, formProperties } = props;
  const { label } = component;
  const submissionAttachments = submission?.attachments?.filter(
    (attachment) => component.navId && attachment.attachmentId.startsWith(component.navId),
  );
  const showDeadline = (submissionAttachment: SubmissionAttachment) =>
    submissionAttachment?.value && !!component.attachmentValues?.[submissionAttachment.value]?.showDeadline;
  const hasUploadedFiles = (submissionAttachment: SubmissionAttachment) =>
    (submissionAttachment?.files ?? []).length > 0;

  if (submissionAttachments === undefined || !submissionAttachments.some((att) => att.value)) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <FormSummary.Label>{translate(label)}</FormSummary.Label>
      <VStack gap="space-4">
        {submissionAttachments.map((submissionAttachment) =>
          hasUploadedFiles(submissionAttachment) ? (
            <FormSummary.Value key={submissionAttachment.attachmentId}>
              {submissionAttachment.title && <Label>{translate(submissionAttachment.title)}</Label>}
              <VStack gap="2" as="ul">
                {(submissionAttachment.files ?? []).map((file) => (
                  <FileUpload.Item
                    as="li"
                    key={file.fileId}
                    file={{ name: file.fileName, size: file.size }}
                  ></FileUpload.Item>
                ))}
              </VStack>
            </FormSummary.Value>
          ) : (
            <FormSummary.Value key={submissionAttachment.attachmentId}>
              {translate(TEXTS.statiske.attachment[submissionAttachment.value])}
              {submissionAttachment.additionalDocumentation && (
                <div>{translate(submissionAttachment.additionalDocumentation)}</div>
              )}
              {showDeadline(submissionAttachment) && formProperties?.ettersendelsesfrist && (
                <Alert variant="warning">
                  {translate(TEXTS.statiske.attachment.deadline, {
                    deadline: formProperties?.ettersendelsesfrist,
                  })}
                </Alert>
              )}
            </FormSummary.Value>
          ),
        )}
      </VStack>
    </FormSummary.Answer>
  );
};

export default SummaryAttachmentUpload;
