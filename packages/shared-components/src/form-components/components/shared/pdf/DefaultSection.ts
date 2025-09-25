import { useLanguages } from '../../../../context/languages';
import renderPdfComponent from '../../../render/RenderPdfComponent';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const DefaultSection = ({ component, submissionPath, componentRegistry }: PdfComponentProps) => {
  const { title, components } = component;
  const { translate } = useLanguages();

  if (!components || components.length === 0) {
    return null;
  }

  const componentValues = components
    .flatMap((component) => {
      const componentSubmissionPath = formComponentUtils.getComponentSubmissionPath(component, submissionPath);
      return renderPdfComponent({
        component: component,
        submissionPath: componentSubmissionPath,
        componentRegistry,
      });
    })
    .filter(Boolean);

  if (componentValues.length === 0) {
    return null;
  }

  return {
    label: translate(title) ?? '',
    verdiliste: componentValues,
  };
};

export default DefaultSection;
