import { PdfData, submissionUtils as formComponentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import renderPdfComponent from '../../RenderPdfComponent';
import { PdfComponentProps } from '../../types';

const PdfContainer = (props: PdfComponentProps): PdfData[] | null => {
  const { component, submissionPath, submission } = props;
  const { components } = component;

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
    .filter(Boolean) as PdfData[];
};

export default PdfContainer;
