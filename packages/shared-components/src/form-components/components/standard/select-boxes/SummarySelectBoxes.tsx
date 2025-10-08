import { FormSummary, List } from '@navikt/ds-react';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

const SummarySelectBoxes = ({ component, submissionPath }: FormComponentProps) => {
  const { values, key, navId } = component;
  const { translate } = useLanguages();
  const { submission } = useForm();
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
      <DefaultLabel component={component} />
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
