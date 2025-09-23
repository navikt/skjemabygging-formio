import { FormSummary } from '@navikt/ds-react';
import { useForm } from '../../../../context/form/FormContext';
import RenderComponent from '../../../render/RenderComponent';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';
import FormSummaryAnswersNested from '../../shared/form-summary/FormSummaryAnswersNested';

const SummaryFormGroup = ({ component, submissionPath, componentRegistry }: FormComponentProps) => {
  const { components, navId } = component;
  const { submission } = useForm();

  if (!components || formComponentUtils.noChildValues(submissionPath, components, submission)) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel component={component} />
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
