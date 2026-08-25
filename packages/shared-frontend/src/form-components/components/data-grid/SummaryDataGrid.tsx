import { FormSummary } from '@navikt/ds-react';
import { submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import RenderComponent from '../../RenderComponent';
import FormSummaryAnswersNested from '../../shared/FormSummaryAnswersNested';
import DefaultLabel from '../../shared/SummaryDefaultLabel';
import { FormComponentProps } from '../../types';

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
