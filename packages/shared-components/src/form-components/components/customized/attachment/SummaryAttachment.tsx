import { FormSummary } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const SummaryAttachment = ({ component, submissionPath }: FormComponentProps) => {
  const { form, submission } = useForm();
  const { translate } = useLanguages();
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
        {value.showDeadline && form.properties?.ettersendelsesfrist && (
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

export default SummaryAttachment;
