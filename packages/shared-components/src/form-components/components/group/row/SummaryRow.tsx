import { FormSummary } from '@navikt/ds-react';
import RenderComponent from '../../../render/RenderComponent';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import { getCurrencyValue } from './rowUtils';

const SummaryRow = (props: FormComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const { label } = component;
  const { components, navId, isAmountWithCurrencySelector } = component;

  if (!components || !submission || formComponentUtils.noChildValues(submissionPath, components, submission)) {
    return null;
  }

  if (isAmountWithCurrencySelector) {
    const currencyValue = getCurrencyValue(submissionPath, components, submission);

    return (
      <FormSummary.Answer>
        <FormSummary.Label>{translate(label)}</FormSummary.Label>
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
            {...props}
            key={`${component.key}-${navId}`}
            component={component}
            submissionPath={componentSubmissionPath}
          />
        );
      })}
    </>
  );
};

export default SummaryRow;
