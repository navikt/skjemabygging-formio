import { FormSummary } from '@navikt/ds-react';
import RenderComponent from '../../../render/RenderComponent';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';
import FormSummaryAnswersNested from '../../shared/form-summary/FormSummaryAnswersNested';

const SummaryDataGrid = (props: FormComponentProps) => {
  const { submission, submissionPath, component } = props;
  const { components, navId } = component;
  const dataGridValues = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (
    !components ||
    dataGridValues === undefined ||
    formComponentUtils.noChildValuesForDataGrid(submissionPath, components, submission)
  ) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel {...props} />
      <FormSummary.Value>
        {dataGridValues?.map((_, index: number) => {
          return (
            <FormSummaryAnswersNested key={index}>
              {components?.map((component) => {
                const componentSubmissionPath = formComponentUtils.getComponentSubmissionPath(
                  component,
                  `${submissionPath}[${index}]`,
                );

                return (
                  <RenderComponent
                    {...props}
                    key={`${component.key}-${navId}-${index}`}
                    component={component}
                    submissionPath={componentSubmissionPath}
                  />
                );
              })}
            </FormSummaryAnswersNested>
          );
        })}
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryDataGrid;
