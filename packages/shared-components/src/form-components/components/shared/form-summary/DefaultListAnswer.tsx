import { FormSummary } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from './DefaultLabel';

interface Props {
  component: Component;
  submissionPath: string;
}

const DefaultListAnswer = ({ component, submissionPath }: Props) => {
  const { values } = component;
  const { translate } = useLanguages();
  const { submission } = useForm();
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
      <DefaultLabel component={component} />
      <FormSummary.Value>{translate(valueObject.label)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default DefaultListAnswer;
