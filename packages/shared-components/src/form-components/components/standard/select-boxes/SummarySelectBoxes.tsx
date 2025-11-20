import { FormSummary, List } from '@navikt/ds-react';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

const SummarySelectBoxes = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const { values, key, navId } = component;
  const value = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (value === undefined || !values || values.length === 0) {
    return null;
  }

  const valueObjects = values
    .filter((checkbox) => value[checkbox.value] === true)
    .map((checkbox) => translate(checkbox.label));

  if (!valueObjects || valueObjects.length === 0) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>
        <List>
          {valueObjects.map((boxValue) => (
            <List.Item key={`${key}-${navId}-${boxValue}`}>{boxValue}</List.Item>
          ))}
        </List>
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummarySelectBoxes;
