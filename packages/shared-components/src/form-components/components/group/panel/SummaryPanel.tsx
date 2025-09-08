import { FormSummary } from '@navikt/ds-react';
import RenderComponent from '../../../render/RenderComponent';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const SummaryPanel = ({ component, submissionPath, componentRegistry }: FormComponentProps) => {
  const { title, components, navId } = component;

  return (
    <FormSummary>
      <FormSummary.Header>
        <FormSummary.Heading level="2">{title}</FormSummary.Heading>
        <FormSummary.EditLink href="#" />
      </FormSummary.Header>
      <FormSummary.Answers>
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
      </FormSummary.Answers>
    </FormSummary>
  );
};

export default SummaryPanel;
