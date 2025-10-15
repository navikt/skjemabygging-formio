import { FormSummary } from '@navikt/ds-react';
import { useForm } from '../../../../context/form/FormContext';
import RenderComponent from '../../../render/RenderComponent';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';
import { getCurrencyValue } from './rowUtils';

const SummaryRow = ({ component, submissionPath, componentRegistry }: FormComponentProps) => {
  const { components, navId, isAmountWithCurrencySelector } = component;
  const { submission } = useForm();

  if (!components || !submission || formComponentUtils.noChildValues(submissionPath, components, submission)) {
    return null;
  }

  if (isAmountWithCurrencySelector) {
    const currencyValue = getCurrencyValue(submissionPath, components, submission);

    return (
      <FormSummary.Answer>
        <DefaultLabel
          component={{
            ...component,
            hideLabel: false,
          }}
        />
        <FormSummary.Value>{currencyValue}</FormSummary.Value>
      </FormSummary.Answer>
    );
  }

  return (
    <>
      {components?.map((component) => {
        const componentSubmissionPath = formComponentUtils.getComponentSubmissionPath(component, submissionPath);

        return (
          <RenderComponent
            key={`${component.key}-${navId}`}
            component={component}
            submissionPath={componentSubmissionPath}
            componentRegistry={componentRegistry}
          />
        );
      })}
    </>
  );
};

export default SummaryRow;
