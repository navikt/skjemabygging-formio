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

const DefaultSelectAnswer = ({ component, submissionPath }: Props) => {
  const { translate } = useLanguages();
  const { submission } = useForm();
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value?.label === undefined) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel component={component} />
      <FormSummary.Value>{translate(value?.label)}</FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default DefaultSelectAnswer;
