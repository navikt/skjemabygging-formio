import { FormSummary } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const SummaryAttachment = (props: FormComponentProps) => {
  const { submission, submissionPath, translate, component, formProperties } = props;
  const { label } = component;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || !value.key) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <FormSummary.Label>{translate(label)}</FormSummary.Label>
      <FormSummary.Value>
        {translate(TEXTS.statiske.attachment[value.key])}
        {value.additionalDocumentation && <div>{translate(value.additionalDocumentation)}</div>}
        {value.showDeadline && formProperties?.ettersendelsesfrist && (
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
