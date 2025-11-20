import { FormSummary, List } from '@navikt/ds-react';
import { FormComponentProps } from '../../../types';
import { DefaultLabel } from '../../shared/form-summary';
import { getSelectedValues } from './dataFetcherUtils';

const DefaultAnswer = (props: FormComponentProps) => {
  const { component, submissionPath, submission } = props;
  const { key, navId } = component;

  const selected = getSelectedValues(submissionPath, submission);
  if (selected.length === 0) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
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
