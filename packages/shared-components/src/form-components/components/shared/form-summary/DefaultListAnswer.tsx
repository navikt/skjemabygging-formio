import { FormSummary } from '@navikt/ds-react';
import { submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { FormComponentProps } from '../../../types';
import DefaultLabel from './DefaultLabel';

const DefaultListAnswer = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const { values } = component;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (!values || value === undefined) {
    return null;
  }

  const valueObject = values.find((valueObject) => String(valueObject.value) === String(value?.value ?? value));

  if (!valueObject) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>{translate(valueObject.label)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default DefaultListAnswer;
