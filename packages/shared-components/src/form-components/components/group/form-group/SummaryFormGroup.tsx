import { FormSummary } from '@navikt/ds-react';
import { useForm } from '../../../../context/form/FormContext';
import { useLanguages } from '../../../../context/languages';
import RenderComponent from '../../../render/RenderComponent';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import FormSummaryAnswersNested from '../../shared/form-summary/FormSummaryAnswersNested';

const SummaryFormGroup = ({ component, submissionPath, componentRegistry }: FormComponentProps) => {
  const { components, navId, legend } = component;
  const { submission } = useForm();
  const { translate } = useLanguages();

  if (!components || formComponentUtils.noChildValues(submissionPath, components, submission)) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <FormSummary.Label>{translate(legend)}</FormSummary.Label>
      <FormSummary.Value>
        <FormSummaryAnswersNested>
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
        </FormSummaryAnswersNested>
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryFormGroup;
