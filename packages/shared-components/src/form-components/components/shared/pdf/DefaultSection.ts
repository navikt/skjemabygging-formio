import renderPdfComponent from '../../../render/RenderPdfComponent';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const DefaultSection = (props: PdfComponentProps) => {
  const { component, submissionPath, translate } = props;
  const { title, label, legend, components } = component;

  if (!components || components.length === 0) {
    return null;
  }

  const componentValues = components
    .flatMap((component) => {
      const componentSubmissionPath = formComponentUtils.getComponentSubmissionPath(component, submissionPath);
      return renderPdfComponent({
        ...props,
        component: component,
        submissionPath: componentSubmissionPath,
      });
    })
    .filter(Boolean);

  if (componentValues.length === 0) {
    return null;
  }

  return {
    label: title ? translate(title) : legend ? translate(legend) : translate(label),
    verdiliste: componentValues,
  };
};

export default DefaultSection;
