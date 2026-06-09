import { FormSummary } from '@navikt/ds-react';
import { submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import RenderComponent from '../../RenderComponent';
import FormSummaryAnswersNested from '../../shared/FormSummaryAnswersNested';
import { FormComponentProps } from '../../types';

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
              <RenderComponent
                {...props}
                key={`${component.key}-${navId}`}
                component={component}
                submissionPath={componentSubmissionPath}
              />
            );
          })}
        </FormSummaryAnswersNested>
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryFormGroup;
