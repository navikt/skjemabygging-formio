import { FormSummary } from '@navikt/ds-react';
import { currencyUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useForm } from '../../../../context/form/FormContext';
import RenderComponent from '../../../render/RenderComponent';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

const SummaryRow = ({ component, submissionPath, componentRegistry }: FormComponentProps) => {
  const { components, navId, isAmountWithCurrencySelector } = component;
  const { submission } = useForm();

  if (!components || formComponentUtils.noChildValues(submissionPath, components, submission)) {
    return null;
  }

  const getChildSubmissionValue = (type: string) => {
    return formComponentUtils.getSubmissionValue(
      `${submissionPath}.${components.find((c) => c.type === type)?.key}`,
      submission,
    );
  };

  if (isAmountWithCurrencySelector) {
    const currencyValue = currencyUtils.toLocaleString(getChildSubmissionValue('number'), {
      iso: true,
      currency: getChildSubmissionValue('valutavelger')?.value,
      integer: false,
    });

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
