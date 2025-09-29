import { useForm } from '../../../../context/form/FormContext';
import renderPdfComponent from '../../../render/RenderPdfComponent';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfContainer = ({ component, submissionPath, componentRegistry }: PdfComponentProps) => {
  const { components } = component;
  const { submission } = useForm();

  if (!components || formComponentUtils.noChildValues(submissionPath, components, submission)) {
    return null;
  }

  return components
    ?.flatMap((component) => {
      const componentSubmissionPath = formComponentUtils.getComponentSubmissionPath(component, submissionPath);

      return renderPdfComponent({
        component: component,
        submissionPath: componentSubmissionPath,
        componentRegistry,
      });
    })
    .filter(Boolean);
};

export default PdfContainer;
