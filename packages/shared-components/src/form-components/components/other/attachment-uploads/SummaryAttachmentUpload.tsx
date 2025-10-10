import { FormSummary } from '@navikt/ds-react';
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

  if (submissionAttachment === undefined) {
    return null;
  }

  console.log('SummaryAttachmentUpload', submissionAttachment);
  console.log('Component', component);

  return (
    <FormSummary.Answer>
      <FormSummary.Label>{translate(label)}</FormSummary.Label>
      <FormSummary.Value>
        {translate(TEXTS.statiske.attachment[submissionAttachment.value])}
        {submissionAttachment.additionalDocumentation && (
          <div>{translate(submissionAttachment.additionalDocumentation)}</div>
        )}
        {component.showDeadline && form.properties?.ettersendelsesfrist && (
          <div>
            {translate(TEXTS.statiske.attachment.deadline, {
              deadline: form.properties?.ettersendelsesfrist,
            })}
          </div>
        )}
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryAttachmentUpload;
