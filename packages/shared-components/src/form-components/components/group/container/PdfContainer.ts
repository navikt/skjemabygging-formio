import renderPdfComponent from '../../../render/RenderPdfComponent';
import { PdfComponentProps } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfContainer = (props: PdfComponentProps) => {
  const { component, submissionPath, formContext } = props;
  const { components } = component;
  const { submission } = formContext;

  if (!components || formComponentUtils.noChildValues(submissionPath, components, submission)) {
    return null;
  }

  return components
    ?.flatMap((component) => {
      const componentSubmissionPath = formComponentUtils.getComponentSubmissionPath(component, submissionPath);

      return renderPdfComponent({
        ...props,
        component: component,
        submissionPath: componentSubmissionPath,
      });
    })
    .filter(Boolean);
};

export default PdfContainer;
