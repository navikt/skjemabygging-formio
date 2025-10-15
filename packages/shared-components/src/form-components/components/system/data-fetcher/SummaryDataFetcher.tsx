import { FormSummary, List } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { DefaultLabel } from '../../shared/form-summary';
import { getSelectedValues } from './dataFetcherUtils';

interface Props {
  component: Component;
  submissionPath: string;
}

const DefaultAnswer = ({ component, submissionPath }: Props) => {
  const { submission } = useForm();
  const { key, navId } = component;

  const selected = getSelectedValues(submissionPath, submission);
  if (selected.length === 0) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel component={component} />
      <FormSummary.Value>
        <List>
          {selected.map((value) => (
            <List.Item key={`${key}-${navId}-${value}`}>{value}</List.Item>
          ))}
        </List>
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default DefaultAnswer;
