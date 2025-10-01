import renderPdfComponent from '../../../render/RenderPdfComponent';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const DefaultSection = (props: PdfComponentProps) => {
  const { component, submissionPath, languagesContext } = props;
  const { title, label, components } = component;
  const { translate } = languagesContext;

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
    label: translate(title) ?? translate(label) ?? '',
    verdiliste: componentValues,
  };
};

export default DefaultSection;
