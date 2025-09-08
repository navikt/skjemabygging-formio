import { FormSummary } from '@navikt/ds-react';
import { useForm } from '../../../../context/form/FormContext';
import RenderComponent from '../../../render/RenderComponent';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';
import DefaultLabel from '../../shared/form-summary/DefaultLabel';

const SummaryDataGrid = ({ component, submissionPath, componentRegistry }: FormComponentProps) => {
  const { components, navId } = component;
  const { submission } = useForm();
  const dataGridValues = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (
    !components ||
    dataGridValues === undefined ||
    formComponentUtils.noChildValues(submissionPath, components, submission)
  ) {
    return null;
  }

  return (
    <FormSummary.Answer>
      <DefaultLabel component={component} />
      <FormSummary.Value>
        <FormSummary.Answers>
          {dataGridValues?.map((_, index: number) => {
            return components?.map((component) => {
              const componentSubmissionPath = formComponentUtils.getComponentSubmissionPath(
                component,
                `${submissionPath}[${index}]`,
              );

              return (
                <RenderComponent
                  key={`${component.key}-${navId}-${index}`}
                  component={component}
                  submissionPath={componentSubmissionPath}
                  componentRegistry={componentRegistry}
                />
              );
            });
          })}
        </FormSummary.Answers>
      </FormSummary.Value>
    </FormSummary.Answer>
  );
};

export default SummaryDataGrid;
