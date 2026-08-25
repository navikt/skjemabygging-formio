import { FormSummary } from '@navikt/ds-react';
import {
  attachmentUtils,
  submissionUtils as formComponentUtils,
  TEXTS,
} from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../types';

const SummaryAttachment = (props: FormComponentProps) => {
  const { submission, submissionPath, translate, component, formProperties, rendererConfig } = props;
  const { label } = component;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);
  const showDeadline = value?.key && component.attachmentValues?.[value.key]?.showDeadline;

  if (value === undefined || !value.key) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <FormSummary.Label>{translate(label)}</FormSummary.Label>
      <FormSummary.Value>
        {translate(attachmentUtils.getAttachmentLabel(value.key, rendererConfig.submissionMethod))}
        {value.additionalDocumentation && <div>{translate(value.additionalDocumentation)}</div>}
        {showDeadline && formProperties?.ettersendelsesfrist && (
          <div>
            {translate(TEXTS.statiske.attachment.deadline, {
              deadline: formProperties?.ettersendelsesfrist,
            })}
          </div>
        )}
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryAttachment;
