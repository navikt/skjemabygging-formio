import { Alert, FileUpload, FormSummary, Label, VStack } from '@navikt/ds-react';
import { SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import formComponentUtils from '../../../utils/formComponent';

const SummaryAttachmentUpload = ({ component }) => {
  const { form, submission } = useForm();
  const { translate } = useLanguages();
  const { label } = component;
  const submissionAttachments = submission?.attachments?.filter((attachment) => {
    const navId = formComponentUtils.getNavId(component);
    return navId && attachment.attachmentId.startsWith(navId);
  });
  const showDeadline = (submissionAttachment: SubmissionAttachment) =>
    submissionAttachment?.value && !!component.attachmentValues?.[submissionAttachment.value]?.showDeadline;
  const hasUploadedFiles = (submissionAttachment: SubmissionAttachment) =>
    (submissionAttachment?.files ?? []).length > 0;

  if (submissionAttachments === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <FormSummary.Label>{translate(label)}</FormSummary.Label>
      <VStack gap="4">
        {submissionAttachments.map((submissionAttachment) =>
          hasUploadedFiles(submissionAttachment) ? (
            <FormSummary.Value key={submissionAttachment.attachmentId}>
              {submissionAttachment.title && <Label>{submissionAttachment.title}</Label>}
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
              {showDeadline(submissionAttachment) && form.properties?.ettersendelsesfrist && (
                <Alert variant="warning">
                  {translate(TEXTS.statiske.attachment.deadline, {
                    deadline: form.properties?.ettersendelsesfrist,
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
