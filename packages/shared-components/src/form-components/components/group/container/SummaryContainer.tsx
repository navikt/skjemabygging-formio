import RenderComponent from '../../../render/RenderComponent';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const SummaryContainer = (props: FormComponentProps) => {
  const { submission, submissionPath, component } = props;
  const { components, navId } = component;

  if (!components || formComponentUtils.noChildValues(submissionPath, components, submission)) {
    return null;
  }

  return (
    <>
      {components?.map((component) => {
        const componentSubmissionPath = formComponentUtils.getComponentSubmissionPath(component, submissionPath);
        return (
          <RenderComponent
            {...props}
            component={component}
            key={`${component.key}-${navId}`}
            submissionPath={componentSubmissionPath}
          />
        );
      })}
    </>
  );
};

export default SummaryContainer;
