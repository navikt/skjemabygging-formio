import { Alert, FileUpload, FormSummary, VStack } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import formComponentUtils from '../../../utils/formComponent';

const SummaryAttachmentUpload = ({ component }) => {
  const { form, submission } = useForm();
  const { translate } = useLanguages();
  const { label } = component;
  const submissionAttachment = submission?.attachments?.find(
    (attachment) => attachment.attachmentId === formComponentUtils.getNavId(component),
  );
  const showDeadline =
    submissionAttachment?.value && !!component.attachmentValues?.[submissionAttachment.value]?.showDeadline;
  const uploadedFiles = (submissionAttachment?.files ?? []).length > 0;

  if (submissionAttachment === undefined) {
    return null;
  }

  console.log('SummaryAttachmentUpload', submissionAttachment);
  console.log('Component', component);

  return (
    <FormSummary.Answer>
      <FormSummary.Label>{translate(label)}</FormSummary.Label>
      {uploadedFiles ? (
        <FormSummary.Value>
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
        <FormSummary.Value>
          {translate(TEXTS.statiske.attachment[submissionAttachment.value])}
          {submissionAttachment.additionalDocumentation && (
            <div>{translate(submissionAttachment.additionalDocumentation)}</div>
          )}
          {showDeadline && form.properties?.ettersendelsesfrist && (
            <Alert variant="warning">
              {translate(TEXTS.statiske.attachment.deadline, {
                deadline: form.properties?.ettersendelsesfrist,
              })}
            </Alert>
          )}
        </FormSummary.Value>
      )}
    </FormSummary.Answer>
  );
};

export default SummaryAttachmentUpload;
