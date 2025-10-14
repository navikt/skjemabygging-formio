import renderPdfComponent from '../../../render/RenderPdfComponent';
import { PdfComponentProps, PdfListElement } from '../../../types';
import formComponentUtils from '../../../utils/formComponent';

const PdfContainer = (props: PdfComponentProps): PdfListElement => {
  const { component, submissionPath, formContextValue } = props;
  const { components } = component;
  const { submission } = formContextValue;

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
    .filter(Boolean) as PdfListElement;
};

export default PdfContainer;
