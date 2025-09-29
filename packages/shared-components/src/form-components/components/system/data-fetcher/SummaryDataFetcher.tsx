import { FormSummary, List } from '@navikt/ds-react';
import { Component, dataFetcherUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import { DefaultLabel } from '../../shared/form-summary';

interface Props {
  component: Component;
  submissionPath: string;
}

const DefaultAnswer = ({ component, submissionPath }: Props) => {
  const { submission } = useForm();
  const { key, navId } = component;

  if (!submission) {
    return null;
  }

  const fetcher = dataFetcherUtils.dataFetcher(submissionPath, submission);
  if (!fetcher?.success) {
    return null;
  }

  const selected = fetcher.getAllSelected().map((item) => item.label);
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
