import { Box, FormSummary, List } from '@navikt/ds-react';
import { submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import DefaultLabel from '../../shared/SummaryDefaultLabel';
import { FormComponentProps } from '../../types';

const isSelected = (value: unknown, optionValue: string) => {
  if (Array.isArray(value)) {
    return value.includes(optionValue);
  }

  if (value && typeof value === 'object') {
    return value[optionValue] === true;
  }

  return false;
};

const SummarySelectBoxes = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const { values, key, navId } = component;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || !values || values.length === 0) {
    return null;
  }

  const valueObjects = values
    .filter((checkbox) => isSelected(value, checkbox.value))
    .map((checkbox) => translate(checkbox.label));

  if (!valueObjects || valueObjects.length === 0) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>
        <Box marginBlock="space-16" asChild>
          <List data-aksel-migrated-v8>
            {valueObjects.map((boxValue) => (
              <List.Item key={`${key}-${navId}-${boxValue}`}>{boxValue}</List.Item>
            ))}
          </List>
        </Box>
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummarySelectBoxes;
