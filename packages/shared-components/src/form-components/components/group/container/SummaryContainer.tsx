import { useForm } from '../../../../context/form/FormContext';
import RenderComponent from '../../../render/RenderComponent';
import { FormComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const SummaryContainer = ({ component, submissionPath, componentRegistry }: FormComponentProps) => {
  const { components, navId } = component;
  const { submission } = useForm();

  if (!components || formComponentUtils.noChildValues(submissionPath, components, submission)) {
    return null;
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

export default SummaryContainer;
