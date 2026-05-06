import { Box, FormSummary, List } from '@navikt/ds-react';
import { DefaultLabel } from '../../shared/form-summary';
import { FormComponentProps } from '../../types';
import { getSelectedValues } from './dataFetcherUtils';

const SummaryDataFetcher = (props: FormComponentProps) => {
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
        <Box marginBlock="space-16" asChild>
          <List data-aksel-migrated-v8>
            {selected.map((value) => (
              <List.Item key={`${key}-${navId}-${value}`}>{value}</List.Item>
            ))}
          </List>
        </Box>
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryDataFetcher;
