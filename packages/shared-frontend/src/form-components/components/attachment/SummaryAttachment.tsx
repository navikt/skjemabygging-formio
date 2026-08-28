import { Alert, FileUpload, FormSummary, Label, VStack } from '@navikt/ds-react';
import {
  attachmentUtils,
  enableAttachmentDownload,
  navFormUtils,
  SubmissionAttachment,
  submissionUtils,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../types';

const SummaryAttachment = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate, formProperties, rendererConfig, handleDownloadFile } =
    props;
  const { submissionMethod } = rendererConfig;
  const attachmentUploadEnabled = attachmentUtils.enableAttachmentUpload(submissionMethod);
  const canDownloadAttachment = enableAttachmentDownload(submissionMethod) && !!handleDownloadFile;
  const pathValue = submissionUtils.getSubmissionValue(submissionPath, submission);
  const dataAttachments = attachmentUtils.toSubmissionAttachments(pathValue, component);
  const navId = navFormUtils.getNavId(component) ?? component.key;
  const attachments = (dataAttachments.length > 0 ? dataAttachments : (submission?.attachments ?? [])).filter(
    (attachment) => attachment.navId === navId,
  );

  const showDeadline = (attachment: SubmissionAttachment) =>
    attachment.value && !!component.attachmentValues?.[attachment.value]?.showDeadline;

  if (!attachments.some((attachment) => attachment.value)) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <FormSummary.Label>{translate(component.label)}</FormSummary.Label>
      <VStack gap="space-16">
        {attachments.map((attachment) =>
          (attachment.files ?? []).length > 0 ? (
            <FormSummary.Value key={attachment.attachmentId}>
              {attachment.title && <Label>{translate(attachment.title)}</Label>}
              <VStack gap="space-8" as="ul">
                {(attachment.files ?? []).map((file) => (
                  <FileUpload.Item
                    as="li"
                    key={file.fileId}
                    file={{ name: file.fileName, size: file.size }}
                    href={canDownloadAttachment ? '#' : undefined}
                    onFileClick={
                      canDownloadAttachment
                        ? (event) => {
                            event.preventDefault();
                            void handleDownloadFile(attachment.attachmentId, file.fileId, file.fileName);
                          }
                        : undefined
                    }
                  ></FileUpload.Item>
                ))}
              </VStack>
            </FormSummary.Value>
          ) : (
            <FormSummary.Value key={attachment.attachmentId}>
              <VStack gap="space-8">
                {translate(attachmentUtils.getAttachmentLabel(attachment.value!, submissionMethod))}
                {attachment.additionalDocumentation && <div>{translate(attachment.additionalDocumentation)}</div>}
                {showDeadline(attachment) &&
                  formProperties?.ettersendelsesfrist &&
                  (attachmentUploadEnabled ? (
                    <Alert variant="warning">
                      {translate(TEXTS.statiske.attachment.deadline, {
                        deadline: formProperties.ettersendelsesfrist,
                      })}
                    </Alert>
                  ) : (
                    <div>
                      {translate(TEXTS.statiske.attachment.deadline, {
                        deadline: formProperties.ettersendelsesfrist,
                      })}
                    </div>
                  ))}
              </VStack>
            </FormSummary.Value>
          ),
        )}
      </VStack>
    </FormSummary.Answer>
  );
};

export default SummaryAttachment;
