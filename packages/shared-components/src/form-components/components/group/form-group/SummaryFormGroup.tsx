import { FormSummary } from '@navikt/ds-react';
import RenderComponent from '../../../render/RenderComponent';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import FormSummaryAnswersNested from '../../shared/form-summary/FormSummaryAnswersNested';

const SummaryFormGroup = (props: FormComponentProps) => {
  const { submission, submissionPath, translate, component } = props;
  const { components, navId, legend } = component;

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
              <RenderComponent {...props} key={`${component.key}-${navId}`} submissionPath={componentSubmissionPath} />
            );
          })}
        </FormSummaryAnswersNested>
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryFormGroup;
